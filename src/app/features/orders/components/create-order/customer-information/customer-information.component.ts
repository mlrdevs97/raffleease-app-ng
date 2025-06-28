import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PhoneNumberInputComponent } from '../../../../../shared/components/phone-number-input/phone-number-input.component';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

@Component({
    selector: 'app-customer-information',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        PhoneNumberInputComponent
    ],
    templateUrl: './customer-information.component.html'
})
export class CustomerInformationComponent {
    @Input() customerInformationForm!: FormGroup;
    @Input() fieldErrors: Record<string, string> = {};

    clientValidationMessages = ClientValidationMessages;

    get prefixControl(): FormControl {
        return this.customerInformationForm.get('phoneNumber.countryCode') as FormControl;
    }

    get nationalNumberControl(): FormControl {
        return this.customerInformationForm.get('phoneNumber.nationalNumber') as FormControl;
    }

    getErrorMessage(fieldName: string): string | null {
        const control = this.customerInformationForm.get(fieldName);
        if (!control?.touched || !control.errors) return null;

        if (control.errors['required']) {
            return this.clientValidationMessages.common.required;
        } else if (control.errors['email']) {
            return this.clientValidationMessages.common.email;
        } else if (control.errors['maxlength']) {
            return this.clientValidationMessages.common.maxlength(control.errors['maxlength'].requiredLength);
        } else if (control.errors['pattern']) {
            return this.clientValidationMessages.common.pattern;
        } else if (control.errors['serverError']) {
            return this.fieldErrors[fieldName] || this.clientValidationMessages.common.serverError;
        }
        
        return null;
    }
}