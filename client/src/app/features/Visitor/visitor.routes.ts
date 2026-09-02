import { Routes } from '@angular/router';

export const VISITOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/visitor-list/visitor-list.component').then(
        (component) => component.VisitorListComponent,
      ),
  },
];
