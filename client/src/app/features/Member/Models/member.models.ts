import { AuxiliaryListQuery, PagedResult } from '../../../core/models/auxiliary-data.models';

export interface LookupItem<TId extends string | number = string | number> {
  readonly id: TId;
  readonly name: string;
  readonly isActive: boolean;
}
export interface MemberListItem {
  readonly id: string;
  readonly name: string;
  readonly cpf: string;
  readonly churchName: string;
  readonly departmentNames: string;
  readonly isLeader: boolean;
  readonly membershipStatusName: string;
  readonly isActive: boolean;
}
export interface MemberData {
  readonly id?: string;
  readonly name: string;
  readonly cpf: string;
  readonly rg: string | null;
  readonly birthDate: string | null;
  readonly genderId: number | null;
  readonly maritalStatusId: number | null;
  readonly nationality: string | null;
  readonly motherName: string | null;
  readonly fatherName: string | null;
  readonly email: string | null;
  readonly isActive: boolean;
}
export interface MemberPhone {
  readonly id?: string;
  readonly phoneTypeId: number;
  readonly number: string;
  readonly isActive: boolean;
}
export interface MemberAddress {
  readonly id?: string;
  readonly addressTypeId: number;
  readonly zipCode: string;
  readonly street: string;
  readonly number: string;
  readonly complement: string | null;
  readonly neighborhood: string;
  readonly city: string;
  readonly state: string;
  readonly isActive: boolean;
}
export interface ProfessionalInformation {
  readonly educationLevelId: number | null;
  readonly formationAreaId: number | null;
  readonly professionId: number | null;
}
export interface MemberMembership {
  readonly id?: string;
  readonly churchId: string;
  readonly dateJoinedChurch: string;
  readonly membershipStatusId: number;
  readonly religiousOriginId: number | null;
  readonly pastorId: string | null;
  readonly isActive: boolean;
}
export interface MembershipRole {
  readonly id?: string;
  readonly churchRoleId: number;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly isActive: boolean;
}
export interface DepartmentLeadership {
  readonly id?: string;
  readonly leaderTypeId: number;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly isActive: boolean;
}
export interface MemberDepartment {
  readonly id?: string;
  readonly churchDepartmentId: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly activeParticipant: boolean;
  readonly leadership: DepartmentLeadership | null;
}
export interface CompleteMember {
  readonly id?: string;
  readonly member: MemberData;
  readonly phones: readonly MemberPhone[];
  readonly addresses: readonly MemberAddress[];
  readonly professionalInformation: ProfessionalInformation | null;
  readonly membership: MemberMembership;
  readonly membershipRoles: readonly MembershipRole[];
  readonly memberDepartments: readonly MemberDepartment[];
}
export interface ChurchDepartmentLookup {
  readonly id: string;
  readonly churchId: string;
  readonly departmentName: string;
  readonly isActive: boolean;
}

export interface CreateMembershipRoleRequest {
  readonly churchRoleId: number;
  readonly startDate: string;
}

export interface UpdateMembershipRoleRequest extends CreateMembershipRoleRequest {
  readonly endDate: string | null;
}

export interface CreateMemberDepartmentRequest {
  readonly churchDepartmentId: string;
  readonly startDate: string;
  readonly leaderTypeId: number | null;
  readonly leadershipStartDate: string | null;
}

export interface UpdateMemberDepartmentRequest extends CreateMemberDepartmentRequest {
  readonly endDate: string | null;
  readonly activeParticipant: boolean;
  readonly leadershipEndDate: string | null;
}

export interface FullMemberGeneral {
  readonly name: string;
  readonly cpf: string;
  readonly rg: string | null;
  readonly birthDate: string | null;
  readonly gender: string | null;
  readonly maritalStatus: string | null;
  readonly nationality: string | null;
  readonly motherName: string | null;
  readonly fatherName: string | null;
  readonly email: string | null;
  readonly isActive: boolean;
}

export interface FullMemberPhone {
  readonly phoneType: string;
  readonly number: string;
  readonly isActive: boolean;
}

export interface FullMemberAddress {
  readonly addressType: string;
  readonly zipCode: string;
  readonly street: string;
  readonly number: string;
  readonly complement: string | null;
  readonly neighborhood: string;
  readonly city: string;
  readonly state: string;
  readonly isActive: boolean;
}

export interface FullMemberProfessional {
  readonly educationLevel: string | null;
  readonly formationArea: string | null;
  readonly profession: string | null;
}

export interface FullMemberMembership {
  readonly church: string;
  readonly dateJoinedChurch: string;
  readonly membershipStatus: string;
  readonly religiousOrigin: string | null;
  readonly pastor: string | null;
  readonly isActive: boolean;
}

export interface FullMemberRole {
  readonly churchRole: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly isActive: boolean;
}

export interface FullMemberLeadership {
  readonly leaderType: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly isActive: boolean;
}

export interface FullMemberDepartment {
  readonly department: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly activeParticipant: boolean;
  readonly leaderships: readonly FullMemberLeadership[];
}

export interface FullMember {
  readonly member: FullMemberGeneral;
  readonly phones: readonly FullMemberPhone[];
  readonly addresses: readonly FullMemberAddress[];
  readonly professionalInformation: FullMemberProfessional | null;
  readonly membership: FullMemberMembership | null;
  readonly membershipRoles: readonly FullMemberRole[];
  readonly memberDepartments: readonly FullMemberDepartment[];
}

export type MemberListQuery = AuxiliaryListQuery;
export type MemberPagedResult = PagedResult<MemberListItem>;
