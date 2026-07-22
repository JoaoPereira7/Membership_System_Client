import { Routes } from '@angular/router';

export const PROFESSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/profession-list/profession-list.component').then(
        (component) => component.ProfessionListComponent,
      ),
  },
];
