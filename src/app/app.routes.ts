import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/main-container/main-container.component').then(c => c.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'raffles',
        pathMatch: 'full'
      },
      {
        path: 'raffles',
        loadChildren: () => import('./features/raffles/raffles.routes').then(m => m.RAFFLES_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profiles/profiles.routes').then(m => m.PROFILES_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'accounts',
        loadChildren: () => import('./features/manage-accounts/manage-accounts.routes').then(m => m.MANAGE_ACCOUNTS_ROUTES),
        canActivate: [authGuard]
      }
    ]
  }
];
