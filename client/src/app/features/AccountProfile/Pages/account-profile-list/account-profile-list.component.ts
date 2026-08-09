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
import { AccountProfileDialogComponent } from '../../Components/account-profile-dialog/account-profile-dialog.component';
import {
  AccountProfileDialogData,
  AccountProfileDialogResult,
} from '../../Components/account-profile-dialog/account-profile-dialog.types';
import {
  AccountProfileListItem,
  AccountProfileListQuery,
} from '../../Models/account-profile.models';
import { AccountProfileService } from '../../Services/account-profile.service';
import { AccountProfileDetailsDialogComponent } from '../../Components/account-profile-details-dialog/account-profile-details-dialog.component';
import { AccountProfileDeleteDialogComponent } from '../../Components/account-profile-delete-dialog/account-profile-delete-dialog.component';

@Component({
  selector: 'app-account-profile-list',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AppDataTableToolbarComponent,
    AppDataTableComponent,
    AppListPageShellComponent,
  ],
  templateUrl: './account-profile-list.component.html',
  styleUrl: './account-profile-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfileListComponent {
  protected readonly detailsDialogComponent = AccountProfileDetailsDialogComponent;
  protected readonly deleteDialogComponent = AccountProfileDeleteDialogComponent;
  private readonly service = inject(AccountProfileService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequests = new Subject<void>();

  protected readonly data = signal<readonly AccountProfileListItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalItems = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
  protected readonly sortActive = signal<string | null>('name');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('asc');
  protected readonly breadcrumbs: readonly PageBreadcrumb[] = [
    { label: 'Administração' },
    { label: 'Perfis de acesso' },
  ];
  protected readonly columns: readonly DataTableColumn<AccountProfileListItem>[] = [
    { key: 'name', label: 'Nome', type: 'text', sortable: true, minWidth: '200px' },
    {
      key: 'description',
      label: 'Descrição',
      type: 'text',
      sortable: true,
      minWidth: '280px',
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
  protected readonly actions: readonly DataTableAction<AccountProfileListItem>[] = [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      tooltip: 'Editar perfil de acesso',
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
                  getApiErrorMessage(error, 'Não foi possível carregar os perfis de acesso.'),
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

  protected onAction(event: DataTableActionEvent<AccountProfileListItem>): void {
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

  private openDialog(data: AccountProfileDialogData): void {
    this.dialog
      .open<AccountProfileDialogComponent, AccountProfileDialogData, AccountProfileDialogResult>(
        AccountProfileDialogComponent,
        {
          width: '560px',
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

  private currentQuery(): AccountProfileListQuery {
    return {
      search: this.search(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection(),
    };
  }
}
