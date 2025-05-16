import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { 
  ValidationErrorResponse, 
  isValidationErrorResponse, 
  isErrorResponse,
  isUniqueConstraintErrorResponse,
} from '../models/api-response.model';
import { ErrorCodes, ErrorCode } from '../constants/error-codes';

/**
 * Interface for enriched validation errors added by ApiResponseInterceptor
 */
interface EnrichedValidationError extends ValidationErrorResponse {
  friendlyErrors?: Record<string, string>;
}

/**
 * Service for handling API errors in a consistent way across the application
 * Works with the enriched error formats provided by ApiResponseInterceptor
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /**
   * Processes an HTTP error and returns a user-friendly message
   */
  getErrorMessage(error: unknown): string {
    // Handle direct JS Error objects
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error.message;
    }
  
    if (!(error instanceof HttpErrorResponse)) {
      return 'An unexpected error occurred. Please try again.';
    }
  
    const { status, statusText, error: errorData } = error;
  
    // Handle network/CORS errors
    if (status === 0) {
      return 'Connection error. Please check your internet connection or try again later.';
    }
  
    // Handle backend errors by status code
    const serverMessages: Record<number, string> = {
      500: 'Something went wrong on our end. Please try again later.',
      502: 'The server is down or being restarted. Please wait a moment.',
      503: 'The service is temporarily unavailable. Please try again shortly.'
    };
  
    if (serverMessages[status]) {
      return serverMessages[status];
    }
  
    // Handle API error responses with structure
    if (errorData && isErrorResponse(errorData)) {
      if (isValidationErrorResponse(errorData)) {
        return 'Please, correct the errors below and try again.';
      }
  
      const codeMessages: Partial<Record<ErrorCode, string>> = {
        [ErrorCodes.UNAUTHORIZED]: 'Authentication failed. Please log in again.',
        [ErrorCodes.ACCESS_DENIED]: 'You do not have permission to perform this action.',
        [ErrorCodes.USER_NOT_FOUND]: 'User not found.',
        [ErrorCodes.EMAIL_VERIFICATION_FAILED]: 'Email verification failed. The token may be invalid or expired.',
        [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
        [ErrorCodes.CONFLICT]: 'A conflict occurred. The operation could not be completed.'
      };
  
      return codeMessages[errorData.code] ?? 'An error occurred. Please try again.';
    }
  
    // Handle low-level errors passed through the interceptor
    if (errorData instanceof Error) {
      return errorData.message;
    }
  
    // Fallback for any unstructured HttpErrorResponse
    return `Error ${status}: ${statusText}`;
  }  
  
  /**
   * Gets the validation errors from an HTTP error response
   * Returns a map of field paths to user-friendly error messages
   */
  getValidationErrors(error: unknown): Record<string, string> {
    if (error instanceof HttpErrorResponse) {
      if (isValidationErrorResponse(error.error) || isUniqueConstraintErrorResponse(error.error)) {
        const validationError = error.error as EnrichedValidationError;
        
        if (validationError.friendlyErrors) {
          return validationError.friendlyErrors;
        }
        
        // Fallback: convert raw validation codes to string messages
        return Object.entries(validationError.errors).reduce((acc, [field, code]) => {
          acc[field] = String(code);
          return acc;
        }, {} as Record<string, string>);
      }
    }
    
    return {};
  }
  
  /**
   * Checks if an error is a specific type of error
   */
  isErrorOfType(error: unknown, errorCode: ErrorCode): boolean {
    if (error instanceof HttpErrorResponse && isErrorResponse(error.error)) {
      return error.error.code === errorCode;
    }
    return false;
  }
  
  /**
   * Checks if an error is a validation error
   */
  isValidationError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && isValidationErrorResponse(error.error);
  }
  
  /**
   * Checks if an error is a unique constraint violation
   */
  isUniqueConstraintError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && isUniqueConstraintErrorResponse(error.error);
  }
} 