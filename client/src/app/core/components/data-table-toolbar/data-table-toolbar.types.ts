/** Presentation data used by the total-items counter. */
export interface DataTableToolbarItemCount {
  readonly value: number;
  readonly formattedValue: string;
  readonly label: string;
}

/** Accessible summary associated with the active-filters badge. */
export interface DataTableToolbarFilterSummary {
  readonly count: number;
  readonly label: string;
}
