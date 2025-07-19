import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DropdownSelectComponent } from '../../../../shared/components/dropdown-select/dropdown-select.component';
import { PhoneNumberInputComponent } from '../../../../shared/components/phone-number-input/phone-number-input.component';
import { ManageAccountsService } from '../../services/manage-accounts.services';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AssociationRole } from '../../../../core/models/user.model';
import { CreateUserRequest } from '../../models/create-user.model';
import { passwordMatchValidator } from '../../../../core/validators/password.validators';
import { ErrorMessages } from '../../../../core/constants/error-messages';

@Component({
  selector: 'app-create-account-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownSelectComponent, PhoneNumberInputComponent, ReactiveFormsModule],
  templateUrl: './create-account-form.component.html',
  styles: ``
})
export class CreateAccountFormComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  roleOptions = [
    AssociationRole.COLLABORATOR,
    AssociationRole.MEMBER
  ];

  constructor(
    private fb: FormBuilder,
    private manageAccountsService: ManageAccountsService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.required, Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.required, Validators.pattern(/^\d{1,14}$/)]]
      }),
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
  }

  // Phone number control getters - following the same pattern as register component
  get prefixControl(): FormControl {
    return this.userForm.get('phoneNumber.prefix') as FormControl;
  }

  get nationalNumberControl(): FormControl {
    return this.userForm.get('phoneNumber.nationalNumber') as FormControl;
  }

  hasPhoneNumber = computed(() => {
    const prefix = this.prefixControl?.value;
    const nationalNumber = this.nationalNumberControl?.value;
    return prefix && nationalNumber;
  });

  getErrorMessage(fieldName: string): string | null {
    const control = this.userForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      const errors = control.errors;
      
      if (errors?.['serverError']) return errors['serverError'];
      
      if (errors?.['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (errors?.['email']) return 'Please enter a valid email address';
      if (errors?.['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors?.['maxlength']) return `${this.getFieldLabel(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
      if (errors?.['pattern']) {
        if (fieldName === 'password') return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
    }
    
    // Check for form-level password mismatch error
    if (fieldName === 'confirmPassword') {
      const formErrors = this.userForm.errors;
      if (formErrors?.['passwordMismatch'] && this.userForm.get('confirmPassword')?.touched) {
        return 'Passwords do not match';
      }
    }
    
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      role: 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.value;
    
    const createUserRequest: CreateUserRequest = {
      userData: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        userName: formValue.username,
        email: formValue.email,
        phoneNumber: this.hasPhoneNumber() ? {
          prefix: formValue.phoneNumber.prefix,
          nationalNumber: formValue.phoneNumber.nationalNumber
        } : undefined,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword
      },
      role: formValue.role
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.manageAccountsService.createUser(createUserRequest).subscribe({
      next: (response) => {
        this.router.navigate(['/accounts'], {
          queryParams: { message: 'User account created successfully. Verification email sent.' }
        });
      },
      error: (error) => {
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

  private applyFieldErrors(errors: Record<string, string>): void {
    Object.keys(errors).forEach(fieldPath => {
      // Handle nested field paths like 'userData.email' -> 'email'
      let controlPath = fieldPath;
      
      // Map server field paths to form control paths
      if (fieldPath === 'userData.email') {
        controlPath = 'email';
      } else if (fieldPath === 'userData.userName') {
        controlPath = 'username';
      } else if (fieldPath === 'userData.phoneNumber') {
        // Handle phone number validation - apply to both prefix and national number controls
        const serverErrorMessage = this.getServerErrorMessage(fieldPath, errors[fieldPath]);
        
        this.prefixControl.markAsTouched();
        this.prefixControl.setErrors({ serverError: serverErrorMessage });
        
        this.nationalNumberControl.markAsTouched();
        this.nationalNumberControl.setErrors({ serverError: serverErrorMessage });
        
        // Also mark the parent phoneNumber group as touched
        const phoneNumberGroup = this.userForm.get('phoneNumber');
        if (phoneNumberGroup) {
          phoneNumberGroup.markAsTouched();
        }
        
        return; // Skip the general control handling for phone number
      } else if (fieldPath.startsWith('userData.')) {
        // Remove 'userData.' prefix for other fields
        controlPath = fieldPath.replace('userData.', '');
      }
      
      const control = this.userForm.get(controlPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
      }
    });
  }

  private getServerErrorMessage(fieldPath: string, errorCode: string): string {
    // Check dedicated field messages first
    const dedicatedMessages = ErrorMessages.dedicated[fieldPath];
    if (dedicatedMessages && dedicatedMessages[errorCode]) {
      return dedicatedMessages[errorCode];
    }
    
    // Check general error messages
    const generalMessage = ErrorMessages.general[errorCode as keyof typeof ErrorMessages.general];
    if (generalMessage) {
      return generalMessage;
    }
    
    // Check validation error messages
    const validationMessage = ErrorMessages.validation[errorCode as keyof typeof ErrorMessages.validation];
    if (validationMessage) {
      return validationMessage;
    }
    
    // Fallback to error code
    return errorCode;
  }

  // Helper method to get role display labels
  getRoleLabel(role: AssociationRole): string {
    const roleLabels: Record<AssociationRole, string> = {
      [AssociationRole.ADMIN]: 'Administrator',
      [AssociationRole.COLLABORATOR]: 'Collaborator',
      [AssociationRole.MEMBER]: 'Member'
    };
    return roleLabels[role] || role;
  }
}
