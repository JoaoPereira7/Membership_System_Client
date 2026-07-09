import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { createPaginatorIntlPtBr } from './core/config/material/paginator-intl-pt-br';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: MatPaginatorIntl,
      useFactory: createPaginatorIntlPtBr,
    },
  ],
};
