import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownSelectComponent } from '../dropdown-select/dropdown-select.component';
import { PaymentMethods } from '../../../core/models/payment.model';
import { ConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.component';
import { ClientValidationMessages } from '../../../core/constants/client-validation-messages';
import { ButtonComponent } from '../button/button.component';

export interface OrderConfirmationData extends ConfirmationDialogData {
  requiresPaymentMethod?: boolean;
}

export interface OrderConfirmationResult {
  paymentMethod?: PaymentMethods;
}

@Component({
  selector: 'app-order-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownSelectComponent, ButtonComponent],
  templateUrl: './order-confirmation-dialog.component.html'
})
export class OrderConfirmationDialogComponent {
  @Input() isLoading = signal(false);
  @Input() isOpen = signal(false);
  @Input() data: OrderConfirmationData = {
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    requiresPaymentMethod: false
  };
  @Output() confirmed = new EventEmitter<OrderConfirmationResult>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  paymentMethodOptions = Object.values(PaymentMethods);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      paymentMethod: ['', Validators.required]
    });
  }

  onConfirm(): void {
    if (this.data.requiresPaymentMethod) {
      if (this.form.valid) {
        this.confirmed.emit({
          paymentMethod: this.form.value.paymentMethod
        });
      } else {
        this.form.markAllAsTouched();
      }
    } else {
      this.confirmed.emit({});
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && this.isOpen()) {
      this.onCancel();
    }
  }

  get paymentMethodError(): string | null {
    const control = this.form.get('paymentMethod');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) {
        return ClientValidationMessages.paymentMethod.required;
      }
    }
    return null;
  }
} 