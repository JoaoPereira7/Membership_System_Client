export type DataTableAlign = 'start' | 'center' | 'end';

export type DataTableColumnType = 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'status' | 'actions';

export type DataTableMode = 'client' | 'server';

export interface DataTableColumn<T extends object> {
  readonly key: keyof T | string;
  readonly label: string;
  readonly type: DataTableColumnType;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly minWidth?: string;
  readonly align?: DataTableAlign;
  readonly sticky?: boolean;
  readonly stickyEnd?: boolean;
  readonly hidden?: boolean;
  readonly valueAccessor?: (row: T) => unknown;
  readonly formatter?: (value: unknown, row: T) => string;
  readonly emptyValue?: string;
}

export interface DataTableAction<T extends object> {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly tooltip?: string;
  readonly color?: 'primary' | 'accent' | 'warn';
  readonly visible?: (row: T) => boolean;
  readonly disabled?: (row: T) => boolean;
}

export interface DataTableSort {
  readonly active: string | null;
  readonly direction: 'asc' | 'desc' | '';
}

export interface DataTableQuery {
  readonly search: string;
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly sortActive: string | null;
  readonly sortDirection: 'asc' | 'desc' | '';
}

export interface DataTableActionEvent<T extends object> {
  readonly actionId: string;
  readonly row: T;
}

export interface DataTableSelection<T extends object> {
  readonly rows: readonly T[];
}