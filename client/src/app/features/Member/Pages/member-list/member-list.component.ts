import { ChangeDetectionStrategy, Component, DestroyRef, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../../core/api/api.models';
import { AppDataTableToolbarComponent } from '../../../../core/components/data-table-toolbar/data-table-toolbar.component';
import { AppDataTableComponent } from '../../../../core/components/data-table/data-table.component';
import { DataTableAction, DataTableActionEvent, DataTableColumn, DataTableQuery } from '../../../../core/components/data-table/data-table.types';
import { AppListPageShellComponent } from '../../../../core/components/list-page-shell/list-page-shell.component';
import { MemberListItem, MemberListQuery } from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';
import { MemberDetailsDialogComponent } from '../../Components/member-details-dialog/member-details-dialog.component';
import { MemberDeleteDialogComponent } from '../../Components/member-delete-dialog/member-delete-dialog.component';
import { MemberDialogComponent } from '../../Components/member-dialog/member-dialog.component';
import { MemberDialogData, MemberDialogResult } from '../../Components/member-dialog/member-dialog.types';

@Component({
  selector: 'app-member-list',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, AppDataTableToolbarComponent, AppDataTableComponent, AppListPageShellComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberListComponent {
  protected readonly detailsDialogComponent = MemberDetailsDialogComponent;
  protected readonly deleteDialogComponent = MemberDeleteDialogComponent;
  private readonly service = inject(MemberService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly data = signal<readonly MemberListItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalItems = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
  protected readonly sortActive = signal<string | null>('name');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('asc');
  private loadRequestId = 0;
  protected readonly breadcrumbs = [{ label: 'Membros' }];
  protected readonly columns: readonly DataTableColumn<MemberListItem>[] = [
    { key: 'name', label: 'Nome', type: 'text', sortable: true, minWidth: '220px' },
    { key: 'cpf', label: 'CPF', type: 'text', sortable: true, width: '150px', formatter: v => this.cpf(String(v)) },
    { key: 'churchName', label: 'Igreja', type: 'text', sortable: true, minWidth: '180px' },
    { key: 'departmentNames', label: 'Departamento', type: 'text', sortable: true, minWidth: '180px' },
    { key: 'isLeader', label: 'Líder', type: 'text', width: '90px', align: 'center', formatter: (_, r) => r.isLeader ? 'SIM' : 'NÃO' },
    { key: 'membershipStatusName', label: 'Situação do membro', type: 'status', sortable: true, width: '170px' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '80px', align: 'center' },
  ];
  protected readonly actions: readonly DataTableAction<MemberListItem>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar membro', color: 'primary' },
  ];
  constructor() { this.reload(); }
  protected reload(): void {
    const requestId = ++this.loadRequestId;
    this.loading.set(true); this.errorMessage.set(null);
    this.service.getPaged(this.query()).pipe(finalize(() => {
      if (requestId === this.loadRequestId) this.loading.set(false);
    })).subscribe({
      next: result => {
        if (requestId !== this.loadRequestId) return;
        this.errorMessage.set(null);
        this.data.set(result.items);
        this.totalItems.set(result.totalItems);
      },
      error: error => {
        if (requestId !== this.loadRequestId) return;
        this.data.set([]);
        this.totalItems.set(0);
        this.errorMessage.set(getApiErrorMessage(error, 'Não foi possível carregar os membros.'));
      },
    });
  }
  protected searchChanged(value: string): void { this.search.set(value); this.pageIndex.set(0); this.reload(); }
  protected queryChanged(query: DataTableQuery): void {
    this.pageIndex.set(query.pageIndex); this.pageSize.set(query.pageSize);
    if (query.sortActive) { this.sortActive.set(query.sortActive); this.sortDirection.set(query.sortDirection); }
    this.reload();
  }
  protected action(event: DataTableActionEvent<MemberListItem>): void {
    if (event.actionId === 'edit') this.openDialog({ mode: 'edit', memberId: event.row.id });
  }
  protected create(): void { this.openDialog({ mode: 'create' }); }
  private query(): MemberListQuery { return { search: this.search(), pageIndex: this.pageIndex(), pageSize: this.pageSize(), sortActive: this.sortActive(), sortDirection: this.sortDirection() }; }
  private cpf(value: string): string { return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4'); }
  private openDialog(data: MemberDialogData): void {
    this.dialog.open<MemberDialogComponent, MemberDialogData, MemberDialogResult>(
      MemberDialogComponent,
      {
        width: '80vw',
        maxWidth: '960px',
        maxHeight: '80vh',
        panelClass: 'member-dialog-panel',
        autoFocus: false,
        restoreFocus: true,
        disableClose: false,
        data,
      },
    ).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      if (result?.saved) this.reload();
    });
  }
}
