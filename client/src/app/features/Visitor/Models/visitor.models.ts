import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface VisitorListItem {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;
  readonly phone: string;
  readonly email: string | null;
  readonly normalizedEmail: string | null;
  readonly visitDate: string;
  readonly churchId: string;
  readonly churchName: string;
  readonly createdDate: string;
  readonly updateDate: string;
  readonly isActive: boolean;
}

export interface CreateVisitorRequest {
  readonly name: string;
  readonly phone: string;
  readonly email: string | null;
  readonly visitDate: string;
  readonly churchId: string;
}

export type UpdateVisitorRequest = CreateVisitorRequest;
export type VisitorListQuery = AuxiliaryListQuery;
export type VisitorPagedResult = PagedResult<VisitorListItem>;
