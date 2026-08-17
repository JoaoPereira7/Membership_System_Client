import { Routes } from '@angular/router';

export const CHURCH_DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/church-department-list/church-department-list.component').then(
        (component) => component.ChurchDepartmentListComponent,
      ),
  },
];
