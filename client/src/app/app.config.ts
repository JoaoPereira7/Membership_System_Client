import { DOCUMENT } from '@angular/common';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, provideRouter, withViewTransitions } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { createPaginatorIntlPtBr } from './core/config/material/paginator-intl-pt-br';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';

function containsRoute(snapshot: ActivatedRouteSnapshot, path: string): boolean {
  let current: ActivatedRouteSnapshot | null = snapshot;

  while (current) {
    if (current.routeConfig?.path === path) return true;
    current = current.firstChild;
  }

  return false;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiErrorInterceptor])),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          const document = inject(DOCUMENT);
          const leavingLogin = containsRoute(from, 'login');
          const enteringLogin = containsRoute(to, 'login');

          document.documentElement.dataset['routeTransition'] = leavingLogin
            ? 'login-to-app'
            : enteringLogin
              ? 'app-to-login'
              : 'internal';

          void transition.finished.finally(() => {
            delete document.documentElement.dataset['routeTransition'];
          });
        },
      }),
    ),
    provideEnvironmentNgxMask(),
    provideClientHydration(withEventReplay()),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        subscriptSizing: 'dynamic',
      },
    },
    {
      provide: MatPaginatorIntl,
      useFactory: createPaginatorIntlPtBr,
    },
  ],
};
