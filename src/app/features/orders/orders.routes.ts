import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orders-page/orders-page.component').then(c => c.OrdersPageComponent)
  }, 
  {
    path: 'create',
    loadComponent: () => import('./pages/create-order/create-order-page.component').then(c => c.CreateOrderPageComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/order-details-page/order-details-page.component').then(c => c.OrderDetailsPageComponent)
  }
]; 