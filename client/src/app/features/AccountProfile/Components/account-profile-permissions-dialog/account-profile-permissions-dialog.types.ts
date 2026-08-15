import { AccountProfileListItem } from '../../Models/account-profile.models';

export interface AccountProfilePermissionsDialogData {
  readonly profile: AccountProfileListItem;
}

export interface AccountProfilePermissionsDialogResult {
  readonly saved: boolean;
}
