import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, ApiResponseError, unwrapApiData } from '../../../core/api/api.models';
import {
  ChurchDepartmentLookup,
  CompleteMember,
  CreateMemberDepartmentRequest,
  CreateMembershipRoleRequest,
  FullMember,
  LookupItem,
  MemberListItem,
  MemberListQuery,
  MemberPagedResult,
  UpdateMemberDepartmentRequest,
  UpdateMembershipRoleRequest,
} from '../Models/member.models';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Member`;

  getPaged(query: MemberListQuery): Observable<MemberPagedResult> {
    const params = new HttpParams()
      .set('search', query.search)
      .set('page', query.pageIndex + 1)
      .set('pageSize', query.pageSize)
      .set('sortActive', query.sortActive ?? 'name')
      .set('sortDirection', query.sortDirection || 'asc');

    return this.http
      .get<ApiResponse<MemberPagedResult>>(`${this.endpoint}/list`, { params })
      .pipe(map((response) => unwrapApiData(response, 'Não foi possível carregar os membros.')));
  }
  getById(id: string): Observable<CompleteMember> {
    return this.http
      .get<ApiResponse<CompleteMember>>(`${this.endpoint}/${id}/complete`)
      .pipe(map((response) => unwrapApiData(response, 'Membro não encontrado.')));
  }
  getFullById(id: string): Observable<FullMember> {
    return this.http
      .get<ApiResponse<FullMember>>(`${this.endpoint}/${encodeURIComponent(id)}/full`)
      .pipe(map((response) => unwrapApiData(response, 'Membro não encontrado.')));
  }
  create(payload: CompleteMember): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.endpoint}/complete`, payload);
  }
  update(id: string, payload: CompleteMember): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(`${this.endpoint}/${id}/complete`, payload);
  }
  getLookups(): Observable<Record<string, readonly LookupItem[]>> {
    const endpoints = {
      genders: 'Gender',
      maritalStatuses: 'MaritalStatus',
      phoneTypes: 'PhoneType',
      addressTypes: 'AddressType',
      educationLevels: 'EducationLevel',
      formationAreas: 'FormationArea',
      professions: 'Profession',
      churches: 'Church',
      membershipStatuses: 'MembershipStatus',
      religiousOrigins: 'ReligiousOrigin',
      churchRoles: 'ChurchRole',
      leaderTypes: 'LeaderType',
      pastors: 'Member/pastors',
    };
    const requests: Record<string, Observable<readonly LookupItem[]>> = {};
    Object.entries(endpoints).forEach(([key, endpoint]) => {
      requests[key] = this.http
        .get<ApiResponse<readonly LookupItem[]>>(`${environment.apiBaseUrl}/${endpoint}`)
        .pipe(map((response) => (response.data ?? []).filter((item) => item.isActive !== false)));
    });
    return forkJoin(requests);
  }
  getChurchDepartments(): Observable<readonly ChurchDepartmentLookup[]> {
    return this.http
      .get<ApiResponse<readonly ChurchDepartmentLookup[]>>(
        `${environment.apiBaseUrl}/ChurchDepartment`,
      )
      .pipe(map((response) => (response.data ?? []).filter((item) => item.isActive)));
  }

  getChurchRoles(): Observable<readonly LookupItem<number>[]> {
    return this.getActiveLookup<number>('ChurchRole');
  }

  getLeaderTypes(): Observable<readonly LookupItem<number>[]> {
    return this.getActiveLookup<number>('LeaderType');
  }

  createMembershipRole(memberId: string, payload: CreateMembershipRoleRequest): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(
        `${this.endpoint}/${encodeURIComponent(memberId)}/church-roles`,
        payload,
      )
      .pipe(
        map((response) =>
          this.completeOperation(response, 'NÃ£o foi possÃ­vel adicionar o cargo.'),
        ),
      );
  }

  updateMembershipRole(
    memberId: string,
    membershipRoleId: string,
    payload: UpdateMembershipRoleRequest,
  ): Observable<void> {
    return this.http
      .put<ApiResponse<unknown>>(
        `${this.endpoint}/${encodeURIComponent(memberId)}/church-roles/${encodeURIComponent(membershipRoleId)}`,
        payload,
      )
      .pipe(
        map((response) => this.completeOperation(response, 'Não foi possível atualizar o cargo.')),
      );
  }

  deleteMembershipRole(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(
        `${environment.apiBaseUrl}/MembershipRole/${encodeURIComponent(id)}`,
      )
      .pipe(
        map((response) => this.completeOperation(response, 'NÃ£o foi possÃ­vel remover o cargo.')),
      );
  }

  createMemberDepartmentWithLeadership(
    memberId: string,
    payload: CreateMemberDepartmentRequest,
  ): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(
        `${this.endpoint}/${encodeURIComponent(memberId)}/departments`,
        payload,
      )
      .pipe(
        map((response) =>
          this.completeOperation(
            response,
            'NÃ£o foi possÃ­vel adicionar o departamento e seu cargo.',
          ),
        ),
      );
  }

  updateMemberDepartment(
    memberId: string,
    memberDepartmentId: string,
    payload: UpdateMemberDepartmentRequest,
  ): Observable<void> {
    return this.http
      .put<ApiResponse<unknown>>(
        `${this.endpoint}/${encodeURIComponent(memberId)}/departments/${encodeURIComponent(memberDepartmentId)}`,
        payload,
      )
      .pipe(
        map((response) =>
          this.completeOperation(response, 'Não foi possível atualizar o departamento.'),
        ),
      );
  }

  deleteMemberDepartment(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(
        `${environment.apiBaseUrl}/MemberDepartment/${encodeURIComponent(id)}`,
      )
      .pipe(
        map((response) =>
          this.completeOperation(response, 'NÃ£o foi possÃ­vel remover o departamento.'),
        ),
      );
  }

  private getActiveLookup<TId extends string | number>(
    endpoint: string,
  ): Observable<readonly LookupItem<TId>[]> {
    return this.http
      .get<ApiResponse<readonly LookupItem<TId>[]>>(`${environment.apiBaseUrl}/${endpoint}`)
      .pipe(map((response) => (response.data ?? []).filter((item) => item.isActive !== false)));
  }

  private completeOperation(response: ApiResponse<unknown>, fallbackMessage: string): void {
    if (!response.success) {
      throw new ApiResponseError(response.message || fallbackMessage);
    }
  }
}
