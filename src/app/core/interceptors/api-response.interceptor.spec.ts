import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiResponseInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(ApiResponseInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should let successful requests pass through untouched', () => {
    const testData = { name: 'Test Data' };
    
    httpClient.get('/api/test').subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(testData);
  });

  it('should enrich validation errors with friendly messages and wrap in HttpErrorResponse', (done) => {
    // Make a request that will result in a validation error
    httpClient.post('/api/users', {}).subscribe({
      next: () => fail('should have failed with validation error'),
      error: (error: any) => {
        // Verify we receive an HttpErrorResponse
        expect(error).toBeInstanceOf(HttpErrorResponse);
        
        // Check that the error data was enriched with friendly messages
        expect(error.error.friendlyErrors).toBeDefined();
        expect(error.error.friendlyErrors['email']).toBe('Please enter a valid email address');
        
        // Original error properties should still be preserved
        expect(error.error.code).toBe('VALIDATION_ERROR');
        expect(error.error.message).toBe('Validation failed');
        expect(error.error.errors).toBeDefined();
        done();
      }
    });

    // Respond with a validation error
    const req = httpMock.expectOne('/api/users');
    const validationErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: {
        'email': 'EMAIL_INVALID'
      }
    };
    
    req.flush(validationErrorResponse, { 
      status: 400, 
      statusText: 'Bad Request' 
    });
  });

  it('should apply constraint field messages for unique constraint errors and wrap in HttpErrorResponse', (done) => {
    httpClient.post('/api/users', {}).subscribe({
      next: () => fail('should have failed with constraint error'),
      error: (error: any) => {
        // Verify we receive an HttpErrorResponse
        expect(error).toBeInstanceOf(HttpErrorResponse);
        
        // Check that constraint errors are handled
        expect(error.error.friendlyErrors).toBeDefined();
        expect(error.error.friendlyErrors['email']).toBeDefined();
        done();
      }
    });

    // Respond with a unique constraint error
    const req = httpMock.expectOne('/api/users');
    
    // Assuming 'email' is a field that has a constraint message defined
    const constraintErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: {
        'email': 'EMAIL_EXISTS'
      }
    };
    
    req.flush(constraintErrorResponse, { 
      status: 400, 
      statusText: 'Bad Request' 
    });
  });

  it('should pass through other API errors while preserving HttpErrorResponse', (done) => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with server error'),
      error: (error: any) => {
        // Verify we receive an HttpErrorResponse
        expect(error).toBeInstanceOf(HttpErrorResponse);
        
        expect(error.error.code).toBe('SERVER_ERROR');
        expect(error.error.message).toBe('Internal server error');
        // Should not have friendlyErrors
        expect(error.error.friendlyErrors).toBeUndefined();
        done();
      }
    });

    // Respond with a non-validation error
    const req = httpMock.expectOne('/api/test');
    const serverErrorResponse = {
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    };
    
    req.flush(serverErrorResponse, { 
      status: 500, 
      statusText: 'Internal Server Error' 
    });
  });

  it('should handle client-side network errors and wrap in HttpErrorResponse', (done) => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with network error'),
      error: (error: any) => {
        // Verify we receive an HttpErrorResponse
        expect(error).toBeInstanceOf(HttpErrorResponse);
        
        // Network errors should be wrapped as Error inside HttpErrorResponse
        expect(error.error).toBeInstanceOf(Error);
        expect(error.error.message).toContain('Network error');
        done();
      }
    });

    // Simulate a network error
    const req = httpMock.expectOne('/api/test');
    const mockError = new ErrorEvent('Network error', {
      message: 'Connection refused'
    });
    
    req.error(mockError);
  });

  it('should handle unexpected error formats and wrap in HttpErrorResponse', (done) => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with unexpected format'),
      error: (error: any) => {
        // Verify we receive an HttpErrorResponse
        expect(error).toBeInstanceOf(HttpErrorResponse);
        
        // Unexpected formats should be wrapped as Error
        expect(error.error).toBeInstanceOf(Error);
        expect(error.error.message).toContain('Error 400');
        done();
      }
    });

    // Respond with an unexpected error format
    const req = httpMock.expectOne('/api/test');
    
    // Neither ErrorResponse nor ValidationErrorResponse
    const unexpectedResponse = {
      someUnexpectedProperty: 'value'
    };
    
    req.flush(unexpectedResponse, { 
      status: 400, 
      statusText: 'Bad Request' 
    });
  });
}); 