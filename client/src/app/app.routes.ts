import { Routes } from '@angular/router';

export const authRoutes: Routes = [];

export const adminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then((component) => component.HomeComponent),
    data: {
      title: 'Home',
      breadcrumb: ['Home'],
    },
  },
  {
    path: 'auxiliary-data/genders',
    loadChildren: () =>
      import('./features/Gender/gender.routes').then((routes) => routes.GENDER_ROUTES),
    data: {
      title: 'Gêneros',
      breadcrumb: ['Cadastros Auxiliares', 'Gêneros'],
    },
  },
  {
    path: 'auxiliary-data/marital-statuses',
    loadChildren: () =>
      import('./features/MaritalStatus/marital-status.routes').then(
        (routes) => routes.MARITAL_STATUS_ROUTES,
      ),
    data: {
      title: 'Estados civis',
      breadcrumb: ['Cadastros Auxiliares', 'Estados civis'],
    },
  },
  {
    path: 'auxiliary-data/phone-types',
    loadChildren: () =>
      import('./features/PhoneType/phone-type.routes').then((routes) => routes.PHONE_TYPE_ROUTES),
    data: {
      title: 'Tipos de telefone',
      breadcrumb: ['Cadastros Auxiliares', 'Tipos de telefone'],
    },
  },
  {
    path: 'auxiliary-data/address-types',
    loadChildren: () =>
      import('./features/AddressType/address-type.routes').then(
        (routes) => routes.ADDRESS_TYPE_ROUTES,
      ),
    data: {
      title: 'Tipos de endereço',
      breadcrumb: ['Cadastros Auxiliares', 'Tipos de endereço'],
    },
  },
  {
    path: 'auxiliary-data/education-levels',
    loadChildren: () =>
      import('./features/EducationLevel/education-level.routes').then(
        (routes) => routes.EDUCATION_LEVEL_ROUTES,
      ),
    data: {
      title: 'Escolaridades',
      breadcrumb: ['Cadastros Auxiliares', 'Escolaridades'],
    },
  },
  {
    path: 'auxiliary-data/formation-areas',
    loadChildren: () =>
      import('./features/FormationArea/formation-area.routes').then(
        (routes) => routes.FORMATION_AREA_ROUTES,
      ),
    data: {
      title: 'Áreas de formação',
      breadcrumb: ['Cadastros Auxiliares', 'Áreas de formação'],
    },
  },
  {
    path: 'auxiliary-data/professions',
    loadChildren: () =>
      import('./features/Profession/profession.routes').then((routes) => routes.PROFESSION_ROUTES),
    data: {
      title: 'Profissões',
      breadcrumb: ['Cadastros Auxiliares', 'Profissões'],
    },
  },
  {
    path: 'auxiliary-data/membership-statuses',
    loadChildren: () =>
      import('./features/MembershipStatus/membership-status.routes').then(
        (routes) => routes.MEMBERSHIP_STATUS_ROUTES,
      ),
    data: {
      title: 'Situações da membresia',
      breadcrumb: ['Cadastros Auxiliares', 'Situações da membresia'],
    },
  },
  {
    path: 'auxiliary-data/religious-origins',
    loadChildren: () =>
      import('./features/ReligiousOrigin/religious-origin.routes').then(
        (routes) => routes.RELIGIOUS_ORIGIN_ROUTES,
      ),
    data: {
      title: 'Origens religiosas',
      breadcrumb: ['Cadastros Auxiliares', 'Origens religiosas'],
    },
  },
  {
    path: 'auxiliary-data/leader-types',
    loadChildren: () =>
      import('./features/LeaderType/leader-type.routes').then(
        (routes) => routes.LEADER_TYPE_ROUTES,
      ),
    data: {
      title: 'Tipos de liderança',
      breadcrumb: ['Cadastros Auxiliares', 'Tipos de liderança'],
    },
  },
];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin/admin-layout.component').then(
        (component) => component.AdminLayoutComponent,
      ),
    children: adminRoutes,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./layout/auth/auth-layout.component').then(
        (component) => component.AuthLayoutComponent,
      ),
    children: authRoutes,
  },
  {
    path: 'admin',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
