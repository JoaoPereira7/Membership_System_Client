export interface AuxiliaryListQuery {
  readonly search: string;
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly sortActive: string | null;
  readonly sortDirection: 'asc' | 'desc' | '';
}

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalItems: number;
}

export interface AuxiliaryListItemBase {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly isActive: boolean;
  readonly createdDate: string;
  readonly updateDate: string;
}

export function paginateAuxiliaryItems<T extends AuxiliaryListItemBase>(
  items: readonly T[],
  query: AuxiliaryListQuery,
): PagedResult<T> {
  const normalizedSearch = query.search.trim().toLocaleLowerCase('pt-BR');
  const filteredItems = normalizedSearch
    ? items.filter(
        (item) =>
          item.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
          String(item.code).includes(normalizedSearch),
      )
    : [...items];
  const sortedItems = sortAuxiliaryItems(filteredItems, query);
  const start = query.pageIndex * query.pageSize;

  return {
    items: sortedItems.slice(start, start + query.pageSize),
    totalItems: sortedItems.length,
  };
}

function sortAuxiliaryItems<T extends AuxiliaryListItemBase>(
  items: readonly T[],
  query: AuxiliaryListQuery,
): readonly T[] {
  if (!query.sortActive || !query.sortDirection) {
    return [...items];
  }

  const sortKey = query.sortActive as keyof T;
  const direction = query.sortDirection === 'asc' ? 1 : -1;

  return [...items].sort(
    (first, second) => compareValues(first[sortKey], second[sortKey]) * direction,
  );
}

function compareValues(first: unknown, second: unknown): number {
  if (first === second) {
    return 0;
  }

  if (first === null || first === undefined || first === '') {
    return 1;
  }

  if (second === null || second === undefined || second === '') {
    return -1;
  }

  if (typeof first === 'number' && typeof second === 'number') {
    return first - second;
  }

  return String(first).localeCompare(String(second), 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}
