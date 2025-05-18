import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  ErrorResponse, 
  isValidationErrorResponse, 
  isErrorResponse,
} from '../models/api-response.model';
import { ValidationErrorCode } from '../constants/error-codes';
import { ErrorMessages } from '../constants/error-messages';

/**
 * Interceptor that handles API responses
 * Processes errors from the server
 */
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // Client-side error (network issues, etc.)
          return throwError(() => new HttpErrorResponse({
            error: new Error(`Network error: ${error.error.message}`),
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined
          }));
        } 
        
        const serverError: ErrorResponse = error.error;
        if (serverError && isErrorResponse(serverError)) {          
          // Handle validation errors          
          if (isValidationErrorResponse(serverError)) {
            const friendlyErrors: Record<string, string> = {};          

            Object.entries(serverError.errors).forEach(([field, code]) => {
              const fieldErrors = ErrorMessages.dedicated[field];
              const dedicatedMessage = fieldErrors?.[code];
              const fallbackMessage = ErrorMessages.validation[code as ValidationErrorCode];
              friendlyErrors[field] = dedicatedMessage || fallbackMessage || 'Invalid value';
            });
          
            const enrichedError = {
              ...serverError,
              friendlyErrors
            };
          
            // Return HttpErrorResponse with enriched error
            return throwError(() => new HttpErrorResponse({
              error: enrichedError,
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url || undefined
            }));
          }
          
          // For other API errors, return them with the error code and message
          return throwError(() => error); 
        }
        
        // Fallback for unexpected error formats
        return throwError(() => new HttpErrorResponse({
          error: new Error(`Error ${error.status}: ${error.statusText}`),
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined
        }));
      })
    );
  }
} 