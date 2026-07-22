import { Routes } from '@angular/router';

export const FORMATION_AREA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/formation-area-list/formation-area-list.component').then(
        (component) => component.FormationAreaListComponent,
      ),
  },
];
