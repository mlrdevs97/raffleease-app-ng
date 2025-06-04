import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState, LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, RegisterEmailVerificationRequest } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap, map } from 'rxjs';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { jwtDecode } from 'jwt-decode';
import { ClientValidationMessages } from '../../../core/constants/client-validation-messages';

interface DecodedToken {
  exp: number;
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

        this.authState.update(state => ({
          ...state,
          token: authResponse.accessToken
        }));

        this.setTokenRefreshTimer(authResponse.accessToken);
      }),
      map((response: SuccessResponse<AuthResponse>) => response?.data?.associationId as number),
      tap((associationId: number) => {
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
          this.authState.update(state => ({
            ...state,
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

  private closeSession(): void {
    this.clearStoredAuth();    
    this.authState.update(state => ({
      ...state,
      associationId: undefined,
      isAuthenticated: false,
      token: null 
    }));
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }    
    this.router.navigate(['/auth/login']);    
  }

  private checkAuthState(): void {
    let storedToken = localStorage.getItem('accessToken');
    let storedAssociationId = localStorage.getItem('associationId');

    if (!storedToken) {
      this.closeSession();
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(storedToken);
      if (decodedToken.exp * 1000 < Date.now()) {
        this.closeSession();
        return;
      }

      const associationId = storedAssociationId ? Number(storedAssociationId) : undefined;

      this.authState.update(state => ({
        ...state,
        associationId,
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
  }
} 