import { AddressTypeListItem } from '../../Models/address-type.models';

export type AddressTypeDialogMode = 'create' | 'edit';

export interface AddressTypeDialogData {
  readonly mode: AddressTypeDialogMode;
  readonly item?: AddressTypeListItem;
}

export interface AddressTypeDialogResult {
  readonly saved: boolean;
  readonly item?: AddressTypeListItem;
}
