import { ChurchRoleListItem } from '../../Models/church-role.models';

export type ChurchRoleDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: ChurchRoleListItem };

export interface ChurchRoleDialogResult {
  readonly saved: boolean;
  readonly item?: ChurchRoleListItem;
}
