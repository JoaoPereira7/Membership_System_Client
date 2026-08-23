import { SelectionModel } from '@angular/cdk/collections';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Type,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Router } from '@angular/router';

import { EntityDialogService } from '../../services/entity-dialog.service';
import { NotificationService } from '../../services/notification.service';
import {
  DataTableAction,
  DataTableActionEvent,
  DataTableColumn,
  DataTableMode,
  DataTableQuery,
} from './data-table.types';

const SELECTION_COLUMN = '__selection';
const ACTIONS_COLUMN = '__actions';

interface CrudRouteConfig {
  readonly route: string;
  readonly endpoint: string;
  readonly entityLabel: string;
  readonly title: string;
}

const CRUD_ROUTES: readonly CrudRouteConfig[] = [
  {
    route: '/organization/church-departments',
    endpoint: 'ChurchDepartment',
    entityLabel: 'vínculo entre igreja e departamento',
    title: 'Detalhes do departamento por igreja',
  },
  {
    route: '/organization/churches',
    endpoint: 'Church',
    entityLabel: 'igreja',
    title: 'Detalhes da igreja',
  },
  {
    route: '/organization/church-roles',
    endpoint: 'ChurchRole',
    entityLabel: 'cargo eclesiástico',
    title: 'Detalhes do cargo eclesiástico',
  },
  {
    route: '/organization/departments',
    endpoint: 'Departments',
    entityLabel: 'departamento',
    title: 'Detalhes do departamento',
  },
  {
    route: '/auxiliary-data/church-categories',
    endpoint: 'ChurchesCategory',
    entityLabel: 'categoria de igreja',
    title: 'Detalhes da categoria de igreja',
  },
  {
    route: '/auxiliary-data/church-regions',
    endpoint: 'ChurchesRegion',
    entityLabel: 'região de igreja',
    title: 'Detalhes da região de igreja',
  },
  {
    route: '/administration/account-profiles',
    endpoint: 'AccountProfile',
    entityLabel: 'perfil de acesso',
    title: 'Detalhes do perfil de acesso',
  },
  {
    route: '/administration/accounts',
    endpoint: 'Account',
    entityLabel: 'usuário',
    title: 'Detalhes do usuário',
  },
  {
    route: '/auxiliary-data/genders',
    endpoint: 'Gender',
    entityLabel: 'gênero',
    title: 'Detalhes do gênero',
  },
  {
    route: '/auxiliary-data/marital-statuses',
    endpoint: 'MaritalStatus',
    entityLabel: 'estado civil',
    title: 'Detalhes do estado civil',
  },
  {
    route: '/auxiliary-data/phone-types',
    endpoint: 'PhoneType',
    entityLabel: 'tipo de telefone',
    title: 'Detalhes do tipo de telefone',
  },
  {
    route: '/auxiliary-data/address-types',
    endpoint: 'AddressType',
    entityLabel: 'tipo de endereço',
    title: 'Detalhes do tipo de endereço',
  },
  {
    route: '/auxiliary-data/education-levels',
    endpoint: 'EducationLevel',
    entityLabel: 'escolaridade',
    title: 'Detalhes da escolaridade',
  },
  {
    route: '/auxiliary-data/formation-areas',
    endpoint: 'FormationArea',
    entityLabel: 'área de formação',
    title: 'Detalhes da área de formação',
  },
  {
    route: '/auxiliary-data/professions',
    endpoint: 'Profession',
    entityLabel: 'profissão',
    title: 'Detalhes da profissão',
  },
  {
    route: '/auxiliary-data/membership-statuses',
    endpoint: 'MembershipStatus',
    entityLabel: 'situação da membresia',
    title: 'Detalhes da situação da membresia',
  },
  {
    route: '/auxiliary-data/religious-origins',
    endpoint: 'ReligiousOrigin',
    entityLabel: 'origem religiosa',
    title: 'Detalhes da origem religiosa',
  },
  {
    route: '/auxiliary-data/leader-types',
    endpoint: 'LeaderType',
    entityLabel: 'tipo de liderança',
    title: 'Detalhes do tipo de liderança',
  },
  { route: '/members', endpoint: 'Member', entityLabel: 'membro', title: 'Detalhes do membro' },
];

@Component({
  selector: 'app-data-table',
  imports: [
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDataTableComponent<T extends object> {
  private readonly router = inject(Router);
  private readonly entityDialogs = inject(EntityDialogService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly DataTableColumn<T>[]>();
  readonly actions = input<readonly DataTableAction<T>[]>([]);
  readonly loading = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);
  readonly emptyMessage = input<string>('Nenhum registro encontrado.');
  readonly toolbarEnabled = input<boolean>(true);
  readonly searchEnabled = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Pesquisar');
  readonly paginatorEnabled = input<boolean>(true);
  readonly sortingEnabled = input<boolean>(true);
  readonly selectionEnabled = input<boolean>(false);
  readonly crudActionsEnabled = input<boolean>(true);
  readonly mode = input<DataTableMode>('server');
  readonly totalItems = input<number>(0);
  readonly pageIndex = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly pageSizeOptions = input<readonly number[]>([5, 10, 25, 50]);
  readonly initialSearch = input<string>('');
  readonly ariaLabel = input<string>('Tabela de dados');
  readonly detailsComponent = input<Type<unknown> | null>(null);
  readonly deleteComponent = input<Type<unknown> | null>(null);

  readonly queryChanged = output<DataTableQuery>();
  readonly actionTriggered = output<DataTableActionEvent<T>>();
  readonly selectionChanged = output<readonly T[]>();
  readonly rowClicked = output<T>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly selection = new SelectionModel<T>(true);

  private readonly numberFormatter = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  private readonly dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  private readonly currentSearch = signal('');
  private readonly currentSortActive = signal<string | null>(null);
  private readonly currentSortDirection = signal<'asc' | 'desc' | ''>('');

  readonly visibleColumns = computed<readonly DataTableColumn<T>[]>(() =>
    this.columns().filter((column) => !column.hidden),
  );

  readonly hasProjectedActionsColumn = computed<boolean>(() =>
    this.visibleColumns().some((column) => column.type === 'actions'),
  );

  readonly crudConfig = computed<CrudRouteConfig | null>(() => {
    const path = this.router.url.split('?')[0].replace(/\/+$/, '') || '/';
    return (
      CRUD_ROUTES.find((config) => path === config.route || path.startsWith(`${config.route}/`)) ??
      null
    );
  });

  readonly effectiveActions = computed<readonly DataTableAction<T>[]>(() => {
    if (!this.crudActionsEnabled() || !this.crudConfig()) return this.actions();

    const standardActions: readonly DataTableAction<T>[] = [
      {
        id: '__view',
        label: 'Visualizar',
        icon: 'visibility',
        tooltip: 'Visualizar detalhes',
        color: 'primary',
      },
      {
        id: '__delete',
        label: 'Excluir',
        icon: 'delete_outline',
        tooltip: 'Excluir registro',
        color: 'warn',
      },
    ];

    return [standardActions[0], ...this.actions(), standardActions[1]];
  });

  readonly displayedColumns = computed<readonly string[]>(() => {
    const configuredColumns = this.visibleColumns().map((column) => this.columnId(column));
    const selectionColumns = this.selectionEnabled() ? [SELECTION_COLUMN] : [];
    const actionColumns =
      this.effectiveActions().length > 0 && !this.hasProjectedActionsColumn()
        ? [ACTIONS_COLUMN]
        : [];

    return [...selectionColumns, ...configuredColumns, ...actionColumns];
  });

  readonly filteredRows = computed<readonly T[]>(() => {
    const rows = [...this.data()];
    const search = this.currentSearch().toLocaleLowerCase('pt-BR');

    if (this.mode() !== 'client' || !search) {
      return rows;
    }

    return rows.filter((row) =>
      this.visibleColumns().some((column) =>
        this.formatCellValue(row, column).toLocaleLowerCase('pt-BR').includes(search),
      ),
    );
  });

  readonly sortedRows = computed<readonly T[]>(() => {
    const rows = [...this.filteredRows()];

    const sortActive = this.currentSortActive();
    const sortDirection = this.currentSortDirection();

    if (this.mode() !== 'client' || !sortActive || !sortDirection) {
      return rows;
    }

    const column = this.visibleColumns().find((item) => this.columnId(item) === sortActive);

    if (!column) {
      return rows;
    }

    return rows.sort((first, second) => {
      const comparison = this.compareValues(
        this.getCellValue(first, column),
        this.getCellValue(second, column),
      );
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  });

  readonly visibleRows = computed<readonly T[]>(() => {
    if (this.mode() === 'server' || !this.paginatorEnabled()) {
      return this.sortedRows();
    }

    const start = this.pageIndex() * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize());
  });

  readonly paginatorLength = computed<number>(() =>
    this.mode() === 'server' ? this.totalItems() : this.sortedRows().length,
  );

  readonly showEmptyState = computed<boolean>(
    () => !this.loading() && !this.errorMessage() && this.visibleRows().length === 0,
  );

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => {
        this.currentSearch.set(search);
        this.emitQuery(0, this.pageSize());
      });

    effect(() => {
      const initialSearch = this.initialSearch();
      this.currentSearch.set(initialSearch.trim());
      this.searchControl.setValue(initialSearch, { emitEvent: false });
    });

    effect(() => {
      const data = this.data();
      const selectedRows = this.selection.selected.filter((row) => data.includes(row));
      this.selection.clear();
      this.selection.select(...selectedRows);
      this.selectionChanged.emit([...this.selection.selected]);
    });

    effect(() => {
      const message = this.errorMessage();
      if (message) this.notification.error(message);
    });
  }

  columnId(column: DataTableColumn<T>): string {
    return String(column.key);
  }

  alignClass(column: DataTableColumn<T>): string {
    return `data-table__cell--${column.align ?? 'start'}`;
  }

  isColumnSortable(column: DataTableColumn<T>): boolean {
    return this.sortingEnabled() && column.sortable === true && column.type !== 'actions';
  }

  getCellValue(row: T, column: DataTableColumn<T>): unknown {
    if (column.valueAccessor) {
      return column.valueAccessor(row);
    }

    if (typeof column.key === 'string' && column.key.includes('.')) {
      return column.key.split('.').reduce<unknown>((value, key) => {
        if (value && typeof value === 'object' && key in value) {
          return (value as Record<string, unknown>)[key];
        }

        return undefined;
      }, row);
    }

    return row[column.key as keyof T];
  }

  formatCellValue(row: T, column: DataTableColumn<T>): string {
    const value = this.getCellValue(row, column);

    if (column.formatter) {
      return column.formatter(value, row);
    }

    if (value === null || value === undefined || value === '') {
      return column.emptyValue ?? '-';
    }

    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? this.numberFormatter.format(value) : String(value);
      case 'currency':
        return typeof value === 'number' ? this.currencyFormatter.format(value) : String(value);
      case 'date':
        return this.formatDate(value, this.dateFormatter, column.emptyValue);
      case 'datetime':
        return this.formatDate(value, this.dateTimeFormatter, column.emptyValue);
      case 'boolean':
        return value === true ? 'Sim' : 'Nao';
      case 'status':
      case 'chips':
      case 'text':
      case 'actions':
        return String(value);
    }
  }

  chipValues(row: T, column: DataTableColumn<T>): readonly string[] {
    const value = this.getCellValue(row, column);
    return Array.isArray(value)
      ? value.filter((item) => item !== null && item !== undefined).map(String)
      : value === null || value === undefined || value === ''
        ? []
        : [String(value)];
  }

  visibleChipValues(row: T, column: DataTableColumn<T>): readonly string[] {
    return this.chipValues(row, column).slice(0, 3);
  }

  hiddenChipCount(row: T, column: DataTableColumn<T>): number {
    return Math.max(0, this.chipValues(row, column).length - 3);
  }

  rowActions(row: T): readonly DataTableAction<T>[] {
    return this.effectiveActions().filter((action) => action.visible?.(row) ?? true);
  }

  isActionDisabled(action: DataTableAction<T>, row: T): boolean {
    return action.disabled?.(row) ?? false;
  }

  triggerAction(actionId: string, row: T): void {
    if (actionId === '__view' || actionId === '__delete') {
      this.handleCrudAction(actionId, row);
      return;
    }

    this.actionTriggered.emit({ actionId, row });
  }

  emitRowClick(row: T): void {
    this.rowClicked.emit(row);
  }

  handlePage(event: PageEvent): void {
    this.emitQuery(event.pageIndex, event.pageSize);
  }

  handleSort(sort: Sort): void {
    this.currentSortActive.set(sort.active || null);
    this.currentSortDirection.set(sort.direction);
    this.emitQuery(this.pageIndex(), this.pageSize());
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  toggleRow(row: T, event: MatCheckboxChange): void {
    if (event.checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }

    this.selectionChanged.emit([...this.selection.selected]);
  }

  toggleVisibleRows(event: MatCheckboxChange): void {
    if (event.checked) {
      this.selection.select(...this.visibleRows());
    } else {
      this.visibleRows().forEach((row) => this.selection.deselect(row));
    }

    this.selectionChanged.emit([...this.selection.selected]);
  }

  isAllVisibleSelected(): boolean {
    const rows = this.visibleRows();
    return rows.length > 0 && rows.every((row) => this.selection.isSelected(row));
  }

  isSomeVisibleSelected(): boolean {
    const rows = this.visibleRows();
    return rows.some((row) => this.selection.isSelected(row)) && !this.isAllVisibleSelected();
  }

  private emitQuery(pageIndex: number, pageSize: number): void {
    this.queryChanged.emit({
      search: this.currentSearch(),
      pageIndex,
      pageSize,
      sortActive: this.currentSortActive(),
      sortDirection: this.currentSortDirection(),
    });
  }

  private handleCrudAction(actionId: '__view' | '__delete', row: T): void {
    const config = this.crudConfig();
    const record = row as Record<string, unknown>;
    const id = String(record['id'] ?? '');
    if (!config || !id) return;

    const recordName = String(
      record['name'] ??
        record['fullName'] ??
        record['email'] ??
        record['username'] ??
        record['departmentName'] ??
        `Código ${record['code'] ?? id}`,
    );
    const options = {
      ...config,
      id,
      recordName,
      detailsComponent: this.detailsComponent() ?? undefined,
      deleteComponent: this.deleteComponent() ?? undefined,
    };

    if (actionId === '__view') {
      this.entityDialogs.openDetails(options);
      return;
    }

    this.entityDialogs
      .openDelete(options)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((deleted) => {
        if (deleted) this.emitQuery(this.pageIndex(), this.pageSize());
      });
  }

  private compareValues(first: unknown, second: unknown): number {
    if (first === second) {
      return 0;
    }

    if (first === null || first === undefined) {
      return 1;
    }

    if (second === null || second === undefined) {
      return -1;
    }

    if (first instanceof Date && second instanceof Date) {
      return first.getTime() - second.getTime();
    }

    if (typeof first === 'number' && typeof second === 'number') {
      return first - second;
    }

    return String(first).localeCompare(String(second), 'pt-BR', {
      numeric: true,
      sensitivity: 'base',
    });
  }

  private formatDate(
    value: unknown,
    formatter: Intl.DateTimeFormat,
    emptyValue: string | undefined,
  ): string {
    const date = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return emptyValue ?? '-';
    }

    return formatter.format(date);
  }
}
