import { Component, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ValidationErrorCodes } from '../../../../core/constants/error-codes';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { passwordMatchValidator } from '../../../../core/validators/password.validators';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';

interface AddressSuggestion {
  placeId: string;
  formattedAddress: string;
  city: string;
  province: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentStep = signal<'user' | 'association'>('user');
  
  // Field-specific validation errors from backend
  fieldErrors = signal<Record<string, string>>({});
  
  // Password visibility toggles
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  // Address suggestion handling
  addressQuery = signal('');
  showAddressSuggestions = signal(false);
  addressSuggestions = signal<AddressSuggestion[]>([]);
  
  // Validation messages
  validationMessages = ClientValidationMessages;
  
  // User registration form
  userForm: FormGroup;
  
  // Association registration form
  associationForm: FormGroup;
  
  // Mock address data that would come from Google Places API
  mockAddresses: AddressSuggestion[] = [
    {
      placeId: 'place1',
      formattedAddress: '123 Main St, San Francisco, CA 94105, USA',
      city: 'San Francisco',
      province: 'CA',
      zipCode: '94105',
      latitude: 37.7749,
      longitude: -122.4194
    },
    {
      placeId: 'place2',
      formattedAddress: '456 Market St, San Francisco, CA 94105, USA',
      city: 'San Francisco',
      province: 'CA',
      zipCode: '94105',
      latitude: 37.7899,
      longitude: -122.4014
    },
    {
      placeId: 'place3',
      formattedAddress: '789 Mission St, San Francisco, CA 94103, USA',
      city: 'San Francisco',
      province: 'CA',
      zipCode: '94103',
      latitude: 37.7852,
      longitude: -122.4056
    },
    {
      placeId: 'place4',
      formattedAddress: '1000 Broadway, New York, NY 10001, USA',
      city: 'New York',
      province: 'NY',
      zipCode: '10001',
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      placeId: 'place5',
      formattedAddress: '2000 Peachtree St, Atlanta, GA 30309, USA',
      city: 'Atlanta',
      province: 'GA',
      zipCode: '30309',
      latitude: 33.7490,
      longitude: -84.3880
    }
  ];
  
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
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.pattern(/^\d{1,14}$/)]]
      }),
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,32}$/)
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
  }

  ngOnInit() {
    this.resetErrors();
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

  // Process backend validation errors and apply them to form fields
  applyFieldErrors(errors: Record<string, string>): void {
    // Set field-specific errors for display
    this.fieldErrors.set(errors);
    
    // Mark fields as touched and with errors
    Object.keys(errors).forEach(fieldPath => {
      const parts = fieldPath.split('.');
      
      if (parts.length === 1) {
        const control: AbstractControl | null = this.userForm.get(fieldPath) || this.associationForm.get(fieldPath);
        control?.markAsTouched();
        control?.setErrors({ serverError: errors[fieldPath] });
      } else {
        const formName = parts[0];
        
        if (formName === 'userData') {
          // User form fields
          const userFieldPath = parts.slice(1).join('.');
          const control = this.userForm.get(userFieldPath);
          if (control) {
            control.markAsTouched();
            control.setErrors({ serverError: errors[fieldPath] });
          }
        } else if (formName === 'associationData') {
          // Association form fields
          const assocFieldPath = parts.slice(1).join('.');
          const control = this.associationForm.get(assocFieldPath);
          if (control) {
            control.markAsTouched();
            control.setErrors({ serverError: errors[fieldPath] });
          }
        }
      }
    });
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

  // Navigate to next step
  nextStep(): void {
    if (this.userForm.valid) {
      this.resetErrors();
      this.currentStep.set('association');
    } else {
      this.userForm.markAllAsTouched();
    }
  }
  
  // Go back to user information step
  previousStep(): void {
    this.resetErrors();
    this.currentStep.set('user');
  }

  // Handle address search input
  onAddressInputChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.addressQuery.set(query);
    
    if (query.length >= 2) {
      // Filter mock addresses based on query
      const filteredAddresses = this.mockAddresses.filter(
        address => address.formattedAddress.toLowerCase().includes(query)
      );
      
      this.addressSuggestions.set(filteredAddresses);
      this.showAddressSuggestions.set(true); // Always show if we have a query of 2+ chars
    } else {
      this.showAddressSuggestions.set(false);
      this.addressSuggestions.set([]);
    }
  }
  
  // Focus the address input field
  focusAddressInput(event: Event) {
    const query = this.addressQuery();
    if (query.length >= 2) {
      // Re-show suggestions if there's already a valid query
      const filteredAddresses = this.mockAddresses.filter(
        address => address.formattedAddress.toLowerCase().includes(query)
      );
      this.addressSuggestions.set(filteredAddresses);
      this.showAddressSuggestions.set(filteredAddresses.length > 0);
    }
  }
  
  // Handle selection of an address suggestion
  selectAddress(address: AddressSuggestion): void {
    const addressData = this.associationForm.get('addressData');
    if (addressData) {
      addressData.patchValue({
        placeId: address.placeId,
        latitude: address.latitude,
        longitude: address.longitude,
        city: address.city,
        province: address.province,
        zipCode: address.zipCode,
        formattedAddress: address.formattedAddress
      });
    }
    this.showAddressSuggestions.set(false);
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
    if (!this.userForm.valid || !this.associationForm.valid) {
      this.userForm.markAllAsTouched();
      this.associationForm.markAllAsTouched();
      return;
    }
    const registerData = {
      userData: this.userForm.value,
      associationData: this.associationForm.value
    };
    this.cleanEmptyPhoneNumber(registerData.userData);
    this.cleanEmptyPhoneNumber(registerData.associationData);
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
    if (!data.phoneNumber.prefix && !data.phoneNumber.nationalNumber) {
      data.phoneNumber = undefined;
    }
  }  
} 