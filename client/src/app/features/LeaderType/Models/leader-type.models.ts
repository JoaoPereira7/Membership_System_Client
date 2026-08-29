import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface LeaderTypeApiDto {
  readonly id: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface LeaderTypeListItem extends AuxiliaryListItemBase {}

export interface CreateLeaderTypeRequest {
  readonly name: string;
  readonly isActive: true;
}

export interface UpdateLeaderTypeRequest {
  readonly name: string;
  readonly isActive: boolean;
}
