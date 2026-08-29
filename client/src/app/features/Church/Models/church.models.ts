import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface ChurchApiDto {
  readonly id: string;
  readonly name: string;
  readonly normalizedName?: string;
  readonly parentChurchId?: string | null;
  readonly parentChurchName?: string | null;
  readonly churchesCategoryId?: number | null;
  readonly churchesCategoryName?: string | null;
  readonly churchesRegionId?: number | null;
  readonly churchesRegionName?: string | null;
  readonly isActive?: boolean;
}

export interface ChurchListItem {
  readonly id: string;
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly parentChurchName: string;
  readonly churchesCategoryId: number | null;
  readonly churchesCategoryName: string;
  readonly churchesRegionId: number | null;
  readonly churchesRegionName: string;
  readonly isActive: boolean;
}

export interface CreateChurchRequest {
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly churchesCategoryId: number | null;
  readonly churchesRegionId: number | null;
}

export interface UpdateChurchRequest {
  readonly name: string;
  readonly parentChurchId: string | null;
  readonly churchesCategoryId: number | null;
  readonly churchesRegionId: number | null;
  readonly isActive: boolean;
}

export type ChurchListQuery = AuxiliaryListQuery;
export type ChurchPagedResult = PagedResult<ChurchListItem>;
