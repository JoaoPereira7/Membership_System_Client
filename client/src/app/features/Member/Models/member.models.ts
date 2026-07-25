import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface LookupItem { readonly id: string; readonly name: string; readonly isActive: boolean; }
export interface MemberListItem {
  readonly id: string; readonly name: string; readonly cpf: string; readonly churchName: string;
  readonly departmentNames: string; readonly isLeader: boolean;
  readonly membershipStatusName: string; readonly isActive: boolean;
}
export interface MemberData {
  readonly id?: string; readonly name: string; readonly cpf: string; readonly rg: string | null;
  readonly birthDate: string | null; readonly genderId: string | null;
  readonly maritalStatusId: string | null; readonly nationality: string | null;
  readonly motherName: string | null; readonly fatherName: string | null;
  readonly email: string | null; readonly isActive: boolean;
}
export interface MemberPhone {
  readonly id?: string; readonly phoneTypeId: string; readonly number: string; readonly isActive: boolean;
}
export interface MemberAddress {
  readonly id?: string; readonly addressTypeId: string; readonly zipCode: string;
  readonly street: string; readonly number: string; readonly complement: string | null;
  readonly neighborhood: string; readonly city: string; readonly state: string; readonly isActive: boolean;
}
export interface ProfessionalInformation {
  readonly educationLevelId: string | null; readonly formationAreaId: string | null;
  readonly professionId: string | null;
}
export interface MemberMembership {
  readonly id?: string; readonly churchId: string; readonly dateJoinedChurch: string;
  readonly membershipStatusId: string; readonly religiousOriginId: string | null;
  readonly pastorId: string | null; readonly isActive: boolean;
}
export interface MembershipRole {
  readonly id?: string; readonly churchRoleId: string; readonly startDate: string;
  readonly endDate: string | null; readonly isActive: boolean;
}
export interface DepartmentLeadership {
  readonly id?: string; readonly leaderTypeId: string; readonly startDate: string;
  readonly endDate: string | null; readonly isActive: boolean;
}
export interface MemberDepartment {
  readonly id?: string; readonly churchDepartmentId: string; readonly startDate: string;
  readonly endDate: string | null; readonly isActive: boolean;
  readonly leadership: DepartmentLeadership | null;
}
export interface CompleteMember {
  readonly id?: string; readonly member: MemberData; readonly phones: readonly MemberPhone[];
  readonly addresses: readonly MemberAddress[]; readonly professionalInformation: ProfessionalInformation | null;
  readonly membership: MemberMembership; readonly membershipRoles: readonly MembershipRole[];
  readonly memberDepartments: readonly MemberDepartment[];
}
export interface ChurchDepartmentLookup {
  readonly id: string; readonly churchId: string; readonly departmentName: string; readonly isActive: boolean;
}
export type MemberListQuery = AuxiliaryListQuery;
export type MemberPagedResult = PagedResult<MemberListItem>;
