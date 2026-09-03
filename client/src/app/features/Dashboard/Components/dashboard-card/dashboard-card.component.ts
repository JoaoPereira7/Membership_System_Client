import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DashboardCardItem, DashboardCardTone } from '../../Models/dashboard.models';

@Component({
  selector: 'app-dashboard-card',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly tone = input<DashboardCardTone>('primary');
  readonly value = input<string | null>(null);
  readonly items = input<readonly DashboardCardItem[]>([]);
  readonly subtitle = input<string | null>(null);
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly detailsEnabled = input<boolean>(true);
  readonly compact = input<boolean>(false);
  readonly maxItems = input<number>(4);

  readonly retryRequested = output<void>();
  readonly detailsRequested = output<void>();

  protected readonly visibleItems = computed(() => this.items().slice(0, this.maxItems()));
  protected readonly remainingItems = computed(() =>
    Math.max(0, this.items().length - this.visibleItems().length),
  );
}
