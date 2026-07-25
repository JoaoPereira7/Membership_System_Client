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
import { AccountDialogComponent } from '../../Components/account-dialog/account-dialog.component';
import {
  AccountDialogData,
  AccountDialogResult,
} from '../../Components/account-dialog/account-dialog.types';
import { AccountListItem, AccountListQuery } from '../../Models/account.models';
import { AccountService } from '../../Services/account.service';

@Component({
  selector: 'app-account-list',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AppDataTableToolbarComponent,
    AppDataTableComponent,
    AppListPageShellComponent,
  ],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountListComponent {
  private readonly service = inject(AccountService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequests = new Subject<void>();

  protected readonly data = signal<readonly AccountListItem[]>([]);
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
    { label: 'Usuários' },
  ];
  protected readonly columns: readonly DataTableColumn<AccountListItem>[] = [
    { key: 'name', label: 'Nome', type: 'text', sortable: true, minWidth: '190px' },
    { key: 'email', label: 'E-mail', type: 'text', sortable: true, minWidth: '220px' },
    {
      key: 'cpf',
      label: 'CPF',
      type: 'text',
      sortable: true,
      width: '150px',
      formatter: (value) => this.formatCpf(String(value)),
    },
    {
      key: 'accountProfileName',
      label: 'Perfil de acesso',
      type: 'text',
      sortable: true,
      minWidth: '180px',
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
  protected readonly actions: readonly DataTableAction<AccountListItem>[] = [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      tooltip: 'Editar usuário',
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
                  getApiErrorMessage(error, 'Não foi possível carregar os usuários.'),
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

  protected onAction(event: DataTableActionEvent<AccountListItem>): void {
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

  private openDialog(data: AccountDialogData): void {
    this.dialog
      .open<AccountDialogComponent, AccountDialogData, AccountDialogResult>(
        AccountDialogComponent,
        {
          width: '720px',
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

  private currentQuery(): AccountListQuery {
    return {
      search: this.search(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection(),
    };
  }

  private formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.length === 11
      ? digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
      : value;
  }
}
