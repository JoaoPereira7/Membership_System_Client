export type AdvancedFilterSearchType = 'local' | 'remote' | 'scalar';
export type AdvancedFilterScalarType = 'text' | 'number' | 'date';
export type AdvancedFilterScalarValue = string | number | null;
export type AdvancedFilterItemId = string | number;

export interface AdvancedFilterGroup<TItem = unknown> {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly searchType: AdvancedFilterSearchType;
  readonly scalarType?: AdvancedFilterScalarType;
  readonly localItems?: readonly TItem[];
  readonly loadItems?: (search: string) => Promise<readonly TItem[]>;
  getItemId(item: TItem): AdvancedFilterItemId;
  getItemLabel(item: TItem): string;
  getItemChipLabel?(item: TItem): string;
}

export type AdvancedFilterValue<TItem = unknown> = readonly TItem[] | AdvancedFilterScalarValue;

export type AdvancedFilterResult<TItem = unknown> = Readonly<
  Record<string, AdvancedFilterValue<TItem>>
>;
