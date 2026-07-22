import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface PhoneTypeApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface PhoneTypeListItem extends AuxiliaryListItemBase {}

export interface CreatePhoneTypeRequest {
  readonly name: string;
  readonly isActive: boolean;
}

export interface UpdatePhoneTypeRequest {
  readonly name: string;
  readonly isActive: boolean;
}
