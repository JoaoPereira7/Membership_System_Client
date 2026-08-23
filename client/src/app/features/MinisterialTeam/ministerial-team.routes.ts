import { Routes } from '@angular/router';

export const MINISTERIAL_TEAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/ministerial-team-list/ministerial-team-list.component').then(
        (component) => component.MinisterialTeamListComponent,
      ),
  },
];
