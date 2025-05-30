import { Component, Input, OnInit, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { ErrorMessages } from '../../../../../core/constants/error-messages';
import { TicketSearchComponent } from '../ticket-search/ticket-search.component';
import { TicketSearchService } from '../../../services/ticket-search.service';
import { TicketSelectionService } from '../../../services/ticket-selection.service';
import { RaffleQueryService } from '../../../../raffles/services/raffle-query.service';
import { CartService } from '../../../services/cart.service';
import { Ticket, TicketStatus } from '../../../../../core/models/ticket.model';
import { Raffle } from '../../../../raffles/models/raffle.model';
import { Cart } from '../../../../../core/models/cart.model';
import { createOrderTicket } from '../../../../../core/utils/ticket.utils';

@Component({
    selector: 'app-specific-ticket-selection',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        TicketSearchComponent
    ],
    templateUrl: './specific-ticket-selection.component.html'
})
export class SpecificTicketSelectionComponent implements OnInit, OnDestroy {
    @Input() parentFormGroup!: FormGroup;
    @Input() fieldErrors: Record<string, string> = {};
    @Input() raffleId: number | null = null;
    @Input() disabled = false;

    selectedTicket = signal<Ticket | null>(null);
    selectedRaffle = signal<Raffle | null>(null);
    clientValidationMessages = ClientValidationMessages;

    errorMessage = signal<string | null>(null);
    isAddingTicket = signal(false);

    private lastSearchTerm: string = '';

    @ViewChild(TicketSearchComponent) ticketSearchComponent!: TicketSearchComponent;

    constructor(
        public ticketSearchService: TicketSearchService,
        private ticketSelectionService: TicketSelectionService,
        private raffleQueryService: RaffleQueryService,
        private cartService: CartService,
        private errorHandler: ErrorHandlerService
    ) {
        if (this.raffleId) {
            this.loadRaffleData(this.raffleId);
        }
    }

    ngOnInit(): void {
        this.ticketSearchService.initializeSearch(1, 300);
    }

    ngOnDestroy(): void {
        this.ticketSearchService.destroySubscription();
        this.ticketSearchService.resetSearch();
    }

    resetErrors(): void {
        this.errorMessage.set(null);
        this.ticketSearchService.clearError();
    }

    private loadRaffleData(raffleId: number): void {
        this.raffleQueryService.getById(raffleId).subscribe({
            next: (raffle: Raffle) => {
                this.selectedRaffle.set(raffle);
            },
            error: (error) => {
                this.selectedRaffle.set(null);
                this.errorMessage.set(this.errorHandler.getErrorMessage(error));
            }
        });
    }

    getErrorMessage(fieldName: string): string | null {
        const control = this.parentFormGroup.get(fieldName);
        if (!control?.touched || !control.errors) return null;

        if (control.errors['required']) {
            return this.clientValidationMessages.common.required;
        } else if (control.errors['serverError']) {
            return this.fieldErrors[fieldName] || this.clientValidationMessages.common.serverError;
        }

        return null;
    }

    get isLoading(): boolean {
        return this.isAddingTicket() || this.cartService.getIsReservingTickets()();
    }

    onSearchChange(searchTerm: string): void {
        if (!this.raffleId) {
            return;
        }

        this.resetErrors();
        this.lastSearchTerm = searchTerm;
        this.ticketSearchService.search(searchTerm, this.raffleId!, TicketStatus.AVAILABLE);

        if (searchTerm.trim().length === 0) {
            this.selectedTicket.set(null);
            this.parentFormGroup.get('ticketNumber')?.setValue('');
        }
    }

    onEnterPressed(searchTerm: string): void {
        if (!this.raffleId) {
            return;
        }

        this.resetErrors();
        this.parentFormGroup.get('ticketNumber')?.setValue(searchTerm);
        this.selectedTicket.set(null);
        this.ticketSearchService.clearSuggestions();
    }

    onSuggestionSelected(ticket: Ticket): void {
        this.selectedTicket.set(ticket);
        this.parentFormGroup.get('ticketNumber')?.setValue(ticket.ticketNumber);
        this.ticketSearchComponent.clearSearch();
        this.reserveAndAddTicket(ticket);
    }

    onManualInputChange(): void {
        this.selectedTicket.set(null);
        this.resetErrors();
    }

    private reserveAndAddTicket(ticket: Ticket): void {
        const raffle = this.selectedRaffle();

        if (raffle) {
            this.performTicketReservation(ticket, raffle);
        } else if (this.raffleId) {
            this.isAddingTicket.set(true);
            this.resetErrors();

            this.raffleQueryService.getById(this.raffleId).subscribe({
                next: (raffle: Raffle) => {
                    this.selectedRaffle.set(raffle);
                    this.performTicketReservation(ticket, raffle);
                },
                error: (error) => {
                    this.isAddingTicket.set(false);
                    this.errorMessage.set(this.errorHandler.getErrorMessage(error));
                    this.parentFormGroup.get('ticketNumber')?.setValue('');
                    this.selectedTicket.set(null);
                    this.ticketSearchComponent.clearSearch();
                }
            });
        } else {
            this.errorMessage.set(ErrorMessages.dedicated['raffle']['SELECTION_REQUIRED']!);
        }
    }

    /**
     * Perform the actual ticket reservation and addition to selection
     */
    private performTicketReservation(ticket: Ticket, raffle: Raffle): void {
        this.isAddingTicket.set(true);
        this.resetErrors();

        this.cartService.reserveTickets([ticket.id]).subscribe({
            next: (updatedCart: Cart) => {
                try {
                    console.log(updatedCart);
                    const orderTicket = createOrderTicket(ticket, raffle);
                    this.ticketSelectionService.addTicket(orderTicket);
                    this.isAddingTicket.set(false);
                    this.parentFormGroup.get('ticketNumber')?.setValue('');
                    this.selectedTicket.set(null);
                    this.ticketSearchComponent.clearSearch();

                    // Force refresh search results to remove the now-reserved ticket
                    if (this.lastSearchTerm && this.raffleId) {
                        this.ticketSearchService.forceRefreshSearch(
                            this.lastSearchTerm, 
                            this.raffleId, 
                            TicketStatus.AVAILABLE
                        );
                    }
                } catch (error) {
                    this.errorMessage.set(ErrorMessages.dedicated['tickets']['ADDITION_FAILED']!);
                    this.isAddingTicket.set(false);
                }
            },
            error: (error) => {
                this.isAddingTicket.set(false);
                this.cartService.resetReservingState();
                this.errorMessage.set(this.errorHandler.getErrorMessage(error));
                this.parentFormGroup.get('ticketNumber')?.setValue('');
                this.selectedTicket.set(null);
                this.ticketSearchComponent.clearSearch();
            }
        });
    }

    get suggestions() {
        return this.ticketSearchService.suggestions();
    }

    get isSearchLoading() {
        return this.ticketSearchService.isSearchLoading();
    }

    get noSearchResults() {
        return this.ticketSearchService.noSearchResults();
    }
}