import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const MANAGE_ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/manage-accounts-page/manage-accounts-page.component').then(m => m.ManageAccountsPageComponent),
    canActivate: [adminGuard],
    title: 'Manage Accounts'
  },
  {
    path: 'create-account',
    loadComponent: () => import('./pages/create-account/create-account.component').then(m => m.CreateAccountComponent),
    canActivate: [adminGuard],
    title: 'Create Account'
  }
]; 