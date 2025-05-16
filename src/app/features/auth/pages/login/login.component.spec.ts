import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let errorHandlerServiceSpy: jasmine.SpyObj<ErrorHandlerService>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  beforeEach(async () => {
    // Create spies for the services
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    errorHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'getErrorMessage',
      'getValidationErrors',
      'isValidationError'
    ]);

    // Create stub for ActivatedRoute
    activatedRouteStub = {
      queryParams: of({ returnUrl: '/my-dashboard' })
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterLink,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form and read returnUrl from route params', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.returnUrl).toBe('/my-dashboard');
  });

  describe('Form validation', () => {
    it('should validate form fields', () => {
      const loginForm = component.loginForm;
      
      // Check initial validation state
      expect(loginForm.valid).toBeFalsy();
      
      // Fill in the form with valid data
      loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(loginForm.valid).toBeTruthy();
      
      // Test email validation
      loginForm.patchValue({ email: 'invalid-email' });
      expect(loginForm.get('email')?.valid).toBeFalsy();
      expect(loginForm.get('email')?.errors?.['email']).toBeTruthy();
      
      loginForm.patchValue({ email: 'test@example.com' });
      expect(loginForm.get('email')?.valid).toBeTruthy();
      
      // Test required fields
      loginForm.patchValue({ email: '' });
      expect(loginForm.get('email')?.valid).toBeFalsy();
      expect(loginForm.get('email')?.errors?.['required']).toBeTruthy();
      
      loginForm.patchValue({ 
        email: 'test@example.com',
        password: '' 
      });
      expect(loginForm.get('password')?.valid).toBeFalsy();
      expect(loginForm.get('password')?.errors?.['required']).toBeTruthy();
    });
  });

  describe('Form submission', () => {
    beforeEach(() => {
      // Fill form with valid data
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    it('should submit form when valid and handle success', fakeAsync(() => {
      // Mock successful login
      authServiceSpy.login.and.returnValue(Promise.resolve());
      
      // Submit the form
      component.onSubmit();
      
      expect(component.isLoading()).toBeTruthy();
      
      // Verify data passed to service
      expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
      
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
          'email': 'INVALID_EMAIL'
        }
      };
      
      const mockHttpError = new HttpErrorResponse({ 
        error: validationError,
        status: 400 
      });
      
      // Mock error handler responses
      errorHandlerServiceSpy.isValidationError.and.returnValue(true);
      errorHandlerServiceSpy.getValidationErrors.and.returnValue({
        'email': 'Invalid email format'
      });
      
      authServiceSpy.login.and.returnValue(Promise.reject(mockHttpError));
      
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
      expect(component.fieldErrors()['email']).toBe('Invalid email format');
      
      // Loading should be false
      expect(component.isLoading()).toBeFalsy();
    }));
    
    it('should handle authentication errors', fakeAsync(() => {
      // Mock auth error response
      const authError = {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials'
      };
      
      const mockHttpError = new HttpErrorResponse({ 
        error: authError,
        status: 401 
      });
      
      // Mock error handler responses
      errorHandlerServiceSpy.isValidationError.and.returnValue(false);
      errorHandlerServiceSpy.getErrorMessage.and.returnValue('Authentication failed. Please check your email and password.');
      
      authServiceSpy.login.and.returnValue(Promise.reject(mockHttpError));
      
      // Submit the form
      component.onSubmit();
      
      // Verify loading state
      expect(component.isLoading()).toBeTruthy();
      
      // Complete the async operation
      tick();
      
      // Verify error handling
      expect(errorHandlerServiceSpy.isValidationError).toHaveBeenCalledWith(mockHttpError);
      expect(errorHandlerServiceSpy.getErrorMessage).toHaveBeenCalledWith(mockHttpError);
      
      // Error message should be set
      expect(component.errorMessage()).toBe('Authentication failed. Please check your email and password.');
      
      // Loading should be false
      expect(component.isLoading()).toBeFalsy();
    }));
    
    it('should handle server errors', fakeAsync(() => {
      // Mock server error response
      const serverError = {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      };
      
      const mockHttpError = new HttpErrorResponse({ 
        error: serverError,
        status: 500 
      });
      
      // Mock error handler responses
      errorHandlerServiceSpy.isValidationError.and.returnValue(false);
      errorHandlerServiceSpy.getErrorMessage.and.returnValue('An unexpected error occurred. Please try again.');
      
      authServiceSpy.login.and.returnValue(Promise.reject(mockHttpError));
      
      // Submit the form
      component.onSubmit();
      
      // Complete the async operation
      tick();
      
      // Verify error handling
      expect(component.errorMessage()).toBe('An unexpected error occurred. Please try again.');
    }));
    
    it('should not submit if form is invalid', () => {
      // Make the form invalid
      component.loginForm.get('email')?.setValue('');
      
      // Submit the form
      component.onSubmit();
      
      // Service should not be called
      expect(authServiceSpy.login).not.toHaveBeenCalled();
      
      // Form fields should be marked as touched
      expect(component.loginForm.get('email')?.touched).toBeTruthy();
      expect(component.loginForm.get('password')?.touched).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should display field-specific errors', () => {
      // Apply error to a specific field
      const fieldErrors = {
        'email': 'Email does not exist'
      };
      
      component.applyFieldErrors(fieldErrors);
      
      // Check that the error is applied to the field
      const emailControl = component.loginForm.get('email');
      expect(emailControl?.errors?.['serverError']).toBe('Email does not exist');
      
      // Field should be marked as touched
      expect(emailControl?.touched).toBeTruthy();
      
      // Field errors signal should be updated
      expect(component.fieldErrors()['email']).toBe('Email does not exist');
    });
    
    it('should get appropriate error messages for fields', () => {
      // Required error
      component.loginForm.get('email')?.markAsTouched();
      component.loginForm.get('email')?.setErrors({ required: true });
      expect(component.getFieldErrorMessage('email')).toBe('This field is required');
      
      // Email format error
      component.loginForm.get('email')?.markAsTouched();
      component.loginForm.get('email')?.setErrors({ email: true });
      expect(component.getFieldErrorMessage('email')).toBe('Please enter a valid email address');
      
      // Server error (takes precedence)
      component.loginForm.get('email')?.markAsTouched();
      component.loginForm.get('email')?.setErrors({ 
        email: true,
        serverError: 'Email does not exist' 
      });
      expect(component.getFieldErrorMessage('email')).toBe('Email does not exist');
    });
    
    it('should reset errors correctly', () => {
      // Set up some errors
      component.errorMessage.set('Error message');
      component.fieldErrors.set({ 'email': 'Email error' });
      
      // Reset errors
      component.resetErrors();
      
      // Check that errors are cleared
      expect(component.errorMessage()).toBeNull();
      expect(component.fieldErrors()).toEqual({});
    });
  });
}); 