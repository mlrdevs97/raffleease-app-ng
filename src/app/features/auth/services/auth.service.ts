import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState, LoginRequest, RegisterRequest, RegisterEmailVerificationRequest, AuthResponse } from '../models/auth.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authState = signal<AuthState>({
    user: null,
    isAuthenticated: false
  });

  user = this.authState.asReadonly();
  
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedAssociationId = localStorage.getItem('associationId');
    
    if (!storedToken) {
      return;
    }
    
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      const associationId = storedAssociationId ? Number(storedAssociationId) : undefined;
      
      this.authState.update(state => ({
        ...state,
        user,
        associationId,
        isAuthenticated: !!storedToken
      }));
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      this.clearStoredAuth();
    }
  }
  
  private clearStoredAuth(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('associationId');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}, Message: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  async register(registerData: RegisterRequest): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/register`, registerData)
          .pipe(catchError(error => this.handleError(error)))
      );
      
      this.router.navigate(['/auth/verify-email']);
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/verify`, { verificationToken: token })
          .pipe(catchError(error => this.handleError(error)))
      );
      
      this.router.navigate(['/auth/login']);
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    const loginRequest: LoginRequest = { email, password };
    
    try {
      const response = await firstValueFrom(
        this.http.post<{ data: AuthResponse }>(`${this.apiUrl}/auth/login`, loginRequest)
          .pipe(catchError(error => this.handleError(error)))
      );
      
      const authResponse = response?.data;
      
      if (!authResponse) {
        throw new Error('Invalid server response');
      }
      
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('associationId', authResponse.associationId.toString());
      
      const user = await this.fetchUserProfile();
      
      this.authState.update(state => ({
        ...state,
        user,
        associationId: authResponse.associationId,
        isAuthenticated: true
      }));
      
      this.router.navigate(['/dashboard']);
    } catch (error) {
      throw error;
    }
  }
  
  private async fetchUserProfile(): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: User }>(`${this.apiUrl}/users/me`)
          .pipe(catchError(error => this.handleError(error)))
      );
      
      const user = response?.data;
      
      if (!user) {
        throw new Error('Failed to load user profile');
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/logout`, {})
          .pipe(catchError(() => {
            // Even if the API call fails, we'll log out the user locally
            return throwError(() => new Error('Logout failed, but local state cleared'));
          }))
      );
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      this.clearStoredAuth();
      
      this.authState.update(state => ({
        ...state,
        user: null,
        associationId: undefined,
        isAuthenticated: false
      }));
      
      this.router.navigate(['/auth/login']);
    }
  }

  isLoggedIn(): boolean {
    return this.authState().isAuthenticated;
  }
  
  getAssociationId(): number | undefined {
    return this.authState().associationId;
  }
} 