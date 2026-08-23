import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface ChurchesRegionApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface ChurchesRegionListItem extends AuxiliaryListItemBase {}

export interface CreateChurchesRegionRequest {
  readonly name: string;
}

export interface UpdateChurchesRegionRequest {
  readonly name: string;
  readonly isActive: boolean;
}
