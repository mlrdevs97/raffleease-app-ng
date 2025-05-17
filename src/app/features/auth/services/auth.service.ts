import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState, LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, RegisterEmailVerificationRequest } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap, map, of } from 'rxjs';
import { SuccessResponse } from '../../../core/models/api-response.model';

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
    // Check localStorage first (for "remember me" users)
    let storedUser = localStorage.getItem('user');
    let storedToken = localStorage.getItem('accessToken');
    let storedAssociationId = localStorage.getItem('associationId');
    let storageType = localStorage;
    
    // If not found in localStorage, check sessionStorage (for regular users)
    if (!storedToken) {
      storedUser = sessionStorage.getItem('user');
      storedToken = sessionStorage.getItem('accessToken');
      storedAssociationId = sessionStorage.getItem('associationId');
      storageType = sessionStorage;
    }
    
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
    // localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('associationId');
    
    // sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('associationId');
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<SuccessResponse<RegisterResponse>>(`${this.apiUrl}/auth/register`, registerData).pipe(
      tap((response) => {
        if (response?.data?.email) {
          this.router.navigate(['/auth/verify-email'], { state: { email: response.data.email } });
        } else {
          this.router.navigate(['/auth/verify-email']);
        }
      }),
      map((response) => response?.data as RegisterResponse)
    );
  }

  verifyEmail(token: string): Observable<SuccessResponse<void>> {
    return this.http.post<SuccessResponse>(`${this.apiUrl}/auth/verify`, { verificationToken: token });
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<void> {
    const loginRequest: LoginRequest = { email, password, rememberMe };
    return this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap((response) => {
        console.log('login response', response);
        const authResponse = response?.data;
        if (!authResponse) {
          throw new Error('Invalid server response');
        }
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', authResponse.accessToken);
        storage.setItem('associationId', authResponse.associationId.toString());
      }),
      map((response) => response?.data?.associationId),
      // Fetch user profile and update state
      tap(async (associationId) => {
        /*
        const user$ = this.fetchUserProfile();
        user$.subscribe(user => {
          this.authState.update(state => ({
            ...state,
            user,
            associationId,
            isAuthenticated: true
          }));
          this.router.navigate(['/raffles']);
        });
        */
        this.authState.update(state => ({
            ...state,
            associationId,
            isAuthenticated: true
          }));
        this.router.navigate(['/raffles']);
      }),
      map(() => void 0)
    );
  }

  // TODO: add feature to fetch the user andassociation profile
  fetchUserProfile(): Observable<User | null> {
    return of(null);
    return this.http.get<SuccessResponse<User>>(`${this.apiUrl}/users/me`).pipe(
      map(response => {
        const user = response?.data;
        if (!user) {
          throw new Error('Failed to load user profile');
        }
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(user));
        return user;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearStoredAuth();
        this.authState.update(state => ({
          ...state,
          user: null,
          associationId: undefined,
          isAuthenticated: false
        }));
        this.router.navigate(['/auth/login']);
      }),
      map(() => void 0)
    );
  }

  isLoggedIn(): boolean {
    return this.authState().isAuthenticated;
  }
  
  getAssociationId(): number | undefined {
    return this.authState().associationId;
  }
} 