import { Routes } from '@angular/router';

export const GENDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/gender-list/gender-list.component').then(
        (component) => component.GenderListComponent,
      ),
  },
];
