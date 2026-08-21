export type GlobalActionTone = 'primary' | 'warning' | 'danger';

export interface GlobalAction {
  readonly command: string;
  readonly label: string;
  readonly icon: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly tone?: GlobalActionTone;
}

export interface GlobalActionsData {
  readonly title?: string;
  readonly itemCount: number;
  readonly itemLabel?: string;
  readonly warning?: string;
  readonly confirmationMessage?: string;
  readonly confirmLabel?: string;
  readonly actions: readonly GlobalAction[];
}
