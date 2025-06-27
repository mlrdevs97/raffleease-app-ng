import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SuccessMessages } from '../../../../core/constants/success-messages';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);

  forgotPasswordForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  validationMessages = ClientValidationMessages;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (!this.forgotPasswordForm.valid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.resetMessages();

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.successMessage.set(SuccessMessages.auth.passwordResetRequested);
        this.forgotPasswordForm.reset();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.applyFieldErrors(validationErrors);
        }
        this.isLoading.set(false);
      }
    });
  }

  private applyFieldErrors(errors: Record<string, string>): void {
    this.fieldErrors.set(errors);
    
    Object.keys(errors).forEach(fieldPath => {
      const control = this.forgotPasswordForm.get(fieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: errors[fieldPath] });
      }
    });
  }

  private resetMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set({});
  }

  getFieldErrorMessage(fieldName: string): string | null {
    const control = this.forgotPasswordForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    if (control.errors['required']) {
      return this.validationMessages.common.required;
    } else if (control.errors['email']) {
      return this.validationMessages.common.email;
    }

    return null;
  }
}
