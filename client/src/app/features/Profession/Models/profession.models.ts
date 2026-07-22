import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface ProfessionApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface ProfessionListItem extends AuxiliaryListItemBase {}

export interface CreateProfessionRequest {
  readonly name: string;
  readonly isActive: true;
}

export interface UpdateProfessionRequest {
  readonly name: string;
  readonly isActive: boolean;
}
