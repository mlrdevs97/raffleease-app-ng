import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

@Component({
  selector: 'app-raffle-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './raffle-details.component.html'
})
export class RaffleDetailsComponent {
  @Input() formGroup!: FormGroup;
  @Input() fieldErrors: Record<string, string> = {};
  
  clientValidationMessages = ClientValidationMessages;

  getErrorMessage(fieldName: string): string | null {
    const control = this.formGroup.get(fieldName);
    if (!control?.touched || !control.errors) return null;

    if (control.errors['required']) {
      return this.clientValidationMessages.common.required;
    } else if (control.errors['maxlength']) {
      return this.clientValidationMessages.common.maxlength(control.errors['maxlength'].requiredLength);
    } else if (control.errors['serverError']) {
      return this.fieldErrors[fieldName] || this.clientValidationMessages.common.serverError;
    }
    
    return null;
  }
} 