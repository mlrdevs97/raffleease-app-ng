import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

@Component({
  selector: 'app-raffle-tickets',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './raffle-tickets.component.html'
})
export class RaffleTicketsComponent {
  @Input() formGroup!: FormGroup;
  @Input() fieldErrors: Record<string, string> = {};
  
  clientValidationMessages = ClientValidationMessages;

  getErrorMessage(fieldName: string): string | null {
    const control = this.formGroup.get(fieldName);

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
} 