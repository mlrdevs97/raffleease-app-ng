import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';

// Simple password match validator
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-forgot-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './forgot-password-reset.component.html'
})
export class ForgotPasswordResetComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  validationMessages = ClientValidationMessages;
  token: string | null = null;

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    console.log('ForgotPasswordResetComponent');
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage.set('Invalid or missing reset token');
      } else {
        console.log('Token:', this.token);
      } 
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  onSubmit(): void {
    if (!this.resetPasswordForm.valid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.resetMessages();

    const { password, confirmPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword({
      token: this.token,
      password,
      confirmPassword
    }).subscribe({
      next: () => {
        this.router.navigate(['/auth/login'], {
          queryParams: { passwordReset: 'success' }
        });
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
      const control = this.resetPasswordForm.get(fieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: errors[fieldPath] });
      }
    });
  }

  private resetMessages(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  getFieldErrorMessage(fieldName: string): string | null {
    const control = this.resetPasswordForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    if (fieldName === 'password') {
      if (control.errors['required']) {
        return this.validationMessages.common.required;
      } else if (control.errors['minlength']) {
        return 'Password must be at least 8 characters';
      }
    }

    if (fieldName === 'confirmPassword') {
      if (control.errors['required']) {
        return this.validationMessages.common.required;
      }
    }

    // Check for password mismatch at form level
    if (this.resetPasswordForm.errors?.['passwordMismatch'] && fieldName === 'confirmPassword') {
      return this.validationMessages.password.mismatch;
    }

    return null;
  }
}
