import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-specific-ticket-selection',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule 
    ],
    templateUrl: './specific-ticket-selection.component.html'
})
export class SpecificTicketSelectionComponent {
    @Input() parentFormGroup!: FormGroup;   
}