import {
  AuxiliaryListItemBase,
  AuxiliaryListQuery,
  PagedResult,
} from '../../../core/models/auxiliary-data.models';

export interface AccountProfileApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly description?: string | null;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
}

export interface AccountProfileListItem extends AuxiliaryListItemBase {
  readonly description: string;
}

export interface CreateAccountProfileRequest {
  readonly name: string;
  readonly description: string | null;
  readonly isActive: true;
}

export interface UpdateAccountProfileRequest {
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
}

export type AccountProfileListQuery = AuxiliaryListQuery;
export type AccountProfilePagedResult = PagedResult<AccountProfileListItem>;

export interface PermissionApiDto {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;
  readonly description?: string | null;
  readonly isActive: boolean;
}

export interface AccountProfilePermissionApiDto {
  readonly id: string;
  readonly accountProfileId: string;
  readonly permissionId: string;
  readonly isActive: boolean;
}
