import { Routes } from '@angular/router';

export const MEMBERSHIP_STATUS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/membership-status-list/membership-status-list.component').then(
        (component) => component.MembershipStatusListComponent,
      ),
  },
];
