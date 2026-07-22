import { Routes } from '@angular/router';

export const ADDRESS_TYPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/address-type-list/address-type-list.component').then(
        (component) => component.AddressTypeListComponent,
      ),
  },
];
