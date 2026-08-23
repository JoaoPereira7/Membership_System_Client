import { ChurchesCategoryListItem } from '../../Models/churches-category.models';

export type ChurchesCategoryDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: ChurchesCategoryListItem };

export interface ChurchesCategoryDialogResult {
  readonly saved: boolean;
  readonly item?: ChurchesCategoryListItem;
}
