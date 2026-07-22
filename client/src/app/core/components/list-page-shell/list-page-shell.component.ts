import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PageBreadcrumb } from '../page-header/page-header.types';
import { ListPageContentAppearance, ListPageContentPadding } from './list-page-shell.types';

@Component({
  selector: 'app-list-page-shell',
  standalone: true,
  imports: [NgTemplateOutlet, MatCardModule, MatProgressBarModule],
  templateUrl: './list-page-shell.component.html',
  styleUrl: './list-page-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppListPageShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly breadcrumbs = input<readonly PageBreadcrumb[]>([]);
  readonly loading = input<boolean>(false);
  readonly contentAppearance = input<ListPageContentAppearance>('card');
  readonly contentPadding = input<ListPageContentPadding>('default');
  readonly maxWidth = input<string>('100%');

  readonly surfaceClasses = computed<readonly string[]>(() => [
    'list-page-shell__surface',
    `list-page-shell__surface--${this.contentAppearance()}`,
    `list-page-shell__surface--padding-${this.contentPadding()}`,
  ]);
}
