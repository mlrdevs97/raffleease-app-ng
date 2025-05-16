import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ValidationErrorMessages } from '../../../../core/constants/validation-error-codes';

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
  fieldErrors = signal<Record<string, string>>({});
  returnUrl: string = '/dashboard';
  
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Get the return URL from route parameters or default to '/dashboard'
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });
  }

  // Reset all error messages
  resetErrors(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
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
      return ValidationErrorMessages.REQUIRED;
    } else if (control.errors['email']) {
      return ValidationErrorMessages.INVALID_EMAIL;
    }
    
    return ValidationErrorMessages.INVALID_FIELD;
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    const { email, password } = this.loginForm.value;
    
    this.isLoading.set(true);
    this.resetErrors();
    
    this.authService.login(email, password)
      .catch((error: unknown) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));

        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.applyFieldErrors(validationErrors);
        }       
      })
      .finally(() => {
        this.isLoading.set(false);
      });    
  }
} 