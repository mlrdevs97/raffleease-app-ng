import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpecificTicketSelectionComponent } from '../specific-ticket-selection/specific-ticket-selection.component';
import { RandomTicketSelectionComponent } from '../random-ticket-selection/random-ticket-selection.component';
import { TicketSelectionTabsComponent } from '../tickets-selection-tab/tickets-selection-tab.component';

@Component({
    selector: 'app-ticket-selection',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        TicketSelectionTabsComponent,
        SpecificTicketSelectionComponent,
        RandomTicketSelectionComponent
    ],
    templateUrl: './ticket-selection.component.html'
})
export class TicketSelectionComponent implements OnInit {
    @Input() ticketSelectionForm!: FormGroup;
    
    ngOnInit(): void {
        // Set 'specific' as the default ticket search type if not already set
        if (!this.ticketSelectionForm.get('ticketSearchType')?.value) {
            this.ticketSelectionForm.get('ticketSearchType')?.setValue('specific');
        }
    }
    
    onTabSelected(tabType: 'specific' | 'random'): void {
        this.ticketSelectionForm.get('ticketSearchType')?.setValue(tabType);
    }
}