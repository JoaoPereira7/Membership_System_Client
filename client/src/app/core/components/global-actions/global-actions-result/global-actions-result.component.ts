import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AppDataTableComponent } from '../../data-table/data-table.component';
import { DataTableColumn, DataTableQuery } from '../../data-table/data-table.types';
import { GlobalActionsResultData, GlobalActionsResultFilter } from './global-actions-result.types';

interface GlobalActionsResultRow {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly failure: string;
  readonly type: Exclude<GlobalActionsResultFilter, 'all'>;
}

@Component({
  selector: 'app-global-actions-result',
  imports: [AppDataTableComponent, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './global-actions-result.component.html',
  styleUrl: './global-actions-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppGlobalActionsResultComponent {
  protected readonly data = inject<GlobalActionsResultData>(MAT_DIALOG_DATA);
  protected readonly selectedType = signal<GlobalActionsResultFilter>('all');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly total = Math.max(0, this.data.total);
  protected readonly successCount = Math.max(0, this.data.successCount);
  protected readonly ignoredCount = Math.max(0, this.data.ignoredCount ?? 0);
  protected readonly failureCount = Math.max(this.total - this.successCount - this.ignoredCount, 0);

  protected readonly columns: readonly DataTableColumn<GlobalActionsResultRow>[] = [
    { key: 'label', label: 'Item', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'failure', label: 'Motivo', type: 'text' },
  ];

  private readonly rows: readonly GlobalActionsResultRow[] = this.data.items.map((item, index) => {
    const type: GlobalActionsResultRow['type'] = item.success
      ? 'success'
      : item.ignored
        ? 'ignored'
        : 'failure';

    return {
      id: String(item.id ?? index),
      label: item.label?.trim() || (item.id !== undefined ? String(item.id) : '-'),
      status: type === 'success' ? 'Sucesso' : type === 'ignored' ? 'Ignorado' : 'Falha',
      failure: type === 'success' ? '-' : this.normalizeFailures(item.failures).join(' | ') || '-',
      type,
    };
  });

  protected readonly filteredRows = computed<readonly GlobalActionsResultRow[]>(() => {
    const selectedType = this.selectedType();
    return selectedType === 'all'
      ? this.rows
      : this.rows.filter((row) => row.type === selectedType);
  });

  private readonly dialogRef = inject(MatDialogRef<AppGlobalActionsResultComponent, void>);

  protected changeType(type: GlobalActionsResultFilter): void {
    this.selectedType.set(type);
    this.pageIndex.set(0);
  }

  protected tableChange(query: DataTableQuery): void {
    this.pageIndex.set(query.pageIndex);
    this.pageSize.set(query.pageSize);
  }

  protected close(): void {
    this.dialogRef.close();
  }

  private normalizeFailures(messages: readonly string[] | undefined): readonly string[] {
    const normalized = (messages ?? [])
      .filter(Boolean)
      .flatMap((message) =>
        String(message)
          .replace(/\s+/g, ' ')
          .trim()
          .split(/(?<=[.!?])\s+/),
      )
      .map((message) => message.trim())
      .filter(Boolean);

    return [...new Set(normalized)];
  }
}
