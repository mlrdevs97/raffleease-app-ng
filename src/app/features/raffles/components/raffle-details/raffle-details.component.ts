import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-raffle-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './raffle-details.component.html'
})
export class RaffleDetailsComponent {
  @Input() formGroup!: FormGroup;
  @Input() fieldErrors: Record<string, string> = {};

  getErrorMessage(fieldName: string): string | null {
    const control = this.formGroup.get(fieldName);
    if (!control?.touched || !control.errors) return null;

    if (control.errors['required']) {
      return 'This field is required';
    } else if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    } else if (control.errors['serverError']) {
      return this.fieldErrors[fieldName] || 'Server error';
    }
    
    return null;
  }
} 