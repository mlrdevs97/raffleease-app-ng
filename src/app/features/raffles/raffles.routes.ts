import { Routes } from '@angular/router';

export const RAFFLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/raffles-page/raffles-page.component').then(c => c.RafflesPageComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/create-raffles/create-raffle-page.component').then(c => c.CreateRafflePageComponent)
  }
]; 