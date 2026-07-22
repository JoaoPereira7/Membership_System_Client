import { Routes } from '@angular/router';

export const LEADER_TYPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/leader-type-list/leader-type-list.component').then(
        (component) => component.LeaderTypeListComponent,
      ),
  },
];
