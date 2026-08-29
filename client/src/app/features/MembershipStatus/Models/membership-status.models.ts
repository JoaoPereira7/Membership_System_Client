import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface MembershipStatusApiDto {
  readonly id: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface MembershipStatusListItem extends AuxiliaryListItemBase {}

export interface CreateMembershipStatusRequest {
  readonly name: string;
  readonly isActive: true;
}

export interface UpdateMembershipStatusRequest {
  readonly name: string;
  readonly isActive: boolean;
}
