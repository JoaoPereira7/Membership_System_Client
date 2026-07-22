import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface EducationLevelApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface EducationLevelListItem extends AuxiliaryListItemBase {}

export interface CreateEducationLevelRequest {
  readonly name: string;
  readonly isActive: true;
}

export interface UpdateEducationLevelRequest {
  readonly name: string;
  readonly isActive: boolean;
}
