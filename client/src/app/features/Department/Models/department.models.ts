import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface DepartmentApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface DepartmentListItem extends AuxiliaryListItemBase {}

export interface CreateDepartmentRequest {
  readonly name: string;
}

export interface UpdateDepartmentRequest {
  readonly name: string;
  readonly isActive: boolean;
}
