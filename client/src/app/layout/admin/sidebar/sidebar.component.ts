import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { NavigationItem } from '../../../core/navigation/navigation-item.model';
import { NavigationService } from '../../../core/navigation/navigation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly navigationService = inject(NavigationService);
  private readonly router = inject(Router);

  readonly collapsed = input(false);
  readonly mobile = input(false);

  readonly requestClose = output<void>();
  readonly toggleSidebar = output<void>();

  protected readonly items = this.navigationService.items;
  protected readonly expandedGroupId = signal<string | null>(null);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  private readonly activeItemId = computed(() => {
    this.currentUrl();
    return this.findActiveItemId(this.items);
  });
  private readonly activeGroupId = computed(() => {
    const activeItemId = this.activeItemId();

    return (
      this.items.find((item) => item.children?.some((child) => child.id === activeItemId))?.id ??
      null
    );
  });

  constructor() {
    effect(() => {
      const activeGroupId = this.activeGroupId();

      if (activeGroupId) {
        this.expandedGroupId.set(activeGroupId);
      }
    });
  }

  protected onNavigate(): void {
    if (this.mobile()) {
      this.requestClose.emit();
    }
  }

  protected handleToggleClick(): void {
    this.toggleSidebar.emit();
  }

  protected toggleGroup(groupId: string): void {
    this.expandedGroupId.update((currentId) => (currentId === groupId ? null : groupId));
  }

  protected isExpanded(groupId: string): boolean {
    return this.expandedGroupId() === groupId;
  }

  protected isActive(item: NavigationItem): boolean {
    return this.activeItemId() === item.id;
  }

  protected isGroupActive(groupId: string): boolean {
    return this.activeGroupId() === groupId;
  }

  private findActiveItemId(items: readonly NavigationItem[]): string | null {
    for (const item of items) {
      if (item.children) {
        const activeChildId = this.findActiveItemId(item.children);

        if (activeChildId) {
          return activeChildId;
        }
      }

      if (item.route && !item.disabled && this.isRouteActive(item)) {
        return item.id;
      }
    }

    return null;
  }

  private isRouteActive(item: NavigationItem): boolean {
    if (!item.route) {
      return false;
    }

    return this.router.isActive(item.route, {
      paths: item.exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
