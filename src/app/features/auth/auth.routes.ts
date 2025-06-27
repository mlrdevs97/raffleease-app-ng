import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Register'
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Verify Email'
  },
  {
    path: 'email-verification',
    loadComponent: () => import('./pages/email-verification/email-verification.component').then(m => m.EmailVerificationComponent),
    title: 'Email Verification'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/forgot-password-reset/forgot-password-reset.component').then(m => m.ForgotPasswordResetComponent),
    title: 'Reset Password'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 