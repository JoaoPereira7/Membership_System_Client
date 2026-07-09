export type FormShellMode = 'create' | 'edit' | 'view';

export type FormShellAppearance = 'card' | 'plain';

export interface FormShellModeViewModel {
  readonly label: string;
  readonly icon: string;
}