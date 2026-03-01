import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];

  if (allowedRoles.length === 0 || authService.hasRole(allowedRoles)) {
    return true;
  }
  return router.createUrlTree(['/home']);
};
