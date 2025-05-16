import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';
import { User, RegisterRequest, AuthResponse } from '../models/auth.model';
import { SuccessResponse } from '../../../core/models/api-response.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiUrl = environment.apiUrl;
  // For timestamp consistency
  const mockTimestamp = new Date().toISOString();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage before each test
    localStorage.clear();
    
    // Spy on router navigate method
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    // Verify that there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize with unauthenticated state when no token exists', () => {
      expect(service.user().isAuthenticated).toBe(false);
      expect(service.user().user).toBeNull();
    });

    it('should initialize with authenticated state when token exists', () => {
      // Set up localStorage with auth data
      const mockUser: User = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com', 
        userName: 'johndoe'
      };
      
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('associationId', '123');
      
      // Create a new instance to test initialization
      const freshService = TestBed.inject(AuthService);
      
      expect(freshService.user().isAuthenticated).toBe(true);
      expect(freshService.user().user).toEqual(mockUser);
      // Number stored in localStorage comes back as a number in the JS object,
      // even though it was stored as a string.
      const associationId = freshService.user().associationId;
      expect(associationId).toBeDefined();
      expect(typeof associationId === 'number').toBeTrue();
      expect(associationId).toBe(123);
    });

    it('should handle corrupted localStorage data', () => {
      // Set up localStorage with invalid data
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('user', 'not-valid-json');
      
      // Create a new instance to test initialization
      const freshService = TestBed.inject(AuthService);
      
      // Service should clear invalid data
      expect(freshService.user().isAuthenticated).toBe(false);
      expect(freshService.user().user).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('register()', () => {
    it('should register a new user and navigate to verify email page', fakeAsync(() => {
      // Test data
      const registerData: RegisterRequest = {
        userData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          userName: 'johndoe',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        },
        associationData: {
          associationName: 'Test Association',
          description: 'A test association',
          email: 'association@example.com',
          addressData: {
            formattedAddress: '123 Main St, San Francisco, CA 94105, USA',
            placeId: 'place123',
            latitude: 37.7749,
            longitude: -122.4194,
            city: 'San Francisco',
            province: 'CA',
            zipCode: '94105'
          }
        }
      };
      
      // Make the call
      const promise = service.register(registerData);
      
      // Expect a request to the register endpoint
      const req = httpMock.expectOne(`${apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      
      // Mock successful response
      req.flush({ 
        success: true, 
        message: 'Registration successful',
        timestamp: mockTimestamp
      });
      
      // Complete the async operation
      tick();
      
      // Verify navigation to verify-email page
      return promise.then(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/auth/verify-email']);
      });
    }));
  });

  describe('verifyEmail()', () => {
    it('should verify email and navigate to login page', fakeAsync(() => {
      const token = 'verification-token-123';
      
      // Make the call
      const promise = service.verifyEmail(token);
      
      // Expect a request to the verify endpoint
      const req = httpMock.expectOne(`${apiUrl}/auth/verify`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ verificationToken: token });
      
      // Mock successful response
      req.flush({ 
        success: true, 
        message: 'Email verified successfully',
        timestamp: mockTimestamp
      });
      
      // Complete the async operation
      tick();
      
      // Verify navigation to login page
      return promise.then(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    }));
  });

  describe('login()', () => {
    it('should authenticate user, store tokens, fetch profile and navigate to dashboard', fakeAsync(() => {
      // Login data
      const email = 'john@example.com';
      const password = 'Password123!';
      
      // Mock response data
      const mockAuthResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        associationId: 123
      };
      
      const mockUserProfile: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        userName: 'johndoe'
      };
      
      // Make the login call
      const promise = service.login(email, password);
      
      // Expect a request to the login endpoint
      const loginReq = httpMock.expectOne(`${apiUrl}/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual({ email, password });
      
      // Mock successful login response
      const loginResponse: SuccessResponse<AuthResponse> = {
        success: true,
        message: 'Login successful',
        data: mockAuthResponse,
        timestamp: mockTimestamp
      };
      loginReq.flush(loginResponse);
      
      // Expect a request to fetch user profile
      const profileReq = httpMock.expectOne(`${apiUrl}/users/me`);
      expect(profileReq.request.method).toBe('GET');
      
      // Mock successful profile response
      const profileResponse: SuccessResponse<User> = {
        success: true,
        message: 'Profile retrieved',
        data: mockUserProfile,
        timestamp: mockTimestamp
      };
      profileReq.flush(profileResponse);
      
      // Complete the async operation
      tick();
      
      // Verify data was stored and state was updated
      return promise.then(() => {
        // Check localStorage
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
        expect(localStorage.getItem('associationId')).toBe('123');
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUserProfile));
        
        // Check auth state
        expect(service.user().isAuthenticated).toBe(true);
        expect(service.user().user).toEqual(mockUserProfile);
        
        // Test the associationId separately to avoid type errors
        const associationId = service.user().associationId;
        expect(associationId).toBeDefined();
        expect(typeof associationId === 'number').toBeTrue();
        expect(associationId).toBe(123);
        
        // Check navigation
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      });
    }));

    it('should handle login errors', fakeAsync(() => {
      // Make the login call
      const promise = service.login('wrong@example.com', 'wrong-password');
      
      // Expect a request to the login endpoint
      const loginReq = httpMock.expectOne(`${apiUrl}/auth/login`);
      
      // Mock error response
      loginReq.error(new ErrorEvent('Network error'), {
        status: 401,
        statusText: 'Unauthorized'
      });
      
      // Complete the async operation
      tick();
      
      // Verify the promise was rejected
      return promise.catch(error => {
        expect(error).toBeTruthy();
        expect(service.user().isAuthenticated).toBe(false);
        expect(localStorage.getItem('accessToken')).toBeNull();
      });
    }));

    it('should handle invalid server responses', fakeAsync(() => {
      // Make the login call
      const promise = service.login('test@example.com', 'password');
      
      // Expect a request to the login endpoint
      const loginReq = httpMock.expectOne(`${apiUrl}/auth/login`);
      
      // Mock empty/invalid response
      const invalidResponse: SuccessResponse<any> = {
        success: true,
        message: 'Success but no data',
        data: null,
        timestamp: mockTimestamp
      };
      loginReq.flush(invalidResponse);
      
      // Complete the async operation
      tick();
      
      // Verify the promise was rejected with the right error
      return promise.catch(error => {
        expect(error.message).toBe('Invalid server response');
        expect(service.user().isAuthenticated).toBe(false);
      });
    }));

    it('should handle failed profile fetch', fakeAsync(() => {
      // Login data
      const email = 'john@example.com';
      const password = 'Password123!';
      
      // Mock auth response
      const mockAuthResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        associationId: 123
      };
      
      // Make the login call
      const promise = service.login(email, password);
      
      // Expect a request to the login endpoint
      const loginReq = httpMock.expectOne(`${apiUrl}/auth/login`);
      
      // Mock successful login response
      const loginResponse: SuccessResponse<AuthResponse> = {
        success: true,
        message: 'Login successful',
        data: mockAuthResponse,
        timestamp: mockTimestamp
      };
      loginReq.flush(loginResponse);
      
      // Expect a request to fetch user profile
      const profileReq = httpMock.expectOne(`${apiUrl}/users/me`);
      
      // Mock profile fetch failure
      const invalidProfileResponse: SuccessResponse<null> = {
        success: false,
        message: 'Failed to get profile',
        data: null,
        timestamp: mockTimestamp
      };
      profileReq.flush(invalidProfileResponse);
      
      // Complete the async operation
      tick();
      
      // Verify the promise was rejected with the right error
      return promise.catch(error => {
        expect(error.message).toBe('Failed to load user profile');
        
        // Tokens should be saved but auth state not updated
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
        expect(service.user().isAuthenticated).toBe(false);
      });
    }));
  });

  describe('logout()', () => {
    it('should log out user, clear stored data and navigate to login page', fakeAsync(() => {
      // Set up authenticated state
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
      localStorage.setItem('associationId', '123');
      
      // Force service to recognize authenticated state
      service['authState'].update(state => ({
        ...state,
        user: { id: 1, name: 'Test User' } as unknown as User,
        associationId: 123,
        isAuthenticated: true
      }));
      
      // Make the logout call
      const promise = service.logout();
      
      // Expect a request to the logout endpoint
      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      
      // Mock successful response
      req.flush({ 
        success: true, 
        message: 'Logged out successfully',
        timestamp: mockTimestamp
      });
      
      // Complete the async operation
      tick();
      
      // Verify state was cleared
      return promise.then(() => {
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(localStorage.getItem('associationId')).toBeNull();
        
        expect(service.user().isAuthenticated).toBe(false);
        expect(service.user().user).toBeNull();
        expect(service.user().associationId).toBeUndefined();
        
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    }));

    it('should still log out locally even if server logout fails', fakeAsync(() => {
      // Set up authenticated state
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
      
      // Force service to recognize authenticated state
      service['authState'].update(state => ({
        ...state,
        user: { id: 1, name: 'Test User' } as unknown as User,
        isAuthenticated: true
      }));
      
      // Make the logout call
      const promise = service.logout();
      
      // Expect a request to the logout endpoint
      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      
      // Mock server error
      req.error(new ErrorEvent('Network error'), {
        status: 500,
        statusText: 'Server Error'
      });
      
      // Complete the async operation
      tick();
      
      // Verify state was still cleared despite server error
      return promise.then(() => {
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        
        expect(service.user().isAuthenticated).toBe(false);
        expect(service.user().user).toBeNull();
        
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    }));
  });

  describe('Helper methods', () => {
    it('isLoggedIn should return authentication state', () => {
      expect(service.isLoggedIn()).toBe(false);
      
      // Update auth state
      service['authState'].update(state => ({
        ...state,
        isAuthenticated: true
      }));
      
      expect(service.isLoggedIn()).toBe(true);
    });
    
    it('getAssociationId should return association ID', () => {
      expect(service.getAssociationId()).toBeUndefined();
      
      // Update auth state with association ID
      service['authState'].update(state => ({
        ...state,
        associationId: 123
      }));
      
      const result = service.getAssociationId();
      expect(result).toBeDefined();
      expect(typeof result === 'number').toBeTrue();
      expect(result).toBe(123);
    });
  });
}); 