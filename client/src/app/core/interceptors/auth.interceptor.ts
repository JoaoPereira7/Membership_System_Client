import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

const PUBLIC_AUTH_ENDPOINTS = ['/Auth/login', '/Auth/refresh', '/Auth/logout'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.some((path) => request.url.endsWith(path));

  if (!isApiRequest || isPublicAuthRequest) return next(request);

  const accessToken = auth.getAccessToken();
  const authorizedRequest = accessToken
    ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((response) =>
          next(
            request.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` },
            }),
          ),
        ),
        catchError((refreshError: unknown) => {
          auth.clearSession();
          const returnUrl = router.url !== '/login' ? router.url : '/';
          void router.navigate(['/login'], { queryParams: { returnUrl } });
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
