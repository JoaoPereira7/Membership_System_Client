import { MaritalStatusListItem } from '../../Models/marital-status.models';

export type MaritalStatusDialogMode = 'create' | 'edit';

export interface MaritalStatusDialogData {
  readonly mode: MaritalStatusDialogMode;
  readonly item?: MaritalStatusListItem;
}

export interface MaritalStatusDialogResult {
  readonly saved: boolean;
  readonly item?: MaritalStatusListItem;
}
