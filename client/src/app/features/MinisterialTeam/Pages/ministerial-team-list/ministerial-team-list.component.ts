import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
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
import { MinisterialTeamDetailsDialogComponent } from '../../Components/ministerial-team-details-dialog/ministerial-team-details-dialog.component';
import {
  MinisterialTeamListItem,
  MinisterialTeamListQuery,
} from '../../Models/ministerial-team.models';
import { MinisterialTeamService } from '../../Services/ministerial-team.service';

@Component({
  selector: 'app-ministerial-team-list',
  imports: [AppDataTableToolbarComponent, AppDataTableComponent, AppListPageShellComponent],
  templateUrl: './ministerial-team-list.component.html',
  styleUrl: './ministerial-team-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinisterialTeamListComponent {
  private readonly service = inject(MinisterialTeamService);
  private readonly dialog = inject(MatDialog);
  private readonly loadRequests = new Subject<void>();

  protected readonly data = signal<readonly MinisterialTeamListItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalItems = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
  protected readonly sortActive = signal<string | null>('memberName');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('asc');
  protected readonly breadcrumbs: readonly PageBreadcrumb[] = [
    { label: 'Membros', route: '/members' },
    { label: 'Equipe Ministerial' },
  ];
  protected readonly columns: readonly DataTableColumn<MinisterialTeamListItem>[] = [
    {
      key: 'memberName',
      label: 'Pastor',
      type: 'text',
      sortable: true,
      minWidth: '220px',
    },
    {
      key: 'churchName',
      label: 'Igreja',
      type: 'text',
      sortable: true,
      minWidth: '220px',
    },
    {
      key: 'roles',
      label: 'Cargo eclesiástico',
      type: 'chips',
      minWidth: '280px',
      valueAccessor: (row) => row.roles.map((role) => role.churchRoleName),
    },
    {
      key: 'isActive',
      label: 'Situação',
      type: 'status',
      sortable: true,
      width: '130px',
      align: 'center',
      formatter: (_value, row) => (row.isActive ? 'Ativo' : 'Inativo'),
    },
    { key: 'actions', label: 'Opções', type: 'actions', width: '80px', align: 'center' },
  ];
  protected readonly actions: readonly DataTableAction<MinisterialTeamListItem>[] = [
    {
      id: 'ministerial-details',
      label: 'Dados ministeriais',
      icon: 'info',
      tooltip: 'Ver dados ministeriais',
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
                  getApiErrorMessage(error, 'Não foi possível carregar a equipe ministerial.'),
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

  protected action(event: DataTableActionEvent<MinisterialTeamListItem>): void {
    if (event.actionId !== 'ministerial-details') return;

    this.dialog.open<MinisterialTeamDetailsDialogComponent, MinisterialTeamListItem>(
      MinisterialTeamDetailsDialogComponent,
      {
        data: event.row,
        width: '640px',
        maxWidth: '95vw',
        autoFocus: false,
      },
    );
  }

  protected reload(): void {
    this.loadRequests.next();
  }

  private currentQuery(): MinisterialTeamListQuery {
    return {
      search: this.search(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection(),
    };
  }
}
