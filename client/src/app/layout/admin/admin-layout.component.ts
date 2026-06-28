import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 959.98px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  readonly pageTitle = signal('Home');
  readonly breadcrumb = signal<string[]>(['Home']);
  readonly userName = signal('João Pereira');
  readonly year = new Date().getFullYear();

  protected readonly sidebarItems = [
    { id: 'home', label: 'Home', icon: 'home', active: true },
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'members', label: 'Membros', icon: 'groups' },
    { id: 'families', label: 'Famílias', icon: 'diversity_3' },
    { id: 'visitors', label: 'Visitantes', icon: 'person_add' },
    { id: 'baptisms', label: 'Batismos', icon: 'water_drop' },
    { id: 'transfers', label: 'Transferências', icon: 'swap_horiz' },
    { id: 'departments', label: 'Departamentos', icon: 'apartment' },
    { id: 'ministries', label: 'Ministérios', icon: 'church' },
    { id: 'leaderships', label: 'Lideranças', icon: 'workspace_premium' },
    { id: 'events', label: 'Eventos', icon: 'event' },
    { id: 'finance', label: 'Financeiro', icon: 'account_balance_wallet' },
    { id: 'reports', label: 'Relatórios', icon: 'summarize' },
    { id: 'users', label: 'Usuários', icon: 'manage_accounts' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ];

  constructor() {
    this.syncRouteContext();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
      )
      .subscribe(() => this.syncRouteContext());
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.mobileSidebarOpen.update((value) => !value);
      return;
    }

    this.sidebarCollapsed.update((value) => !value);
  }

  closeMobileSidebar(): void {
    if (!this.isMobile()) {
      return;
    }

    this.mobileSidebarOpen.set(false);
  }

  private syncRouteContext(): void {
    const activeRoute = this.resolveActiveRoute(this.activatedRoute);
    const data = activeRoute?.snapshot?.data ?? {};

    this.pageTitle.set((data['title'] as string | undefined) ?? 'Home');
    this.breadcrumb.set(
      (data['breadcrumb'] as string[] | undefined)?.length ? (data['breadcrumb'] as string[]) : ['Home'],
    );
  }

  private resolveActiveRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}