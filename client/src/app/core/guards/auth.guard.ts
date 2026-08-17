import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../auth/auth.service';

function authorize(url: string) {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureAuthenticated().pipe(
    map((authenticated) =>
      authenticated
        ? true
        : router.createUrlTree(['/login'], { queryParams: { returnUrl: url } }),
    ),
  );
}

export const authGuard: CanActivateFn = (_route, state) => authorize(state.url);
export const authChildGuard: CanActivateChildFn = (_route, state) => authorize(state.url);
