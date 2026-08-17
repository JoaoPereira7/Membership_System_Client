import { Routes } from '@angular/router';

export const CHURCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/church-list/church-list.component').then(
        (component) => component.ChurchListComponent,
      ),
  },
];
