import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { PageBreadcrumb } from './page-header.types';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly breadcrumbs = input<readonly PageBreadcrumb[]>([]);
  readonly showBreadcrumbs = input<boolean>(true);
  readonly compact = input<boolean>(false);

  readonly headerClasses = computed<readonly string[]>(() => [
    'page-header',
    ...(this.compact() ? ['page-header--compact'] : []),
  ]);

  hasRoute(
    breadcrumb: PageBreadcrumb,
  ): breadcrumb is PageBreadcrumb & { readonly route: string | readonly unknown[] } {
    return breadcrumb.route !== undefined;
  }
}
