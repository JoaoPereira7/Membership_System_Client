import { LeaderTypeListItem } from '../../Models/leader-type.models';

export type LeaderTypeDialogMode = 'create' | 'edit';

export interface LeaderTypeDialogData {
  readonly mode: LeaderTypeDialogMode;
  readonly item?: LeaderTypeListItem;
}

export interface LeaderTypeDialogResult {
  readonly saved: boolean;
  readonly item?: LeaderTypeListItem;
}
