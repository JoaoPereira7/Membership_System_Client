import { Routes } from '@angular/router';

import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/Auth/Pages/login/login.component').then(
        (component) => component.LoginComponent,
      ),
    data: { title: 'Login' },
  },
];

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    canMatch: [permissionGuard],
    loadComponent: () =>
      import('./features/home/home.component').then((component) => component.HomeComponent),
    data: { title: 'Home', breadcrumb: ['Home'], permission: 'DASHBOARD_VIEW' },
  },
  {
    path: 'members',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/Member/member.routes').then((routes) => routes.MEMBER_ROUTES),
    data: { title: 'Membros', breadcrumb: ['Membros'], permission: 'MEMBER_VIEW' },
  },
  {
    path: 'organization/church-departments',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/ChurchDepartment/church-department.routes').then(
        (routes) => routes.CHURCH_DEPARTMENT_ROUTES,
      ),
    data: {
      title: 'Departamentos por Igreja',
      breadcrumb: ['Organização', 'Departamentos por Igreja'],
      permission: 'CHURCH_DEPARTMENT_VIEW',
    },
  },
  {
    path: 'organization/churches',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/Church/church.routes').then((routes) => routes.CHURCH_ROUTES),
    data: {
      title: 'Igrejas',
      breadcrumb: ['Organização', 'Igrejas'],
      permission: 'CHURCH_VIEW',
    },
  },
  {
    path: 'organization/church-roles',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/ChurchRole/church-role.routes').then(
        (routes) => routes.CHURCH_ROLE_ROUTES,
      ),
    data: {
      title: 'Cargos eclesiásticos',
      breadcrumb: ['Organização', 'Cargos eclesiásticos'],
      permission: 'CHURCH_ROLE_VIEW',
    },
  },
  {
    path: 'organization/departments',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/Department/department.routes').then((routes) => routes.DEPARTMENT_ROUTES),
    data: {
      title: 'Departamentos',
      breadcrumb: ['Organização', 'Departamentos'],
      permission: 'DEPARTMENT_VIEW',
    },
  },
  {
    path: 'administration/accounts',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/Account/account.routes').then((routes) => routes.ACCOUNT_ROUTES),
    data: {
      title: 'Usuários',
      breadcrumb: ['Administração', 'Usuários'],
      permission: 'ACCOUNT_VIEW',
    },
  },
  {
    path: 'administration/account-profiles',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/AccountProfile/account-profile.routes').then(
        (routes) => routes.ACCOUNT_PROFILE_ROUTES,
      ),
    data: {
      title: 'Perfis de acesso',
      breadcrumb: ['Administração', 'Perfis de acesso'],
      permission: 'ACCOUNT_PROFILE_VIEW',
    },
  },
  {
    path: 'auxiliary-data/church-categories',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/ChurchesCategory/churches-category.routes').then(
        (routes) => routes.CHURCHES_CATEGORY_ROUTES,
      ),
    data: {
      title: 'Categorias de igreja',
      breadcrumb: ['Cadastros Auxiliares', 'Categorias de igreja'],
      permission: 'CHURCHES_CATEGORY_VIEW',
    },
  },
  {
    path: 'auxiliary-data/church-regions',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/ChurchesRegion/churches-region.routes').then(
        (routes) => routes.CHURCHES_REGION_ROUTES,
      ),
    data: {
      title: 'Regiões de igreja',
      breadcrumb: ['Cadastros Auxiliares', 'Regiões de igreja'],
      permission: 'CHURCHES_REGION_VIEW',
    },
  },
  {
    path: 'auxiliary-data/genders',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/Gender/gender.routes').then((routes) => routes.GENDER_ROUTES),
    data: {
      title: 'Gêneros',
      breadcrumb: ['Cadastros Auxiliares', 'Gêneros'],
      permission: 'GENDER_VIEW',
    },
  },
  {
    path: 'auxiliary-data/marital-statuses',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/MaritalStatus/marital-status.routes').then(
        (routes) => routes.MARITAL_STATUS_ROUTES,
      ),
    data: {
      title: 'Estados civis',
      breadcrumb: ['Cadastros Auxiliares', 'Estados civis'],
      permission: 'MARITAL_STATUS_VIEW',
    },
  },
  {
    path: 'auxiliary-data/phone-types',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/PhoneType/phone-type.routes').then((routes) => routes.PHONE_TYPE_ROUTES),
    data: {
      title: 'Tipos de telefone',
      breadcrumb: ['Cadastros Auxiliares', 'Tipos de telefone'],
      permission: 'PHONE_TYPE_VIEW',
    },
  },
  {
    path: 'auxiliary-data/address-types',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/AddressType/address-type.routes').then(
        (routes) => routes.ADDRESS_TYPE_ROUTES,
      ),
    data: {
      title: 'Tipos de endereço',
      breadcrumb: ['Cadastros Auxiliares', 'Tipos de endereço'],
      permission: 'ADDRESS_TYPE_VIEW',
    },
  },
  {
    path: 'auxiliary-data/education-levels',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/EducationLevel/education-level.routes').then(
        (routes) => routes.EDUCATION_LEVEL_ROUTES,
      ),
    data: {
      title: 'Escolaridades',
      breadcrumb: ['Cadastros Auxiliares', 'Escolaridades'],
      permission: 'EDUCATION_LEVEL_VIEW',
    },
  },
  {
    path: 'auxiliary-data/formation-areas',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/FormationArea/formation-area.routes').then(
        (routes) => routes.FORMATION_AREA_ROUTES,
      ),
    data: {
      title: 'Áreas de formação',
      breadcrumb: ['Cadastros Auxiliares', 'Áreas de formação'],
      permission: 'FORMATION_AREA_VIEW',
    },
  },
  {
    path: 'auxiliary-data/professions',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/Profession/profession.routes').then((routes) => routes.PROFESSION_ROUTES),
    data: {
      title: 'Profissões',
      breadcrumb: ['Cadastros Auxiliares', 'Profissões'],
      permission: 'PROFESSION_VIEW',
    },
  },
  {
    path: 'auxiliary-data/membership-statuses',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/MembershipStatus/membership-status.routes').then(
        (routes) => routes.MEMBERSHIP_STATUS_ROUTES,
      ),
    data: {
      title: 'Situações da membresia',
      breadcrumb: ['Cadastros Auxiliares', 'Situações da membresia'],
      permission: 'MEMBERSHIP_STATUS_VIEW',
    },
  },
  {
    path: 'auxiliary-data/religious-origins',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/ReligiousOrigin/religious-origin.routes').then(
        (routes) => routes.RELIGIOUS_ORIGIN_ROUTES,
      ),
    data: {
      title: 'Origens religiosas',
      breadcrumb: ['Cadastros Auxiliares', 'Origens religiosas'],
      permission: 'RELIGIOUS_ORIGIN_VIEW',
    },
  },
  {
    path: 'auxiliary-data/leader-types',
    canMatch: [permissionGuard],
    loadChildren: () =>
      import('./features/LeaderType/leader-type.routes').then(
        (routes) => routes.LEADER_TYPE_ROUTES,
      ),
    data: {
      title: 'Tipos de liderança',
      breadcrumb: ['Cadastros Auxiliares', 'Tipos de liderança'],
      permission: 'LEADER_TYPE_VIEW',
    },
  },
];

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./layout/admin/admin-layout.component').then(
        (component) => component.AdminLayoutComponent,
      ),
    children: adminRoutes,
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layout/auth/auth-layout.component').then(
        (component) => component.AuthLayoutComponent,
      ),
    children: authRoutes,
  },
  {
    path: 'forbidden',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/components/forbidden/forbidden.component').then(
        (component) => component.ForbiddenComponent,
      ),
    data: { title: 'Acesso não autorizado' },
  },
  { path: 'admin', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
