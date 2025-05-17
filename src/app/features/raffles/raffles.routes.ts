import { Routes } from '@angular/router';

export const RAFFLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/raffles-page.component').then(m => m.RafflesPageComponent)
  }
]; 