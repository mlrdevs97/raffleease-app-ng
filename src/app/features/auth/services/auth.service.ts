import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = signal<AuthState>({
    user: null,
    isAuthenticated: false
  });

  user = this.authState.asReadonly();
  
  constructor(private router: Router) {
    // Check if user is already logged in (e.g., from localStorage)
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return;
    }
    
    try {
      const user = JSON.parse(storedUser);
      this.authState.update(state => ({
        ...state,
        user,
        isAuthenticated: true
      }));
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
    }
  }

  register(name: string, email: string, password: string): Promise<void> {
    const registerRequest: RegisterRequest = { name, email, password };
    
    // TODO: This is just a mock implementation for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        this.authState.update(state => ({
          ...state,
          user,
          isAuthenticated: true
        }));
        
        resolve();
        this.router.navigate(['/dashboard']);
      }, 800); // Simulating network delay
    });
  }

  login(email: string, password: string): Promise<void> {
    const loginRequest: LoginRequest = { email, password };
    
    // TODO: This is just a mock implementation for now
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would be validated against an API
        if (email !== 'user@example.com' || password !== 'password') {
          reject(new Error('Invalid email or password'));
          return;
        }
        
        const user: User = {
          id: '1',
          name: 'Demo User',
          email
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        this.authState.update(state => ({
          ...state,
          user,
          isAuthenticated: true
        }));
        
        resolve();
        this.router.navigate(['/dashboard']);
      }, 800); // Simulating network delay
    });
  }

  logout(): void {
    localStorage.removeItem('user');
    
    this.authState.update(state => ({
      ...state,
      user: null,
      isAuthenticated: false
    }));
    
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.authState().isAuthenticated;
  }
} 