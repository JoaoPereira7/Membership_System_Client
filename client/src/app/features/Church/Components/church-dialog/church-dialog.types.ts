import { ChurchListItem } from '../../Models/church.models';

export type ChurchDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: ChurchListItem };

export interface ChurchDialogResult {
  readonly saved: boolean;
  readonly item?: ChurchListItem;
}
