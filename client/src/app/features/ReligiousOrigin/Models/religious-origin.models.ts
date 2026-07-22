import { AuxiliaryListItemBase } from '../../../core/models/auxiliary-data.models';

export interface ReligiousOriginApiDto {
  readonly id: string;
  readonly code: number;
  readonly name: string;
  readonly normalizedName?: string;
  readonly isActive?: boolean;
  readonly createdDate?: string;
  readonly updateDate?: string;
}

export interface ReligiousOriginListItem extends AuxiliaryListItemBase {}

export interface CreateReligiousOriginRequest {
  readonly name: string;
  readonly isActive: true;
}

export interface UpdateReligiousOriginRequest {
  readonly name: string;
  readonly isActive: boolean;
}
