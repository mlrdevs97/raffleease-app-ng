import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let errorHandlerServiceSpy: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(async () => {
    // Create spies for the services
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    errorHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'getErrorMessage',
      'getValidationErrors',
      'isValidationError',
      'isUniqueConstraintError'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterLink,
        RegisterComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the forms correctly', () => {
    expect(component.userForm).toBeDefined();
    expect(component.associationForm).toBeDefined();
    expect(component.currentStep()).toBe('user');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  describe('Form validation', () => {
    it('should validate user form fields', () => {
      const userForm = component.userForm;
      
      // Check initial validation state - all fields should be invalid
      expect(userForm.valid).toBeFalsy();
      
      // Fill in the form with valid data
      userForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      expect(userForm.valid).toBeTruthy();
      
      // Test firstName validation
      userForm.patchValue({ firstName: '' });
      expect(userForm.get('firstName')?.valid).toBeFalsy();
      expect(userForm.get('firstName')?.errors?.['required']).toBeTruthy();
      
      userForm.patchValue({ firstName: 'J' });
      expect(userForm.get('firstName')?.errors?.['minlength']).toBeTruthy();
      
      userForm.patchValue({ firstName: 'John' });
      expect(userForm.get('firstName')?.valid).toBeTruthy();
      
      // Test email validation
      userForm.patchValue({ email: 'invalid-email' });
      expect(userForm.get('email')?.valid).toBeFalsy();
      expect(userForm.get('email')?.errors?.['email']).toBeTruthy();
      
      userForm.patchValue({ email: 'john.doe@example.com' });
      expect(userForm.get('email')?.valid).toBeTruthy();
      
      // Test password validation
      userForm.patchValue({ password: 'weak' });
      expect(userForm.get('password')?.valid).toBeFalsy();
      expect(userForm.get('password')?.errors?.['pattern']).toBeTruthy();
      
      userForm.patchValue({ 
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      expect(userForm.get('password')?.valid).toBeTruthy();
      
      // Test password matching
      userForm.patchValue({ confirmPassword: 'DifferentPassword123!' });
      expect(userForm.get('confirmPassword')?.errors?.['mismatch']).toBeTruthy();
      
      userForm.patchValue({ confirmPassword: 'Password123!' });
      expect(userForm.get('confirmPassword')?.valid).toBeTruthy();
    });

    it('should validate association form fields', () => {
      const associationForm = component.associationForm;
      
      // Check initial validation state
      expect(associationForm.valid).toBeFalsy();
      
      // Fill in the form with valid data
      const addressData = {
        addressInput: '123 Main St, San Francisco, CA 94105, USA',
        placeId: 'place123',
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        province: 'CA',
        zipCode: '94105',
        formattedAddress: '123 Main St, San Francisco, CA 94105, USA'
      };
      
      associationForm.patchValue({
        associationName: 'Test Association',
        description: 'A test association',
        email: 'association@example.com',
        addressData: addressData
      });
      
      expect(associationForm.valid).toBeTruthy();
      
      // Test associationName validation
      associationForm.patchValue({ associationName: '' });
      expect(associationForm.get('associationName')?.valid).toBeFalsy();
      expect(associationForm.get('associationName')?.errors?.['required']).toBeTruthy();
      
      associationForm.patchValue({ associationName: 'Test Association' });
      expect(associationForm.get('associationName')?.valid).toBeTruthy();
      
      // Test address validation
      const addressGroup = associationForm.get('addressData');
      addressGroup?.patchValue({ placeId: '' });
      expect(addressGroup?.valid).toBeFalsy();
      
      addressGroup?.patchValue({ placeId: 'place123' });
      expect(addressGroup?.get('placeId')?.valid).toBeTruthy();
    });
  });

  describe('Step navigation', () => {
    it('should move to association step when nextStep is called with valid user form', () => {
      // Fill user form with valid data
      component.userForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      component.nextStep();
      expect(component.currentStep()).toBe('association');
    });
    
    it('should stay on user step when nextStep is called with invalid user form', () => {
      // Leave form invalid (empty)
      component.nextStep();
      expect(component.currentStep()).toBe('user');
      
      // Verify all fields are marked as touched
      expect(component.userForm.get('firstName')?.touched).toBeTruthy();
      expect(component.userForm.get('lastName')?.touched).toBeTruthy();
      expect(component.userForm.get('email')?.touched).toBeTruthy();
    });
    
    it('should go back to user step when previousStep is called', () => {
      // Move to association step first
      component.userForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      component.nextStep();
      expect(component.currentStep()).toBe('association');
      
      // Go back to user step
      component.previousStep();
      expect(component.currentStep()).toBe('user');
    });
  });

  describe('Address handling', () => {
    it('should filter address suggestions based on query', () => {
      const mockEvent = { target: { value: 'san' } } as unknown as Event;
      
      component.onAddressInputChange(mockEvent);
      
      // Make sure it filters correctly
      expect(component.addressQuery()).toBe('san');
      expect(component.showAddressSuggestions()).toBeTruthy();
      
      // Should show San Francisco addresses
      const suggestions = component.addressSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(address => {
        expect(address.formattedAddress.toLowerCase()).toContain('san');
      });
    });
    
    it('should select an address when clicked', () => {
      const mockAddress = {
        placeId: 'place1',
        formattedAddress: '123 Main St, San Francisco, CA 94105, USA',
        city: 'San Francisco',
        province: 'CA',
        zipCode: '94105',
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      component.selectAddress(mockAddress);
      
      // Check that address data is updated in the form
      const addressData = component.associationForm.get('addressData')?.value;
      expect(addressData.placeId).toBe('place1');
      expect(addressData.formattedAddress).toBe('123 Main St, San Francisco, CA 94105, USA');
      expect(addressData.city).toBe('San Francisco');
      expect(addressData.province).toBe('CA');
      expect(addressData.zipCode).toBe('94105');
      expect(addressData.latitude).toBe(37.7749);
      expect(addressData.longitude).toBe(-122.4194);
      
      // Suggestions should be hidden
      expect(component.showAddressSuggestions()).toBeFalsy();
    });
  });

  describe('Form submission', () => {
    beforeEach(() => {
      // Fill both forms with valid data
      component.userForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      const addressData = {
        addressInput: '123 Main St, San Francisco, CA 94105, USA',
        placeId: 'place123',
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        province: 'CA',
        zipCode: '94105',
        formattedAddress: '123 Main St, San Francisco, CA 94105, USA'
      };
      
      component.associationForm.patchValue({
        associationName: 'Test Association',
        description: 'A test association',
        email: 'association@example.com',
        addressData: addressData
      });
      
      // Move to association step
      component.nextStep();
    });
    
    it('should submit both forms when valid and handle success', fakeAsync(() => {
      // Mock successful registration
      authServiceSpy.register.and.returnValue(Promise.resolve());
      
      // Submit the form
      component.onSubmit();
      
      expect(component.isLoading()).toBeTruthy();
      
      // Verify data passed to service
      expect(authServiceSpy.register).toHaveBeenCalledWith({
        userData: jasmine.any(Object),
        associationData: jasmine.any(Object)
      });
      
      // Verify phone number cleanup for undefined values
      const registerData = authServiceSpy.register.calls.mostRecent().args[0];
      expect(registerData.userData.phoneNumber).toBeUndefined();
      expect(registerData.associationData.phoneNumber).toBeUndefined();
      
      // Complete the async operation
      tick();
      
      // Loading should be set back to false
      expect(component.isLoading()).toBeFalsy();
    }));
    
    it('should handle validation errors from the server', fakeAsync(() => {
      // Mock validation error response
      const validationError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: {
          'userData.email': 'EMAIL_INVALID'
        },
        success: false,
        statusCode: 400,
        statusText: 'Bad Request',
        timestamp: new Date().toISOString()
      };
      
      const mockHttpError = new HttpErrorResponse({ 
        error: validationError,
        status: 400 
      });
      
      // Mock error handler responses
      errorHandlerServiceSpy.isValidationError.and.returnValue(true);
      errorHandlerServiceSpy.isUniqueConstraintError.and.returnValue(false);
      errorHandlerServiceSpy.getValidationErrors.and.returnValue({
        'userData.email': 'Please enter a valid email address'
      });
      
      authServiceSpy.register.and.returnValue(Promise.reject(mockHttpError));
      
      // Submit the form
      component.onSubmit();
      
      // Verify loading state
      expect(component.isLoading()).toBeTruthy();
      
      // Complete the async operation
      tick();
      
      // Verify error handling
      expect(errorHandlerServiceSpy.isValidationError).toHaveBeenCalledWith(mockHttpError);
      expect(errorHandlerServiceSpy.getValidationErrors).toHaveBeenCalledWith(mockHttpError);
      
      // Error message should be set
      expect(component.errorMessage()).toBe('Please correct the validation errors below');
      
      // Field errors should be set
      expect(component.fieldErrors()['userData.email']).toBe('Please enter a valid email address');
      
      // Loading should be false
      expect(component.isLoading()).toBeFalsy();
    }));
    
    it('should handle unique constraint errors from the server', fakeAsync(() => {
      // Mock unique constraint error response
      const uniqueConstraintError = {
        code: 'VALIDATION_ERROR',
        message: 'Unique constraint violation',
        errors: {
          'userData.email': 'VALUE_ALREADY_EXISTS'
        },
        success: false,
        statusCode: 409,  // Conflict status code
        statusText: 'Conflict',
        timestamp: new Date().toISOString(),
        constraintName: 'USER_EMAIL_UNIQUE'
      };
      
      const mockHttpError = new HttpErrorResponse({ 
        error: uniqueConstraintError,
        status: 409 
      });
      
      // Mock error handler responses
      errorHandlerServiceSpy.isValidationError.and.returnValue(false);
      errorHandlerServiceSpy.isUniqueConstraintError.and.returnValue(true);
      errorHandlerServiceSpy.getValidationErrors.and.returnValue({
        'userData.email': 'This email is already registered'
      });
      
      authServiceSpy.register.and.returnValue(Promise.reject(mockHttpError));
      
      // Submit the form
      component.onSubmit();
      
      // Verify loading state
      expect(component.isLoading()).toBeTruthy();
      
      // Complete the async operation
      tick();
      
      // Verify error handling
      expect(errorHandlerServiceSpy.isUniqueConstraintError).toHaveBeenCalledWith(mockHttpError);
      expect(errorHandlerServiceSpy.getValidationErrors).toHaveBeenCalledWith(mockHttpError);
      
      // Error message should be set
      expect(component.errorMessage()).toBe('One or more fields contain values that already exist');
      
      // Field errors should be set with the constraint message
      expect(component.fieldErrors()['userData.email']).toBe('This email is already registered');
      
      // Loading should be false
      expect(component.isLoading()).toBeFalsy();
    }));
    
    it('should handle non-validation errors', fakeAsync(() => {
      // Mock general error response
      const generalError = {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        success: false,
        statusCode: 500,
        statusText: 'Internal Server Error',
        timestamp: new Date().toISOString()
      };
      
      const mockHttpError = new HttpErrorResponse({ 
        error: generalError,
        status: 500 
      });
      
      // Mock error handler responses
      errorHandlerServiceSpy.isValidationError.and.returnValue(false);
      errorHandlerServiceSpy.isUniqueConstraintError.and.returnValue(false);
      errorHandlerServiceSpy.getErrorMessage.and.returnValue('An unexpected error occurred. Please try again.');
      
      authServiceSpy.register.and.returnValue(Promise.reject(mockHttpError));
      
      // Submit the form
      component.onSubmit();
      
      // Verify loading state
      expect(component.isLoading()).toBeTruthy();
      
      // Complete the async operation
      tick();
      
      // Verify error handling
      expect(errorHandlerServiceSpy.isValidationError).toHaveBeenCalledWith(mockHttpError);
      expect(errorHandlerServiceSpy.isUniqueConstraintError).toHaveBeenCalledWith(mockHttpError);
      expect(errorHandlerServiceSpy.getErrorMessage).toHaveBeenCalledWith(mockHttpError);
      
      // Error message should be set
      expect(component.errorMessage()).toBe('An unexpected error occurred. Please try again.');
      
      // Loading should be false
      expect(component.isLoading()).toBeFalsy();
    }));
    
    it('should not submit if forms are invalid', () => {
      // Make the form invalid
      component.associationForm.get('associationName')?.setValue('');
      
      // Submit the form
      component.onSubmit();
      
      // Service should not be called
      expect(authServiceSpy.register).not.toHaveBeenCalled();
      
      // Both forms should be marked as touched
      expect(component.associationForm.get('associationName')?.touched).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should display field-specific errors', () => {
      // Apply error to a specific field
      const fieldErrors = {
        'userData.email': 'Email already exists'
      };
      
      component.applyFieldErrors(fieldErrors);
      
      // Check that the error is applied to the field
      const emailControl = component.userForm.get('email');
      expect(emailControl?.errors?.['serverError']).toBe('Email already exists');
      
      // Field should be marked as touched
      expect(emailControl?.touched).toBeTruthy();
      
      // Field errors signal should be updated
      expect(component.fieldErrors()['userData.email']).toBe('Email already exists');
    });
    
    it('should get appropriate error messages for fields', () => {
      // Required error
      component.userForm.get('firstName')?.markAsTouched();
      component.userForm.get('firstName')?.setErrors({ required: true });
      expect(component.getFieldErrorMessage('user', 'firstName')).toBe('This field is required');
      
      // Email format error
      component.userForm.get('email')?.markAsTouched();
      component.userForm.get('email')?.setErrors({ email: true });
      expect(component.getFieldErrorMessage('user', 'email')).toBe('Please enter a valid email address');
      
      // Server error (takes precedence)
      component.userForm.get('email')?.markAsTouched();
      component.userForm.get('email')?.setErrors({ 
        email: true,
        serverError: 'Email already exists' 
      });
      expect(component.getFieldErrorMessage('user', 'email')).toBe('Email already exists');
      
      // Password mismatch
      component.userForm.get('confirmPassword')?.markAsTouched();
      component.userForm.get('confirmPassword')?.setErrors({ mismatch: true });
      expect(component.getFieldErrorMessage('user', 'confirmPassword')).toBe('Passwords do not match');
    });
    
    it('should reset errors correctly', () => {
      // Set up some errors
      component.errorMessage.set('Error message');
      component.fieldErrors.set({ 'userData.email': 'Email error' });
      
      // Reset errors
      component.resetErrors();
      
      // Check that errors are cleared
      expect(component.errorMessage()).toBeNull();
      expect(component.fieldErrors()).toEqual({});
    });
  });
}); 