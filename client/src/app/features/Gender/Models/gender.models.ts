import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface GenderApiDto {
  readonly id: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface GenderListItem extends AuxiliaryListItemBase {}

export interface CreateGenderRequest {
  readonly name: string;
  readonly isActive: boolean;
}

export interface UpdateGenderRequest {
  readonly name: string;
  readonly isActive: boolean;
}
