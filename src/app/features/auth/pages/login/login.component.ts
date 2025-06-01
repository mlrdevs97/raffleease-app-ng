import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ErrorMessages } from '../../../../core/constants/error-messages';
import { SuccessMessages } from '../../../../core/constants/success-messages';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showPassword = signal(false);
  returnUrl: string = '/dashboard';
  
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Get the return URL from route parameters or default to '/dashboard'
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
      
      // Check if email was verified successfully
      if (params['emailVerified'] === 'success') {
        this.successMessage.set(SuccessMessages.auth.emailVerified);
      }
    });
  }

  // Reset all error messages
  resetErrors(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  // Process backend validation errors and apply them to form fields
  applyFieldErrors(errors: Record<string, string>): void {
    // Set field-specific errors for display
    this.fieldErrors.set(errors);
    
    // Mark fields as touched and with errors
    Object.keys(errors).forEach(fieldPath => {
      const control = this.loginForm.get(fieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: errors[fieldPath] });
      }
    });
  }

  // Get field error message 
  getFieldErrorMessage(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    
    // Look for server-specific error first
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }
    
    // Return appropriate client-side validation error
    if (control.errors['required']) {
      return ErrorMessages.validation.REQUIRED ?? null;
    }
    
    return ErrorMessages.validation.INVALID_FIELD ?? null;
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.loginForm.value;
    this.isLoading.set(true);
    this.resetErrors();
    this.successMessage.set(null);
    this.authService.login(identifier, password).subscribe({
      error: (error: unknown) => {
        console.error('Login error:', error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.applyFieldErrors(validationErrors);
        }
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
} 