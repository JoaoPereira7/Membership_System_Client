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
