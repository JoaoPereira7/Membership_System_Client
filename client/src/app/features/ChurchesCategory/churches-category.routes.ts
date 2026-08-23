import { Routes } from '@angular/router';

export const CHURCHES_CATEGORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/churches-category-list/churches-category-list.component').then(
        (component) => component.ChurchesCategoryListComponent,
      ),
  },
];
