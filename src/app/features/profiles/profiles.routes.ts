import { Routes } from '@angular/router';

export const PROFILES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    title: 'Profile'
  },
  {
    path: 'verify-email-update',
    loadComponent: () => import('./components/updated-email-verification/updated-email-verification.component').then(m => m.UpdatedEmailVerificationComponent),
    title: 'Email Verification'
  }
]; 