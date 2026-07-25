import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface ChurchDepartmentApiDto {
  readonly id: string;
  readonly churchId: string;
  readonly churchName: string;
  readonly departmentId: string;
  readonly departmentName: string;
  readonly startDate: string;
  readonly isActive: boolean;
}

export interface ChurchDepartmentListItem extends ChurchDepartmentApiDto {}

export interface CreateChurchDepartmentRequest {
  readonly churchId: string;
  readonly departmentId: string;
  readonly startDate: string;
}

export interface UpdateChurchDepartmentRequest {
  readonly churchId: string;
  readonly departmentId: string;
  readonly startDate: string;
  readonly isActive: boolean;
}

export type ChurchDepartmentListQuery = AuxiliaryListQuery;
export type ChurchDepartmentPagedResult = PagedResult<ChurchDepartmentListItem>;
