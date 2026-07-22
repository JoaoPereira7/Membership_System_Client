import { ProfessionListItem } from '../../Models/profession.models';

export type ProfessionDialogMode = 'create' | 'edit';

export interface ProfessionDialogData {
  readonly mode: ProfessionDialogMode;
  readonly item?: ProfessionListItem;
}

export interface ProfessionDialogResult {
  readonly saved: boolean;
  readonly item?: ProfessionListItem;
}
