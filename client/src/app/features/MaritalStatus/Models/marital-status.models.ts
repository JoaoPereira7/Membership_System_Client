import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface MaritalStatusApiDto {
  readonly id: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface MaritalStatusListItem extends AuxiliaryListItemBase {}

export interface CreateMaritalStatusRequest {
  readonly name: string;
  readonly isActive: boolean;
}

export interface UpdateMaritalStatusRequest {
  readonly name: string;
  readonly isActive: boolean;
}
