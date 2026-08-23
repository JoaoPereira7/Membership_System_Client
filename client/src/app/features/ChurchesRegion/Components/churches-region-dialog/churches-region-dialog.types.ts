import { ChurchesRegionListItem } from '../../Models/churches-region.models';

export type ChurchesRegionDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: ChurchesRegionListItem };

export interface ChurchesRegionDialogResult {
  readonly saved: boolean;
  readonly item?: ChurchesRegionListItem;
}
