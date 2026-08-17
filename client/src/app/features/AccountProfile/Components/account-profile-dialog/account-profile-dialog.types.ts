import { AccountProfileListItem } from '../../Models/account-profile.models';

export type AccountProfileDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: AccountProfileListItem };

export interface AccountProfileDialogResult {
  readonly saved: boolean;
  readonly item?: AccountProfileListItem;
}
