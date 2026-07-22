import { Injectable } from '@angular/core';

import { NAVIGATION_ITEMS } from './navigation.config';
import { NavigationItem } from './navigation-item.model';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  // A autenticação ainda não está disponível; por enquanto, todos os itens são expostos.
  readonly items: readonly NavigationItem[] = NAVIGATION_ITEMS;

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
