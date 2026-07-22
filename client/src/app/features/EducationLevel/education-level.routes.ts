import { Routes } from '@angular/router';

export const EDUCATION_LEVEL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/education-level-list/education-level-list.component').then(
        (component) => component.EducationLevelListComponent,
      ),
  },
];
