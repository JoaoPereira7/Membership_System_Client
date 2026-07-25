import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/account-list/account-list.component').then(
        (component) => component.AccountListComponent,
      ),
  },
];
