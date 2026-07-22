import { ReligiousOriginListItem } from '../../Models/religious-origin.models';

export type ReligiousOriginDialogMode = 'create' | 'edit';

export interface ReligiousOriginDialogData {
  readonly mode: ReligiousOriginDialogMode;
  readonly item?: ReligiousOriginListItem;
}

export interface ReligiousOriginDialogResult {
  readonly saved: boolean;
  readonly item?: ReligiousOriginListItem;
}
