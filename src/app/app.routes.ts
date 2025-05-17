import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-container/main-container.component').then(c => c.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'raffles',
        pathMatch: 'full'
      },
      {
        path: 'raffles',
        loadChildren: () => import('./features/raffles/raffles.routes').then(m => m.RAFFLES_ROUTES)
      }
    ]
  }
];
