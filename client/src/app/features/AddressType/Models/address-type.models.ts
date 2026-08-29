import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface AddressTypeApiDto {
  readonly id: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface AddressTypeListItem extends AuxiliaryListItemBase {}

export interface CreateAddressTypeRequest {
  readonly name: string;
  readonly isActive: boolean;
}

export interface UpdateAddressTypeRequest {
  readonly name: string;
  readonly isActive: boolean;
}
