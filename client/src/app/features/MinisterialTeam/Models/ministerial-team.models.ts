import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface MinisterialTeamRole {
  readonly churchRoleId: string;
  readonly churchRoleName: string;
}

export interface MinisterialTeamListItem {
  readonly membershipId: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly churchName: string;
  readonly churchRegionName: string;
  readonly parentChurchName: string;
  readonly isActive: boolean;
  readonly roles: readonly MinisterialTeamRole[];
}

export type MinisterialTeamListQuery = AuxiliaryListQuery;

export type MinisterialTeamPagedResult = PagedResult<MinisterialTeamListItem>;
