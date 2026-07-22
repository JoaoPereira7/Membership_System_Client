import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface FormationAreaApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface FormationAreaListItem extends AuxiliaryListItemBase {}

export interface CreateFormationAreaRequest {
  readonly name: string;
  readonly isActive: true;
}

export interface UpdateFormationAreaRequest {
  readonly name: string;
  readonly isActive: boolean;
}
