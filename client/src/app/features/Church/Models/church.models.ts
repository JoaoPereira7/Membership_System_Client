import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface ChurchApiDto {
  readonly id: string;
  readonly name: string;
  readonly normalizedName?: string;
  readonly parentChurchId?: string | null;
  readonly parentChurchName?: string | null;
  readonly churchesCategoryId?: string | null;
  readonly churchesCategoryName?: string | null;
  readonly churchesRegionId?: string | null;
  readonly churchesRegionName?: string | null;
  readonly isActive?: boolean;
}

export interface ChurchListItem {
  readonly id: string;
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly parentChurchName: string;
  readonly churchesCategoryId: string | null;
  readonly churchesCategoryName: string;
  readonly churchesRegionId: string | null;
  readonly churchesRegionName: string;
  readonly isActive: boolean;
}

export interface CreateChurchRequest {
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly churchesCategoryId: string | null;
  readonly churchesRegionId: string | null;
}

export interface UpdateChurchRequest {
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly churchesCategoryId: string | null;
  readonly churchesRegionId: string | null;
  readonly isActive: boolean;
}

export type ChurchListQuery = AuxiliaryListQuery;
export type ChurchPagedResult = PagedResult<ChurchListItem>;
