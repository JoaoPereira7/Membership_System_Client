import { Routes } from '@angular/router';

export const MARITAL_STATUS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/marital-status-list/marital-status-list.component').then(
        (component) => component.MaritalStatusListComponent,
      ),
  },
];
