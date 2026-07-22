import { PhoneTypeListItem } from '../../Models/phone-type.models';

export type PhoneTypeDialogMode = 'create' | 'edit';

export interface PhoneTypeDialogData {
  readonly mode: PhoneTypeDialogMode;
  readonly item?: PhoneTypeListItem;
}

export interface PhoneTypeDialogResult {
  readonly saved: boolean;
  readonly item?: PhoneTypeListItem;
}
