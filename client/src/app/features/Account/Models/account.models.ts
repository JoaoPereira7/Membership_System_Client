import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface AccountApiDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly isActive?: boolean;
  readonly accountProfileId: string;
}

export interface AccountListItem {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly accountProfileId: string;
  readonly accountProfileName: string;
  readonly isActive: boolean;
}

export interface CreateAccountRequest {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
  readonly accountProfileId: string;
}

export interface UpdateAccountRequest {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly accountProfileId: string;
  readonly isActive: boolean;
  readonly password?: string;
}

export type AccountListQuery = AuxiliaryListQuery;
export type AccountPagedResult = PagedResult<AccountListItem>;
