import { GenderListItem } from '../../Models/gender.models';

export type GenderDialogMode = 'create' | 'edit';

export interface GenderDialogData {
  readonly mode: GenderDialogMode;
  readonly item?: GenderListItem;
}

export interface GenderDialogResult {
  readonly saved: boolean;
  readonly item?: GenderListItem;
}
