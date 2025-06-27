import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProfilesService } from '../../services/profiles.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UpdatePasswordRequest, PasswordFormData } from '../../models/profile.model';
import { ConfirmationMessages } from '../../../../core/constants/confirmation-messages';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';
import { ErrorCodes } from '../../../../core/constants/error-codes';

// Custom validator for password match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  
  if (password && confirmPassword && password !== confirmPassword) {
    return { mismatch: true };
  }
  
  return null;
}

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ConfirmationDialogComponent],
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent {
  @Input() userId: number | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  passwordForm: FormGroup;
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showConfirmDialog = signal(false);
  showPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  validationMessages = ClientValidationMessages;

  confirmDialogData: ConfirmationDialogData = ConfirmationMessages.profile.confirmPasswordUpdate;

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\-$_%^&*(),.?":{}|<>]).{8,32}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: passwordMatchValidator 
    });
  }

  onSubmit(): void {
    if (!this.passwordForm.valid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.showConfirmDialog.set(true);
  }

  onConfirmUpdate(): void {
    if (!this.userId || !this.passwordForm.valid) return;

    this.isSaving.set(true);
    this.resetMessages();
    this.showConfirmDialog.set(false);

    const formData: PasswordFormData = this.passwordForm.value;
    const updateRequest: UpdatePasswordRequest = {
      currentPassword: formData.currentPassword,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };

    this.profilesService.updatePassword(this.userId, updateRequest).subscribe({
      next: () => {
        this.successMessage.set('Password updated successfully');
        this.passwordForm.reset();
        this.isSaving.set(false);
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (error) => {
        if (this.errorHandler.isErrorOfType(error, ErrorCodes.CURRENT_PASSWORD_INCORRECT)) {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
          this.passwordForm.get('currentPassword')?.setErrors({ serverError: this.errorHandler.getErrorMessage(error) });
          this.passwordForm.get('currentPassword')?.markAsTouched();
        } else if (this.errorHandler.isErrorOfType(error, ErrorCodes.PASSWORD_SAME_AS_CURRENT)) {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
          this.passwordForm.get('password')?.setErrors({ serverError: this.errorHandler.getErrorMessage(error) });
          this.passwordForm.get('password')?.markAsTouched();
        } else if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.applyFieldErrors(validationErrors);
        } else {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        }
        this.isSaving.set(false);
      }
    });
  }

  onCancelUpdate(): void {
    this.showConfirmDialog.set(false);
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showPassword.update(show => !show);
        break;
      case 'new':
        this.showNewPassword.update(show => !show);
        break;
      case 'confirm':
        this.showConfirmPassword.update(show => !show);
        break;
    }
  }

  private applyFieldErrors(errors: Record<string, string>): void {
    this.fieldErrors.set(errors);
    
    Object.keys(errors).forEach(fieldPath => {
      const control = this.passwordForm.get(fieldPath);
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
    const control = this.passwordForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    if (control.errors['required']) {
      return this.validationMessages.common.required;
    } else if (control.errors['pattern']) {
      if (fieldName === 'password') {
        return this.validationMessages.password.complexity;
      }
      return this.validationMessages.common.pattern;
    }

    if (fieldName === 'confirmPassword' && this.passwordForm.errors?.['mismatch']) {
      return this.validationMessages.password.mismatch;
    }

    return null;
  }
}
