import { Component, Input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { ErrorMessages } from '../../../../../core/constants/error-messages';
import { RandomTicketService } from '../../../services/random-ticket.service';
import { TicketSelectionService } from '../../../services/ticket-selection.service';
import { RaffleQueryService } from '../../../../raffles/services/raffle-query.service';
import { CartService } from '../../../services/cart.service';
import { Ticket } from '../../../../../core/models/ticket.model';
import { Raffle } from '../../../../raffles/models/raffle.model';
import { Cart } from '../../../../../core/models/cart.model';
import { createOrderTickets } from '../../../../../core/utils/ticket.utils';

@Component({
    selector: 'app-random-ticket-selection',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './random-ticket-selection.component.html'
})
export class RandomTicketSelectionComponent {
    @Input() parentFormGroup!: FormGroup;
    @Input() fieldErrors: Record<string, string> = {};
    @Input() raffleId: number | null = null;
    @Input() disabled = false;
    
    clientValidationMessages = ClientValidationMessages;
    selectedRaffle = signal<Raffle | null>(null);
    
    errorMessage = signal<string | null>(null);
    isGeneratingTickets = signal(false);

    constructor(
        private randomTicketService: RandomTicketService,
        private ticketSelectionService: TicketSelectionService,
        private raffleQueryService: RaffleQueryService,
        private cartService: CartService,
        private errorHandler: ErrorHandlerService
    ) {}

    getErrorMessage(fieldName: string): string | null {
        const control = this.parentFormGroup.get(fieldName);
        if (!control?.touched || !control.errors) return null;

        if (control.errors['required']) {
            return this.clientValidationMessages.common.required;
        } else if (control.errors['min']) {
            return this.clientValidationMessages.common.min(control.errors['min'].min);
        } else if (control.errors['serverError']) {
            return this.fieldErrors[fieldName] || this.clientValidationMessages.common.serverError;
        }
        
        return null;
    }

    get isRaffleSelected(): boolean {
        return !!this.raffleId;
    }

    get isLoading(): boolean {
        return this.randomTicketService.getIsLoading()() || this.isGeneratingTickets() || this.cartService.getIsReservingTickets()();
    }

    resetErrors(): void {
        this.errorMessage.set(null);
    }
    onEnterKeyPressed(event: Event): void {
        event.preventDefault();
        this.onGetRandomTickets();
    }

    onGetRandomTickets(): void {
        if (!this.isRaffleSelected) {
            this.errorMessage.set(ErrorMessages.dedicated['raffle']['SELECTION_REQUIRED']!);
            return;
        }

        const quantity = this.parentFormGroup.get('quantity')?.value;
        if (!quantity || quantity < 1) {
            this.errorMessage.set(ErrorMessages.dedicated['tickets']['INVALID_QUANTITY']!);
            return;
        }

        this.resetErrors();
        this.isGeneratingTickets.set(true);
        
        this.loadRaffleAndGenerateTickets(quantity);
    }

    private loadRaffleAndGenerateTickets(quantity: number): void {
        const raffle = this.selectedRaffle();
        
        if (raffle) {
            this.generateRandomTickets(raffle, quantity);
        } else if (this.raffleId) {
            this.raffleQueryService.getById(this.raffleId).subscribe({
                next: (raffle: Raffle) => {
                    this.selectedRaffle.set(raffle);
                    this.generateRandomTickets(raffle, quantity);
                },
                error: (error) => {
                    this.errorMessage.set(this.errorHandler.getErrorMessage(error));
                    this.isGeneratingTickets.set(false);
                }
            });
        }
    }

    private generateRandomTickets(raffle: Raffle, quantity: number): void {
        this.randomTicketService.getRandomTickets(this.raffleId!, quantity).subscribe({
            next: (tickets: Ticket[]) => {
                this.reserveAndAddTickets(tickets, raffle);
            },
            error: (error) => {
                this.errorMessage.set(this.errorHandler.getErrorMessage(error));
                this.isGeneratingTickets.set(false);
            }
        });
    }

    private reserveAndAddTickets(tickets: Ticket[], raffle: Raffle): void {
        const ticketIds = tickets.map(ticket => ticket.id);
        
        this.cartService.reserveTickets(ticketIds).subscribe({
            next: (updatedCart: Cart) => {
                try {
                    const orderTickets = createOrderTickets(tickets, raffle);
                    this.ticketSelectionService.addTickets(orderTickets);
                    this.isGeneratingTickets.set(false);
                } catch (error) {
                    this.errorMessage.set(ErrorMessages.dedicated['tickets']['ADDITION_FAILED']!);
                    this.isGeneratingTickets.set(false);
                }
            },
            error: (error) => {
                this.isGeneratingTickets.set(false);
                this.cartService.resetReservingState();
                this.errorMessage.set(this.errorHandler.getErrorMessage(error));
            }
        });
    }
}