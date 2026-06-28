import { Routes } from '@angular/router';

export const authRoutes: Routes = [];

export const adminRoutes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () =>
			import('./features/home/home.component').then(
				(component) => component.HomeComponent,
			),
		data: {
			title: 'Home',
			breadcrumb: ['Home'],
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
