import { Component, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ValidationErrorCodes } from '../../../../core/constants/error-codes';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { passwordMatchValidator } from '../../../../core/validators/password.validators';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';
import { ErrorMessages } from '../../../../core/constants/error-messages';
import { PhoneNumberInputComponent } from '../../../../shared/components/phone-number-input/phone-number-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PhoneNumberInputComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentStep = signal<'user' | 'association'>('user');
  fieldErrors = signal<Record<string, string>>({});
  showPassword = signal(false);
  showConfirmPassword = signal(false);  
  addressQuery = signal('');
  showAddressSuggestions = signal(false);
  validationMessages = ClientValidationMessages;  
  userForm: FormGroup;
  associationForm: FormGroup;

  get userPrefixControl(): FormControl {
    return this.userForm.get('phoneNumber.prefix') as FormControl;
  }

  get userNationalNumberControl(): FormControl {
    return this.userForm.get('phoneNumber.nationalNumber') as FormControl;
  }

  get associationPrefixControl(): FormControl {
    return this.associationForm.get('phoneNumber.prefix') as FormControl;
  }

  get associationNationalNumberControl(): FormControl {
    return this.associationForm.get('phoneNumber.nationalNumber') as FormControl;
  }

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private elementRef: ElementRef,
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      userName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      associationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.required, Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.required, Validators.pattern(/^\d{1,14}$/)]]
      }),
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#-$_%^&*(),.?":{}|<>]).{8,32}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: passwordMatchValidator() 
    });
    
    this.associationForm = this.fb.group({
      associationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      email: ['', [Validators.email]],
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.pattern(/^\d{1,14}$/)]]
      }),
      addressData: this.fb.group({
        placeId: ['', [Validators.required]],
        latitude: [null, [Validators.required]],
        longitude: [null, [Validators.required]],
        city: ['', [Validators.required]],
        province: ['', [Validators.required]],
        zipCode: [''],
        formattedAddress: ['', [Validators.required]]
      })
    });

    // Sync association name from user form to association form
    this.userForm.get('associationName')?.valueChanges.subscribe(value => {
      this.associationForm.get('associationName')?.setValue(value, { emitEvent: false });
    });
  }

  ngOnInit() {
    this.resetErrors();
    this.populateMockAssociationData();
  }
  
  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }
  
  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }
  
  // Reset all error messages
  resetErrors(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  // Check if there are existing server validation errors
  private hasServerValidationErrors(): boolean {
    const fieldErrors = this.fieldErrors();
    return Object.keys(fieldErrors).length > 0;
  }

  // Process backend vailidation errors and apply them to form fields
  applyFieldErrors(errors: Record<string, string>): void {
    // Set field-specific errors for display
    this.fieldErrors.set(errors);
    
    // Determine which step contains errors and navigate to the first step with errors
    const errorStep = this.determineErrorStep(errors);
    if (errorStep && errorStep !== this.currentStep()) {
      this.currentStep.set(errorStep);
    }
    
    // Mark fields as touched and with errors
    Object.keys(errors).forEach(fieldPath => {
      const parts = fieldPath.split('.');
      
      if (parts.length === 1) {
        // Direct form field - check both forms
        const userControl = this.userForm.get(fieldPath);
        const assocControl = this.associationForm.get(fieldPath);
        
        if (userControl) {
          userControl.markAsTouched();
          userControl.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
        } else if (assocControl) {
          assocControl.markAsTouched();
          assocControl.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
          
          // If it's association name error, also apply to user form where it's displayed
          if (fieldPath === 'associationName') {
            const userAssocNameControl = this.userForm.get('associationName');
            if (userAssocNameControl) {
              userAssocNameControl.markAsTouched();
              userAssocNameControl.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
            }
          }
        }
      } else {
        const formName = parts[0];
        
        if (formName === 'userData') {
          const userFieldPath = parts.slice(1).join('.');
          
          if (userFieldPath === 'phoneNumber') {
            const prefixControl = this.userForm.get('phoneNumber.prefix');
            const nationalNumberControl = this.userForm.get('phoneNumber.nationalNumber');
            const serverErrorMessage = this.getServerErrorMessage(fieldPath, errors[fieldPath]);
            
            if (prefixControl) {
              prefixControl.markAsTouched();
              prefixControl.setErrors({ serverError: serverErrorMessage });
            }
            if (nationalNumberControl) {
              nationalNumberControl.markAsTouched();
              nationalNumberControl.setErrors({ serverError: serverErrorMessage });
            }
          } else {
            const control = this.userForm.get(userFieldPath);
            if (control) {
              control.markAsTouched();
              control.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
            }
          }
        } else if (formName === 'associationData') {
          const assocFieldPath = parts.slice(1).join('.');
          
          const control = this.associationForm.get(assocFieldPath);
          if (control) {
            control.markAsTouched();
            control.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
              
            // If it's association name error, also apply to user form where it's displayed
            if (assocFieldPath === 'associationName') {
              const userAssocNameControl = this.userForm.get('associationName');
              if (userAssocNameControl) {
                userAssocNameControl.markAsTouched();
                userAssocNameControl.setErrors({ serverError: this.getServerErrorMessage(fieldPath, errors[fieldPath]) });
              }
            }
          }
        }
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

  // Determine which step contains the validation errors
  private determineErrorStep(errors: Record<string, string>): 'user' | 'association' | null {
    const errorFields = Object.keys(errors);
    
    // Define known user form fields
    const userFormFields = [
      'firstName', 'lastName', 'userName', 'email', 'password', 'confirmPassword',
      'phoneNumber.prefix', 'phoneNumber.nationalNumber'
    ];
    
    // Define known association form fields
    const associationFormFields = [
      'associationName', 'description', 'email', 
      'phoneNumber.prefix', 'phoneNumber.nationalNumber',
      'addressData.placeId', 'addressData.latitude', 'addressData.longitude',
      'addressData.city', 'addressData.province', 'addressData.zipCode', 'addressData.formattedAddress'
    ];
    
    // Check if any errors belong to user data (first step)
    const hasUserErrors = errorFields.some(fieldPath => {
      const parts = fieldPath.split('.');
    
      if (parts.length === 1) {
        return userFormFields.includes(fieldPath) || this.userForm.get(fieldPath) !== null;
      } else if (parts[0] === 'userData') {
        return true;
      } else {
        return userFormFields.includes(fieldPath);
      }
    });
    
    // Check if any errors belong to association data (second step)
    const hasAssociationErrors = errorFields.some(fieldPath => {
      const parts = fieldPath.split('.');
      
      if (parts.length === 1) {
        return !userFormFields.includes(fieldPath) && 
               (associationFormFields.includes(fieldPath) || this.associationForm.get(fieldPath) !== null);
      } else if (parts[0] === 'associationData') {
        return true;
      } else {
        return associationFormFields.includes(fieldPath) && !userFormFields.includes(fieldPath);
      }
    });
    
    if (hasUserErrors) {
      return 'user';
    } else if (hasAssociationErrors) {
      return 'association';
    }
    
    return null;
  }

  // Close suggestions when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if the click was inside the address input or suggestions
    const addressContainer = this.elementRef.nativeElement.querySelector('#addressContainer');
    if (addressContainer && !addressContainer.contains(event.target)) {
      this.showAddressSuggestions.set(false);
    }
  }

  // Navigate to next step (manual navigation)
  nextStep(): void {
    if (this.userForm.valid) {
      this.currentStep.set('association');
    } else {
      this.userForm.markAllAsTouched();
    }
  }
  
  // Go back to user information step (manual navigation)  
  previousStep(): void {
    this.currentStep.set('user');
  }

  // Get field error message (combines client and server validation)
  getFieldErrorMessage(formName: 'user' | 'association', fieldName: string): string | null {
    const form = formName === 'user' ? this.userForm : this.associationForm;
    const control = form.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    
    // Look for server-specific error first
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }
    
    // Return client-side validation error
    if (control.errors['required']) {
      return this.validationMessages.common.required;
    } else if (control.errors['email']) {
      return this.validationMessages.common.email;
    } else if (control.errors['minlength']) {
      return this.validationMessages.common.minlength(control.errors['minlength'].requiredLength);
    } else if (control.errors['maxlength']) {
      return this.validationMessages.common.maxlength(control.errors['maxlength'].requiredLength);
    } else if (control.errors['pattern']) {
      if (fieldName === 'password') {
        return this.validationMessages.password.complexity;
      }
      return this.validationMessages.common.pattern;
    } else if (control.errors['mismatch']) {
      return this.validationMessages.password.mismatch;
    }
    
    return ValidationErrorCodes.INVALID_FIELD;
  }

  onSubmit(): void {
    // Sync association name from user form to association form before validation
    const associationNameValue = this.userForm.get('associationName')?.value;
    this.associationForm.get('associationName')?.setValue(associationNameValue);

    if (!this.userForm.valid || !this.associationForm.valid) {
      this.userForm.markAllAsTouched();
      this.associationForm.markAllAsTouched();
      return;
    }
    
    const registerData = {
      userData: this.userForm.value,
      associationData: this.associationForm.value
    };
    
    // Remove association name from user data as it belongs to association data
    delete registerData.userData.associationName;
    
    this.cleanEmptyPhoneNumber(registerData.userData);
    this.cleanEmptyPhoneNumber(registerData.associationData);
    
    // Ensure association email and phone are completely removed if empty
    this.cleanEmptyAssociationContactInfo(registerData.associationData);
    
    this.isLoading.set(true);
    this.resetErrors();
    
    this.authService.register(registerData).subscribe({
      error: (error: unknown) => {
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

  cleanEmptyPhoneNumber(data: any): void {
    if (data.phoneNumber && !data.phoneNumber.prefix && !data.phoneNumber.nationalNumber) {
      delete data.phoneNumber;
    }
  }

  // Ensure association email and phone are completely removed if empty
  cleanEmptyAssociationContactInfo(associationData: any): void {
    // Remove email if empty or whitespace
    if (!associationData.email || associationData.email.trim() === '') {
      delete associationData.email;
    }
    
    // Remove phone number if empty (already handled by cleanEmptyPhoneNumber but being explicit)
    if (associationData.phoneNumber && 
        (!associationData.phoneNumber.prefix || associationData.phoneNumber.prefix.trim() === '') &&
        (!associationData.phoneNumber.nationalNumber || associationData.phoneNumber.nationalNumber.trim() === '')) {
      delete associationData.phoneNumber;
    }
  }

  // Populate association form with mock data (excluding email, phone, and association name)
  private populateMockAssociationData(): void {
    this.associationForm.patchValue({
      // Association name will come from user input, not mocked
      description: 'Community association created through Raffleease platform',
      // Note: Email and phone number are intentionally NOT set
      addressData: {
        placeId: 'mock_place_id_' + Date.now(),
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        province: 'CA',
        zipCode: '94105',
        formattedAddress: '123 Community St, San Francisco, CA 94105, USA'
      }
    });
  }
} 