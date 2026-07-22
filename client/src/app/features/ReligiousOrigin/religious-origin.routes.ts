import { Routes } from '@angular/router';

export const RELIGIOUS_ORIGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/religious-origin-list/religious-origin-list.component').then(
        (component) => component.ReligiousOriginListComponent,
      ),
  },
];
