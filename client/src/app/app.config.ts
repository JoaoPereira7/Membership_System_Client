import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { createPaginatorIntlPtBr } from './core/config/material/paginator-intl-pt-br';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideEnvironmentNgxMask(),
    provideClientHydration(withEventReplay()),
    {
      provide: MatPaginatorIntl,
      useFactory: createPaginatorIntlPtBr,
    },
  ],
};
