import { Routes } from '@angular/router';

export const CHURCHES_REGION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/churches-region-list/churches-region-list.component').then(
        (component) => component.ChurchesRegionListComponent,
      ),
  },
];
