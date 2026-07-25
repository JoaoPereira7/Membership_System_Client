import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface ChurchApiDto {
  readonly id: string;
  readonly name: string;
  readonly normalizedName?: string;
  readonly parentChurchId?: string | null;
  readonly isActive?: boolean;
}

export interface ChurchListItem {
  readonly id: string;
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly parentChurchName: string;
  readonly isActive: boolean;
}

export interface CreateChurchRequest {
  readonly name: string;
  readonly parentChurchId: string | null;
}

export interface UpdateChurchRequest {
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly isActive: boolean;
}

export type ChurchListQuery = AuxiliaryListQuery;
export type ChurchPagedResult = PagedResult<ChurchListItem>;
