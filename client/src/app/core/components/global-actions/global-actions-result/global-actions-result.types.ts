export type GlobalActionsResultFilter = 'all' | 'success' | 'failure' | 'ignored';

export interface GlobalActionsResultItem {
  readonly id?: string | number;
  readonly label?: string;
  readonly success: boolean;
  readonly ignored?: boolean;
  readonly failures?: readonly string[];
}

export interface GlobalActionsResultData {
  readonly command: string;
  readonly commandLabel: string;
  readonly total: number;
  readonly successCount: number;
  readonly ignoredCount?: number;
  readonly items: readonly GlobalActionsResultItem[];
}
