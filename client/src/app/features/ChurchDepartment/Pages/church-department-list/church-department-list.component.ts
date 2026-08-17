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
import { ChurchDepartmentDialogComponent } from '../../Components/church-department-dialog/church-department-dialog.component';
import {
  ChurchDepartmentDialogData,
  ChurchDepartmentDialogResult,
} from '../../Components/church-department-dialog/church-department-dialog.types';
import {
  ChurchDepartmentListItem,
  ChurchDepartmentListQuery,
} from '../../Models/church-department.models';
import { ChurchDepartmentService } from '../../Services/church-department.service';
import { ChurchDepartmentDetailsDialogComponent } from '../../Components/church-department-details-dialog/church-department-details-dialog.component';
import { ChurchDepartmentDeleteDialogComponent } from '../../Components/church-department-delete-dialog/church-department-delete-dialog.component';

@Component({
  selector: 'app-church-department-list',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AppDataTableToolbarComponent,
    AppDataTableComponent,
    AppListPageShellComponent,
  ],
  templateUrl: './church-department-list.component.html',
  styleUrl: './church-department-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChurchDepartmentListComponent {
  protected readonly detailsDialogComponent = ChurchDepartmentDetailsDialogComponent;
  protected readonly deleteDialogComponent = ChurchDepartmentDeleteDialogComponent;
  private readonly service = inject(ChurchDepartmentService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequests = new Subject<void>();

  protected readonly data = signal<readonly ChurchDepartmentListItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalItems = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
  protected readonly sortActive = signal<string | null>('churchName');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('asc');
  protected readonly breadcrumbs: readonly PageBreadcrumb[] = [
    { label: 'Organização' },
    { label: 'Departamentos por Igreja' },
  ];
  protected readonly columns: readonly DataTableColumn<ChurchDepartmentListItem>[] = [
    {
      key: 'churchName',
      label: 'Igreja',
      type: 'text',
      sortable: true,
      minWidth: '220px',
    },
    {
      key: 'departmentName',
      label: 'Departamento',
      type: 'text',
      sortable: true,
      minWidth: '200px',
    },
    {
      key: 'startDate',
      label: 'Data de início',
      type: 'text',
      sortable: true,
      width: '150px',
      formatter: (value) => this.formatDate(String(value)),
    },
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
  protected readonly actions: readonly DataTableAction<ChurchDepartmentListItem>[] = [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      tooltip: 'Editar departamento da igreja',
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
                  getApiErrorMessage(
                    error,
                    'Não foi possível carregar os departamentos das igrejas.',
                  ),
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

  protected onAction(event: DataTableActionEvent<ChurchDepartmentListItem>): void {
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

  private openDialog(data: ChurchDepartmentDialogData): void {
    this.dialog
      .open<
        ChurchDepartmentDialogComponent,
        ChurchDepartmentDialogData,
        ChurchDepartmentDialogResult
      >(ChurchDepartmentDialogComponent, {
        width: '620px',
        maxWidth: '95vw',
        autoFocus: false,
        restoreFocus: true,
        data,
      })
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

  private currentQuery(): ChurchDepartmentListQuery {
    return {
      search: this.search(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection(),
    };
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }
}
