import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface ChurchesCategoryApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface ChurchesCategoryListItem extends AuxiliaryListItemBase {}

export interface CreateChurchesCategoryRequest {
  readonly name: string;
}

export interface UpdateChurchesCategoryRequest {
  readonly name: string;
  readonly isActive: boolean;
}
