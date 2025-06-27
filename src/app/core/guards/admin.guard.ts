import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { UsersService } from '../services/users.service';
import { AssociationRole } from '../models/user.model';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const usersService = inject(UsersService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
  }

  return usersService.getCurrentUserProfile().pipe(
    map(profile => {
      if (profile.role === AssociationRole.ADMIN) {
        return true;
      }
      return router.parseUrl('/raffles');
    }),
    catchError(() => {
      return of(router.parseUrl('/raffles'));
    })
  );
}; 