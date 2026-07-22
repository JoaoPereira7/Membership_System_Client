import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

import {
  DataTableToolbarFilterSummary,
  DataTableToolbarItemCount,
} from './data-table-toolbar.types';

const SEARCH_DEBOUNCE_TIME = 400;

@Component({
  selector: 'app-data-table-toolbar',
  imports: [
    ReactiveFormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './data-table-toolbar.component.html',
  styleUrl: './data-table-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDataTableToolbarComponent {
  readonly searchEnabled = input<boolean>(true);
  readonly searchValue = input<string>('');
  readonly searchPlaceholder = input<string>('Pesquisar');
  readonly filterEnabled = input<boolean>(true);
  readonly exportEnabled = input<boolean>(false);
  readonly refreshEnabled = input<boolean>(true);
  readonly clearSearchEnabled = input<boolean>(true);
  readonly loading = input<boolean>(false);
  readonly exporting = input<boolean>(false);
  readonly activeFilterCount = input<number>(0);
  readonly totalItems = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly searchChanged = output<string>();
  readonly filterRequested = output<void>();
  readonly exportRequested = output<void>();
  readonly refreshRequested = output<void>();
  readonly searchCleared = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly numberFormatter = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  });

  readonly controlsDisabled = computed<boolean>(() => this.disabled() || this.loading());
  readonly exportDisabled = computed<boolean>(() => this.controlsDisabled() || this.exporting());
  readonly busy = computed<boolean>(() => this.loading() || this.exporting());

  readonly itemCount = computed<DataTableToolbarItemCount | null>(() => {
    const totalItems = this.totalItems();

    if (totalItems === null) {
      return null;
    }

    const value = Math.max(0, Math.trunc(totalItems));
    const formattedValue = this.numberFormatter.format(value);
    const noun = value === 1 ? 'registro' : 'registros';

    return {
      value,
      formattedValue,
      label: `${formattedValue} ${noun}`,
    };
  });

  readonly activeFilterSummary = computed<DataTableToolbarFilterSummary>(() => {
    const count = Math.max(0, Math.trunc(this.activeFilterCount()));
    const noun = count === 1 ? 'filtro ativo' : 'filtros ativos';

    return {
      count,
      label: `${this.numberFormatter.format(count)} ${noun}`,
    };
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => this.searchChanged.emit(search));

    effect(() => {
      const searchValue = this.searchValue();

      if (searchValue !== this.searchControl.value) {
        this.searchControl.setValue(searchValue, { emitEvent: false });
      }
    });

    effect(() => {
      const shouldDisable = this.controlsDisabled();

      if (shouldDisable && this.searchControl.enabled) {
        this.searchControl.disable({ emitEvent: false });
      } else if (!shouldDisable && this.searchControl.disabled) {
        this.searchControl.enable({ emitEvent: false });
      }
    });
  }

  clearSearch(): void {
    if (this.controlsDisabled()) {
      return;
    }

    this.searchControl.setValue('');
    this.searchCleared.emit();
  }

  requestFilters(): void {
    if (!this.controlsDisabled()) {
      this.filterRequested.emit();
    }
  }

  requestExport(): void {
    if (!this.exportDisabled()) {
      this.exportRequested.emit();
    }
  }

  requestRefresh(): void {
    if (!this.controlsDisabled()) {
      this.refreshRequested.emit();
    }
  }
}
