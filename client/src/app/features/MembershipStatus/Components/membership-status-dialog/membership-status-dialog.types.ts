import { MembershipStatusListItem } from '../../Models/membership-status.models';

export type MembershipStatusDialogMode = 'create' | 'edit';

export interface MembershipStatusDialogData {
  readonly mode: MembershipStatusDialogMode;
  readonly item?: MembershipStatusListItem;
}

export interface MembershipStatusDialogResult {
  readonly saved: boolean;
  readonly item?: MembershipStatusListItem;
}
