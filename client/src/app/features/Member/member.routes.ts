import { Routes } from '@angular/router';
export const MEMBER_ROUTES: Routes = [
  {
    path: ':id/membership-form',
    loadComponent: () =>
      import('./Pages/membership-form/membership-form.component').then(
        (component) => component.MembershipFormComponent,
      ),
    data: { title: 'Ficha de Membresia', breadcrumb: ['Membros', 'Ficha de Membresia'] },
  },
  {
    path: '',
    loadComponent: () =>
      import('./Pages/member-list/member-list.component').then((m) => m.MemberListComponent),
  },
];
