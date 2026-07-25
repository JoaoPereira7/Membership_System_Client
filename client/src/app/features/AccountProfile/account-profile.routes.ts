import { Routes } from '@angular/router';

export const ACCOUNT_PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/account-profile-list/account-profile-list.component').then(
        (component) => component.AccountProfileListComponent,
      ),
  },
];
