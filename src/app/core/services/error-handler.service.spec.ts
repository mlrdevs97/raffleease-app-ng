import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { ErrorCodes } from '../constants/error-codes';
import { ValidationErrorMessages } from '../constants/validation-error-codes';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for standard error codes', () => {
      // Create various error responses to test
      const unauthorizedError = new HttpErrorResponse({
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Authentication failed',
          success: false,
          statusCode: 401,
          statusText: 'Unauthorized',
          timestamp: new Date().toISOString()
        },
        status: 401
      });

      const accessDeniedError = new HttpErrorResponse({
        error: {
          code: ErrorCodes.ACCESS_DENIED,
          message: 'Access denied',
          success: false,
          statusCode: 403,
          statusText: 'Forbidden',
          timestamp: new Date().toISOString()
        },
        status: 403
      });

      const notFoundError = new HttpErrorResponse({
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Resource not found',
          success: false,
          statusCode: 404,
          statusText: 'Not Found',
          timestamp: new Date().toISOString()
        },
        status: 404
      });

      // Test each error type
      expect(service.getErrorMessage(unauthorizedError)).toBe('Authentication failed. Please log in again.');
      expect(service.getErrorMessage(accessDeniedError)).toBe('You do not have permission to perform this action.');
      expect(service.getErrorMessage(notFoundError)).toBe('The requested resource was not found.');
    });

    it('should handle unique constraint errors with a specific message', () => {
      const uniqueConstraintError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          success: false,
          statusCode: 409, // Conflict status for unique constraint
          statusText: 'Conflict',
          timestamp: new Date().toISOString(),
          errors: {
            'userData.email': 'VALUE_ALREADY_EXISTS'
          },
          constraintName: 'USER_EMAIL_UNIQUE'
        },
        status: 409
      });

      expect(service.getErrorMessage(uniqueConstraintError)).toBe('One or more values already exist in the system.');
    });

    it('should return server message for custom error codes', () => {
      const customError = new HttpErrorResponse({
        error: {
          code: 'CUSTOM_ERROR',
          message: 'A custom error message from the server',
          success: false,
          statusCode: 400,
          statusText: 'Bad Request',
          timestamp: new Date().toISOString()
        },
        status: 400
      });

      expect(service.getErrorMessage(customError)).toBe('An error occurred. Please try again.');
    });

    it('should handle validation errors with a generic message', () => {
      const validationError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          success: false,
          statusCode: 400,
          statusText: 'Bad Request',
          timestamp: new Date().toISOString(),
          errors: {
            'email': 'EMAIL_INVALID'
          }
        },
        status: 400
      });

      expect(service.getErrorMessage(validationError)).toBe('Please correct the validation errors and try again.');
    });

    it('should handle direct Error objects inside HttpErrorResponse', () => {
      const errorInResponse = new HttpErrorResponse({
        error: new Error('JavaScript error occurred'),
        status: 500
      });
      
      expect(service.getErrorMessage(errorInResponse)).toBe('JavaScript error occurred');
    });

    it('should handle direct Error objects', () => {
      const jsError = new Error('JavaScript error occurred');
      expect(service.getErrorMessage(jsError)).toBe('JavaScript error occurred');
    });

    it('should handle unexpected error types', () => {
      const unexpectedError = 'Not an error object';
      expect(service.getErrorMessage(unexpectedError)).toBe('An unexpected error occurred. Please try again.');
    });
    
    it('should handle HttpErrorResponse without proper error structure', () => {
      const emptyErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      expect(service.getErrorMessage(emptyErrorResponse)).toBe('Error 500: Internal Server Error');
    });
  });

  describe('getValidationErrors', () => {
    it('should extract friendly validation errors from the response', () => {
      const validationError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          success: false,
          statusCode: 400,
          statusText: 'Bad Request',
          timestamp: new Date().toISOString(),
          errors: {
            'email': 'EMAIL_INVALID',
            'password': 'PASSWORD_TOO_SHORT'
          },
          // Already enriched by the interceptor
          friendlyErrors: {
            'email': 'Please enter a valid email address',
            'password': 'Password must be at least 8 characters'
          }
        },
        status: 400
      });

      const errors = service.getValidationErrors(validationError);
      expect(errors).toEqual({
        'email': 'Please enter a valid email address',
        'password': 'Password must be at least 8 characters'
      });
    });

    it('should extract friendly errors from unique constraint violations', () => {
      const uniqueConstraintError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unique constraint violation',
          success: false,
          statusCode: 409,
          statusText: 'Conflict',
          timestamp: new Date().toISOString(),
          errors: {
            'userData.email': 'VALUE_ALREADY_EXISTS'
          },
          constraintName: 'USER_EMAIL_UNIQUE',
          // Already enriched by the interceptor
          friendlyErrors: {
            'userData.email': 'This email is already registered'
          }
        },
        status: 409
      });

      const errors = service.getValidationErrors(uniqueConstraintError);
      expect(errors).toEqual({
        'userData.email': 'This email is already registered'
      });
    });

    it('should convert raw errors to strings if friendlyErrors is not available', () => {
      const validationError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          success: false,
          statusCode: 400,
          statusText: 'Bad Request',
          timestamp: new Date().toISOString(),
          errors: {
            'email': 'EMAIL_INVALID',
            'password': 'PASSWORD_TOO_SHORT'
          }
          // No friendlyErrors (might happen if interceptor didn't run)
        },
        status: 400
      });

      const errors = service.getValidationErrors(validationError);
      expect(errors).toEqual({
        'email': 'EMAIL_INVALID',
        'password': 'PASSWORD_TOO_SHORT'
      });
    });

    it('should return empty object for non-validation errors', () => {
      const genericError = new HttpErrorResponse({
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          success: false,
          statusCode: 500,
          statusText: 'Internal Server Error',
          timestamp: new Date().toISOString()
        },
        status: 500
      });

      const errors = service.getValidationErrors(genericError);
      expect(errors).toEqual({});
    });
  });

  describe('Type checking methods', () => {
    it('should correctly identify validation errors', () => {
      const validationError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          success: false,
          statusCode: 400,
          statusText: 'Bad Request',
          timestamp: new Date().toISOString(),
          errors: {
            'email': 'EMAIL_INVALID'
          }
        },
        status: 400
      });

      const genericError = new HttpErrorResponse({
        error: {
          code: 'SERVER_ERROR',
          message: 'Server error',
          success: false,
          statusCode: 500,
          statusText: 'Internal Server Error',
          timestamp: new Date().toISOString()
        },
        status: 500
      });

      expect(service.isValidationError(validationError)).toBeTrue();
      expect(service.isValidationError(genericError)).toBeFalse();
      expect(service.isValidationError('not an error')).toBeFalse();
    });

    it('should correctly identify specific error types', () => {
      const unauthorizedError = new HttpErrorResponse({
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Unauthorized',
          success: false,
          statusCode: 401,
          statusText: 'Unauthorized',
          timestamp: new Date().toISOString()
        },
        status: 401
      });

      const notFoundError = new HttpErrorResponse({
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Not found',
          success: false,
          statusCode: 404,
          statusText: 'Not Found',
          timestamp: new Date().toISOString()
        },
        status: 404
      });

      expect(service.isErrorOfType(unauthorizedError, ErrorCodes.UNAUTHORIZED)).toBeTrue();
      expect(service.isErrorOfType(notFoundError, ErrorCodes.UNAUTHORIZED)).toBeFalse();
      expect(service.isErrorOfType('not an error', ErrorCodes.UNAUTHORIZED)).toBeFalse();
    });

    it('should correctly identify unique constraint errors', () => {
      const uniqueConstraintError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unique constraint violation',
          success: false,
          statusCode: 409,
          statusText: 'Conflict',
          timestamp: new Date().toISOString(),
          constraintName: 'USER_EMAIL_UNIQUE',
          errors: {
            'userData.email': 'VALUE_ALREADY_EXISTS'
          }
        },
        status: 409
      });

      const regularValidationError = new HttpErrorResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          success: false,
          statusCode: 400,
          statusText: 'Bad Request',
          timestamp: new Date().toISOString(),
          errors: {
            'email': 'EMAIL_INVALID'
          }
        },
        status: 400
      });

      const genericError = new HttpErrorResponse({
        error: {
          code: 'SERVER_ERROR',
          message: 'Server error',
          success: false,
          statusCode: 500,
          statusText: 'Internal Server Error',
          timestamp: new Date().toISOString()
        },
        status: 500
      });

      expect(service.isUniqueConstraintError(uniqueConstraintError)).toBeTrue();
      expect(service.isUniqueConstraintError(regularValidationError)).toBeFalse();
      expect(service.isUniqueConstraintError(genericError)).toBeFalse();
      expect(service.isUniqueConstraintError('not an error')).toBeFalse();
    });
  });
}); 