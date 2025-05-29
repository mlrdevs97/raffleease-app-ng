import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-additional-information',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './additional-information.component.html'
})
export class AdditionalInformationComponent {
    @Input() additionalInformationForm!: FormGroup;
}