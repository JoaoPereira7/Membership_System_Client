import { Routes } from '@angular/router';
export const MEMBER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./Pages/member-list/member-list.component').then(m => m.MemberListComponent) },
];
