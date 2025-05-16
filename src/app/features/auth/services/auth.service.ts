import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {SuccessResponse } from '../../../core/models/api-response.model';

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
    // Clear both storage types to be safe
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('associationId');
    
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('associationId');
  }

  async register(registerData: RegisterRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<SuccessResponse>(`${this.apiUrl}/auth/register`, registerData)
    );
    
    console.log(response);

    this.router.navigate(['/auth/verify-email']);
  }

  async verifyEmail(token: string): Promise<void> {
    await firstValueFrom(
      this.http.post<SuccessResponse>(`${this.apiUrl}/auth/verify`, { verificationToken: token })
    );
    
    this.router.navigate(['/auth/login']);
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    const loginRequest: LoginRequest = { email, password, rememberMe };
    
    const response = await firstValueFrom(
      this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, loginRequest)
    );
    
    const authResponse = response?.data;
    
    if (!authResponse) {
      throw new Error('Invalid server response');
    }
    
    // Store auth data in localStorage or sessionStorage based on rememberMe
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', authResponse.accessToken);
    storage.setItem('associationId', authResponse.associationId.toString());
    
    const user = await this.fetchUserProfile();
    
    this.authState.update(state => ({
      ...state,
      user,
      associationId: authResponse.associationId,
      isAuthenticated: true
    }));
    
    this.router.navigate(['/dashboard']);
  }

  private async fetchUserProfile(): Promise<User> {
    const response = await firstValueFrom(
      this.http.get<SuccessResponse<User>>(`${this.apiUrl}/users/me`)
    );
    
    const user = response?.data;
    
    if (!user) {
      throw new Error('Failed to load user profile');
    }
    
    // Determine which storage to use based on where the accessToken is stored
    const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<any>(`${this.apiUrl}/auth/logout`, {}));
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