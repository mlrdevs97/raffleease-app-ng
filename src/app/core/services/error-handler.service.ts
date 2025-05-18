import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ValidationErrorResponse,
  isValidationErrorResponse,
  isErrorResponse,
  isUniqueConstraintErrorResponse,
} from '../models/api-response.model';
import { ErrorCodes, ErrorCode } from '../constants/error-codes';
import { ErrorMessages } from '../constants/error-messages';

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
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  getErrorMessage(error: unknown): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error.message;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return 'An unexpected error occurred. Please try again.';
    }

    const { status, statusText, error: errorData } = error;

    if (status === 0) {
      return 'Connection error. Please check your internet connection or try again later.';
    }

    const statusMessage = ErrorMessages.status[status];
    if (statusMessage) return statusMessage;

    if (errorData && isErrorResponse(errorData)) {
      if (isValidationErrorResponse(errorData)) {
        return 'Please, correct the errors below and try again.';
      }

      const errorCode = errorData.code as ErrorCode;
      return ErrorMessages.general[errorCode] ?? 'An error occurred. Please try again.';
    }

    if (errorData instanceof Error) {
      return errorData.message;
    }

    return `Error ${status}: ${statusText}`;
  }

  getValidationErrors(error: unknown): Record<string, string> {
    if (!this.isValidationError(error)) return {};

    const validationError = error as HttpErrorResponse;
    const enrichedError = validationError.error as EnrichedValidationError;
    return enrichedError.friendlyErrors || {};
  }

  isErrorOfType(error: unknown, errorCode: ErrorCode): boolean {
    return error instanceof HttpErrorResponse &&
      isErrorResponse(error.error) &&
      error.error.code === errorCode;
  }

  isValidationError(error: unknown): boolean {
    return error instanceof HttpErrorResponse &&
      isValidationErrorResponse(error.error);
  }

  isUniqueConstraintError(error: unknown): boolean {
    return error instanceof HttpErrorResponse &&
      isUniqueConstraintErrorResponse(error.error);
  }
}
