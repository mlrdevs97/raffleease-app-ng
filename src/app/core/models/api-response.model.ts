import { HttpStatusCode } from '@angular/common/http';
import { ErrorCode, ErrorCodes } from '../constants/error-codes';
import { ValidationErrorCode } from '../constants/error-codes';

/**
 * Base ApiResponse interface matching the backend's ApiResponse class
 */
export interface ApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Success response with generic data type parameter
 */
export interface SuccessResponse<T = any> extends ApiResponse {
  data: T | null;
}

/**
 * Base error response from the server
 */
export interface ErrorResponse extends ApiResponse {
  statusCode: number;
  statusText: string;
  code: ErrorCode;
}   

/**
 * Validation error response with field-level errors
 */
export interface ValidationErrorResponse extends ErrorResponse {
  code: typeof ErrorCodes.VALIDATION_ERROR;
  errors: Record<string, ValidationErrorCode>;
}

/**
 * Unique constraint violation error response
 */
export interface UniqueConstraintErrorResponse extends ValidationErrorResponse {
  statusCode: HttpStatusCode.Conflict;
}

/**
 * Type guard to check if a response is a validation error
 */
export function isValidationErrorResponse(error: any): error is ValidationErrorResponse {
  return error && 
         error.success === false && 
         error.code === ErrorCodes.VALIDATION_ERROR &&
         error.errors !== undefined && 
         typeof error.errors === 'object';
}

/**
 * Type guard to check if a response is a unique constraint error
 */
export function isUniqueConstraintErrorResponse(error: any): error is UniqueConstraintErrorResponse {
  return isValidationErrorResponse(error) &&
         error.statusCode === HttpStatusCode.Conflict;
}

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && 
         response.success === false && 
         response.statusCode !== undefined &&
         response.statusText !== undefined &&
         response.code !== undefined;
}

/**
 * Type guard to check if a response is a success response
 */
export function isSuccessResponse<T>(response: any): response is SuccessResponse<T> {
  return response && 
         response.success === true && 
         typeof response.message === 'string';
} 