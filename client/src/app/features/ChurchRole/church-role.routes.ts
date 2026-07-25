import { Routes } from '@angular/router';

export const CHURCH_ROLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/church-role-list/church-role-list.component').then(
        (component) => component.ChurchRoleListComponent,
      ),
  },
];
