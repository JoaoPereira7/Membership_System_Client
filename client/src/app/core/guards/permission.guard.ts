import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanMatchFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permission = route.data?.['permission'] as string | undefined;

  if (!permission) return router.createUrlTree(['/forbidden']);

  return auth.ensureAuthenticated().pipe(
    map((authenticated) =>
      authenticated && auth.hasPermission(permission)
        ? true
        : router.createUrlTree([authenticated ? '/forbidden' : '/login']),
    ),
  );
};
