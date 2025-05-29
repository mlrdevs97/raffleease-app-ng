import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
}