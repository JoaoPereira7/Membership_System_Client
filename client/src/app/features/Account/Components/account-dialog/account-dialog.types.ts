import { AccountListItem } from '../../Models/account.models';

export type AccountDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: AccountListItem };

export interface AccountDialogResult {
  readonly saved: boolean;
  readonly item?: AccountListItem;
}
