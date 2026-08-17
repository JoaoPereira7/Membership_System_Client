import { Routes } from '@angular/router';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/department-list/department-list.component').then(
        (component) => component.DepartmentListComponent,
      ),
  },
];
