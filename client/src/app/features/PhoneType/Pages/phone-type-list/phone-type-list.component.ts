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
import { AuxiliaryListQuery } from '../../../../core/models/auxiliary-data.models';
import { PhoneTypeDialogComponent } from '../../Components/phone-type-dialog/phone-type-dialog.component';
import {
  PhoneTypeDialogData,
  PhoneTypeDialogResult,
} from '../../Components/phone-type-dialog/phone-type-dialog.types';
import { PhoneTypeListItem } from '../../Models/phone-type.models';
import { PhoneTypeService } from '../../Services/phone-type.service';
import { PhoneTypeDetailsDialogComponent } from '../../Components/phone-type-details-dialog/phone-type-details-dialog.component';
import { PhoneTypeDeleteDialogComponent } from '../../Components/phone-type-delete-dialog/phone-type-delete-dialog.component';

@Component({
  selector: 'app-phone-type-list',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AppDataTableToolbarComponent,
    AppDataTableComponent,
    AppListPageShellComponent,
  ],
  templateUrl: './phone-type-list.component.html',
  styleUrl: './phone-type-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneTypeListComponent {
  protected readonly detailsDialogComponent = PhoneTypeDetailsDialogComponent;
  protected readonly deleteDialogComponent = PhoneTypeDeleteDialogComponent;
  private readonly service = inject(PhoneTypeService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequests = new Subject<void>();

  protected readonly data = signal<readonly PhoneTypeListItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalItems = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
  protected readonly sortActive = signal<string | null>('name');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('asc');
  protected readonly breadcrumbs: readonly PageBreadcrumb[] = [
    { label: 'Cadastros Auxiliares' },
    { label: 'Tipos de telefone' },
  ];
  protected readonly columns: readonly DataTableColumn<PhoneTypeListItem>[] = [
    { key: 'name', label: 'Nome', type: 'text', sortable: true, minWidth: '220px' },
    {
      key: 'isActive',
      label: 'Situação',
      type: 'status',
      sortable: true,
      width: '140px',
      align: 'center',
      formatter: (_value, row) => (row.isActive ? 'Ativo' : 'Inativo'),
    },
    { key: 'actions', label: 'Ações', type: 'actions', width: '80px', align: 'center' },
  ];
  protected readonly actions: readonly DataTableAction<PhoneTypeListItem>[] = [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      tooltip: 'Editar tipo de telefone',
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
                  getApiErrorMessage(error, 'Não foi possível carregar os tipos de telefone.'),
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

  protected onSearchChanged(search: string): void {
    this.search.set(search);
    this.pageIndex.set(0);
    this.reload();
  }

  protected onQueryChanged(query: DataTableQuery): void {
    this.pageIndex.set(query.pageIndex);
    this.pageSize.set(query.pageSize);
    if (query.sortActive) {
      this.sortActive.set(query.sortActive);
      this.sortDirection.set(query.sortDirection);
    }
    this.reload();
  }

  protected onAction(event: DataTableActionEvent<PhoneTypeListItem>): void {
    if (event.actionId === 'edit') {
      this.openDialog({ mode: 'edit', item: { ...event.row } });
    }
  }

  protected openCreateDialog(): void {
    this.openDialog({ mode: 'create' });
  }

  protected reload(): void {
    this.loadRequests.next();
  }

  private openDialog(data: PhoneTypeDialogData): void {
    this.dialog
      .open<PhoneTypeDialogComponent, PhoneTypeDialogData, PhoneTypeDialogResult>(
        PhoneTypeDialogComponent,
        {
          width: '520px',
          maxWidth: '95vw',
          autoFocus: false,
          restoreFocus: true,
          disableClose: false,
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

  private currentQuery(): AuxiliaryListQuery {
    return {
      search: this.search(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection(),
    };
  }
}
