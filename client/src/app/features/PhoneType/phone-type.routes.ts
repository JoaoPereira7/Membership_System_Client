import { Routes } from '@angular/router';

export const PHONE_TYPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/phone-type-list/phone-type-list.component').then(
        (component) => component.PhoneTypeListComponent,
      ),
  },
];
