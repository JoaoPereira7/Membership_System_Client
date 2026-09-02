import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Subject, catchError, defer, finalize, switchMap } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { AppDataTableToolbarComponent } from '../../../../core/components/data-table-toolbar/data-table-toolbar.component';
import { AppDataTableComponent } from '../../../../core/components/data-table/data-table.component';
import {
  DataTableAction,
  DataTableActionEvent,
  DataTableColumn,
  DataTableQuery,
} from '../../../../core/components/data-table/data-table.types';
import { AppListPageShellComponent } from '../../../../core/components/list-page-shell/list-page-shell.component';
import { PageBreadcrumb } from '../../../../core/components/page-header/page-header.types';
import { VisitorDetailsDialogComponent } from '../../Components/visitor-details-dialog/visitor-details-dialog.component';
import { VisitorDialogComponent } from '../../Components/visitor-dialog/visitor-dialog.component';
import {
  VisitorDialogData,
  VisitorDialogResult,
} from '../../Components/visitor-dialog/visitor-dialog.types';
import { VisitorListItem, VisitorListQuery } from '../../Models/visitor.models';
import { VisitorService } from '../../Services/visitor.service';

@Component({
  selector: 'app-visitor-list',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AppDataTableToolbarComponent,
    AppDataTableComponent,
    AppListPageShellComponent,
  ],
  templateUrl: './visitor-list.component.html',
  styleUrl: './visitor-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorListComponent {
  private readonly service = inject(VisitorService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequests = new Subject<void>();

  protected readonly data = signal<readonly VisitorListItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalItems = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
  protected readonly sortActive = signal<string | null>('normalizedName');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('asc');
  protected readonly breadcrumbs: readonly PageBreadcrumb[] = [{ label: 'Visitantes' }];
  protected readonly columns: readonly DataTableColumn<VisitorListItem>[] = [
    { key: 'normalizedName', label: 'Nome', type: 'text', sortable: true, minWidth: '220px' },
    { key: 'visitDate', label: 'Data da visita', type: 'date', sortable: true, width: '160px' },
    { key: 'phone', label: 'Telefone', type: 'text', sortable: true, width: '170px' },
    { key: 'normalizedEmail', label: 'E-mail', type: 'text', sortable: true, minWidth: '220px' },
    { key: 'churchName', label: 'Igreja', type: 'text', sortable: true, minWidth: '200px' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '80px', align: 'center' },
  ];
  protected readonly actions: readonly DataTableAction<VisitorListItem>[] = [
    {
      id: 'details',
      label: 'Visualizar/Detalhes',
      icon: 'visibility',
      tooltip: 'Visualizar detalhes do visitante',
      color: 'primary',
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      tooltip: 'Editar visitante',
      color: 'primary',
    },
  ];

  constructor() {
    this.loadRequests
      .pipe(
        switchMap(() =>
          defer(() => {
            this.loading.set(true);
            this.errorMessage.set(null);
            return this.service.getPaged(this.currentQuery()).pipe(
              catchError((error: unknown) => {
                this.data.set([]);
                this.totalItems.set(0);
                this.errorMessage.set(
                  getApiErrorMessage(error, 'Não foi possível carregar os visitantes.'),
                );
                return EMPTY;
              }),
              finalize(() => this.loading.set(false)),
            );
          }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.data.set(result.items);
        this.totalItems.set(result.totalItems);
      });

    this.reload();
  }

  protected searchChanged(search: string): void {
    this.search.set(search);
    this.pageIndex.set(0);
    this.reload();
  }

  protected queryChanged(query: DataTableQuery): void {
    this.pageIndex.set(query.pageIndex);
    this.pageSize.set(query.pageSize);
    if (query.sortActive) {
      this.sortActive.set(query.sortActive);
      this.sortDirection.set(query.sortDirection);
    }
    this.reload();
  }

  protected action(event: DataTableActionEvent<VisitorListItem>): void {
    if (event.actionId === 'details') {
      this.dialog.open<VisitorDetailsDialogComponent, VisitorListItem>(
        VisitorDetailsDialogComponent,
        {
          data: event.row,
          width: '680px',
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100dvh - 2rem)',
          autoFocus: false,
          restoreFocus: true,
          panelClass: 'entity-details-dialog-panel',
        },
      );
      return;
    }

    if (event.actionId === 'edit') {
      this.openDialog({ mode: 'edit', item: { ...event.row } });
    }
  }

  protected create(): void {
    this.openDialog({ mode: 'create' });
  }

  protected reload(): void {
    this.loadRequests.next();
  }

  private openDialog(data: VisitorDialogData): void {
    this.dialog
      .open<VisitorDialogComponent, VisitorDialogData, VisitorDialogResult>(
        VisitorDialogComponent,
        {
          width: '620px',
          maxWidth: '95vw',
          autoFocus: false,
          restoreFocus: true,
          data,
        },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result?.saved) return;
        if (data.mode === 'create') {
          this.search.set('');
          this.pageIndex.set(0);
        }
        this.reload();
      });
  }

  private currentQuery(): VisitorListQuery {
    return {
      search: this.search(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection(),
    };
  }
}
