import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState, LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, RegisterEmailVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap, map } from 'rxjs';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { jwtDecode } from 'jwt-decode';
import { ClientValidationMessages } from '../../../core/constants/client-validation-messages';
import { PUBLIC_CLIENT_ROUTES, isPublicClientRoute } from '../../../core/constants/public-routes';

interface DecodedToken {
  exp: number;
  sub: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authState = signal<AuthState>({
    isAuthenticated: false,
    token: null
  });

  private tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuthState();
  }

  getToken(): string | null {
    return this.authState().token;
  }

  getUserId(): number | undefined {
    return this.authState().userId;
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<SuccessResponse<RegisterResponse>>(`${this.apiUrl}/auth/register`, registerData).pipe(
      tap((response: SuccessResponse<RegisterResponse>) => {
        if (response?.data?.email) {
          this.router.navigate(['/auth/verify-email'], { state: { email: response.data.email } });
        } else {
          this.router.navigate(['/auth/verify-email']);
        }
      }),
      map((response: SuccessResponse<RegisterResponse>) => response?.data as RegisterResponse)
    );
  }

  verifyEmail(token: string): Observable<SuccessResponse<void>> {
    return this.http.post<SuccessResponse<void>>(`${this.apiUrl}/auth/verify`, { verificationToken: token });
  }

  forgotPassword(email: string): Observable<SuccessResponse<void>> {
    const request: ForgotPasswordRequest = { email };
    return this.http.post<SuccessResponse<void>>(`${this.apiUrl}/auth/forgot-password`, request);
  }

  resetPassword(resetData: ResetPasswordRequest): Observable<SuccessResponse<void>> {
    return this.http.post<SuccessResponse<void>>(`${this.apiUrl}/auth/reset-password`, resetData);
  }

  login(identifier: string, password: string, rememberMe: boolean = false): Observable<void> {
    const loginRequest: LoginRequest = { identifier, password };
    return this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap((response: SuccessResponse<AuthResponse>) => {
        const authResponse = response?.data;
        if (!authResponse) {
          throw new Error(ClientValidationMessages.auth.invalidServerResponse);
        }

        localStorage.setItem('accessToken', authResponse.accessToken);
        localStorage.setItem('associationId', authResponse.associationId.toString());
        localStorage.setItem('userId', authResponse.userId.toString());

        this.authState.update(state => ({
          ...state,
          token: authResponse.accessToken
        }));

        this.setTokenRefreshTimer(authResponse.accessToken);
      }),
      map((response: SuccessResponse<AuthResponse>) => ({
        associationId: response?.data?.associationId as number,
        userId: response?.data?.userId as number
      })),
      tap(({ associationId, userId }) => {
        this.authState.update(state => ({
          ...state,
          associationId,
          userId,
          isAuthenticated: true
        }));
        this.router.navigate(['/raffles']);
      }),
      map(() => void 0)
    );
  }

  logout(): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.closeSession();
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

  requireAssociationId(): number {
    const associationId = this.authState().associationId;
    if (!associationId) {
      this.closeSession();
      throw new Error(ClientValidationMessages.auth.authenticationRequired);
    }
    return associationId;
  }

  requireUserId(): number {
    const userId = this.authState().userId;
    if (!userId) {
      this.closeSession();
      throw new Error(ClientValidationMessages.auth.authenticationRequired);
    }
    return userId;
  }

  private setTokenRefreshTimer(token: string): void {
    const decodedToken: DecodedToken = jwtDecode(token);
    const expiresIn = decodedToken.exp * 1000 - Date.now() - 60000;

    if (expiresIn <= 0) {
      this.closeSession();
      return;
    }

    this.tokenRefreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, expiresIn);
  }

  private refreshToken(): void {
    this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/tokens/refresh`, {}).subscribe({
      next: (response: SuccessResponse<AuthResponse>) => {
        const authResponse: AuthResponse | null = response?.data;
        if (authResponse) {
          localStorage.setItem('accessToken', authResponse.accessToken);
          localStorage.setItem('associationId', authResponse.associationId.toString());
          localStorage.setItem('userId', authResponse.userId.toString());
          
          this.authState.update(state => ({
            ...state,
            associationId: authResponse.associationId,
            userId: authResponse.userId,
            token: authResponse.accessToken
          }));
          this.setTokenRefreshTimer(authResponse.accessToken);
        }
      },
      error: (error) => {
        this.closeSession();
      }
    });
  }

  private isPublicRoute(): boolean {
    const currentUrl = this.router.url.split('?')[0];
    return isPublicClientRoute(currentUrl);
  }

  private closeSession(): void {
    this.clearStoredAuth();    
    this.authState.update(state => ({
      ...state,
      associationId: undefined,
      userId: undefined,
      isAuthenticated: false,
      token: null 
    }));
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }    
    
    if (!this.isPublicRoute()) {
      this.router.navigate(['/auth/login']);
    }
  }

  private checkAuthState(): void {
    let storedToken = localStorage.getItem('accessToken');
    let storedAssociationId = localStorage.getItem('associationId');
    let storedUserId = localStorage.getItem('userId');

    if (!storedToken) {
      // Only close session (and potentially redirect) if not on a public route
      if (!this.isPublicRoute()) {
        this.closeSession();
      } else {
        // Just clear the auth state without redirecting
        this.authState.update(state => ({
          ...state,
          associationId: undefined,
          userId: undefined,
          isAuthenticated: false,
          token: null 
        }));
      }
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(storedToken);
      if (decodedToken.exp * 1000 < Date.now()) {
        this.closeSession();
        return;
      }

      const associationId = storedAssociationId ? Number(storedAssociationId) : undefined;
      const userId = storedUserId ? Number(storedUserId) : undefined;

      this.authState.update(state => ({
        ...state,
        associationId,
        userId,
        isAuthenticated: !!storedToken,
        token: storedToken
      }));

      this.setTokenRefreshTimer(storedToken);
    } catch (error) {
      this.clearStoredAuth();
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('associationId');
    localStorage.removeItem('userId');
  }
} 