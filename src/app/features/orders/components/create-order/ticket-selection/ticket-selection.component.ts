import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpecificTicketSelectionComponent } from '../specific-ticket-selection/specific-ticket-selection.component';
import { RandomTicketSelectionComponent } from '../random-ticket-selection/random-ticket-selection.component';
import { TicketSelectionTabsComponent } from '../tickets-selection-tab/tickets-selection-tab.component';
import { TicketsPreviewComponent } from '../tickets-preview/tickets-preview.component';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

@Component({
    selector: 'app-ticket-selection',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        TicketSelectionTabsComponent,
        SpecificTicketSelectionComponent,
        RandomTicketSelectionComponent,
        TicketsPreviewComponent,
    ],
    templateUrl: './ticket-selection.component.html'
})
export class TicketSelectionComponent implements OnInit {
    @Input() ticketSelectionForm!: FormGroup;
    @Input() fieldErrors: Record<string, string> = {};
    @Input() raffleId: number | null = null;
    clientValidationMessages = ClientValidationMessages;

    ngOnInit(): void {
        if (!this.ticketSearchType) {
            this.ticketSelectionForm.get('ticketSearchType')?.setValue('specific');
        }
    }

    onTabSelected(tabType: 'specific' | 'random'): void {
        this.ticketSelectionForm.get('ticketSearchType')?.setValue(tabType);
    }

    onTicketRemoved(ticketNumber: string): void {
        const currentTicketNumber = this.ticketSelectionForm.get('ticketNumber')?.value;
        if (currentTicketNumber === ticketNumber) {
            this.ticketSelectionForm.get('ticketNumber')?.setValue('');
        }
    }

    get ticketSearchType(): 'specific' | 'random' {
        return this.ticketSelectionForm.get('ticketSearchType')?.value || 'specific';
    }

    get isSpecificMode(): boolean {
        return this.ticketSearchType === 'specific';
    }

    get isRandomMode(): boolean {
        return this.ticketSearchType === 'random';
    }

    get isDisabled(): boolean {
        return !this.raffleId;
    }
}