import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface ChurchRoleApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface ChurchRoleListItem extends AuxiliaryListItemBase {}

export interface CreateChurchRoleRequest {
  readonly name: string;
}

export interface UpdateChurchRoleRequest {
  readonly name: string;
  readonly isActive: boolean;
}
