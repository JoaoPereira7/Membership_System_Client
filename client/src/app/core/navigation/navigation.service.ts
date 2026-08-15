import { Injectable, computed, inject } from '@angular/core';

import { NAVIGATION_ITEMS } from './navigation.config';
import { NavigationItem } from './navigation-item.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly auth = inject(AuthService);

  readonly items = computed(() =>
    this.filterByPermissions(NAVIGATION_ITEMS, this.auth.permissionSet()),
  );

  filterByPermissions(
    items: readonly NavigationItem[],
    permissions: ReadonlySet<string>,
  ): readonly NavigationItem[] {
    return items.reduce<NavigationItem[]>((visibleItems, item) => {
      if (item.permission && !permissions.has(item.permission)) {
        return visibleItems;
      }

      if (!item.children) {
        visibleItems.push(item);
        return visibleItems;
      }

      const visibleChildren = this.filterByPermissions(item.children, permissions);

      if (visibleChildren.length > 0) {
        visibleItems.push({ ...item, children: visibleChildren });
      }

      return visibleItems;
    }, []);
  }
}
