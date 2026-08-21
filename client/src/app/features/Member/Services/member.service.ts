import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, ApiResponseError, unwrapApiData } from '../../../core/api/api.models';
import {
  ChurchDepartmentLookup, CompleteMember, CreateMemberDepartmentRequest,
  CreateMembershipRoleRequest, FullMember, LookupItem,
  MemberListItem, MemberListQuery, MemberPagedResult,
} from '../Models/member.models';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Member`;

  getPaged(query: MemberListQuery): Observable<MemberPagedResult> {
    return this.http.get<ApiResponse<readonly MemberListItem[]>>(`${this.endpoint}/complete`).pipe(
      map((response) => {
        const term = query.search.trim().toLocaleLowerCase('pt-BR');
        const filtered = (response.data ?? []).filter((item) =>
          !term || [item.name, item.cpf, item.churchName, item.departmentNames, item.membershipStatusName]
            .some((value) => value.toLocaleLowerCase('pt-BR').includes(term)));
        const sorted = !query.sortActive || !query.sortDirection ? filtered : [...filtered].sort((a, b) => {
          const key = query.sortActive as keyof MemberListItem;
          const result = String(a[key]).localeCompare(String(b[key]), 'pt-BR', { numeric: true });
          return query.sortDirection === 'asc' ? result : -result;
        });
        const start = query.pageIndex * query.pageSize;
        return { items: sorted.slice(start, start + query.pageSize), totalItems: sorted.length };
      }),
    );
  }
  getById(id: string): Observable<CompleteMember> {
    return this.http.get<ApiResponse<CompleteMember>>(`${this.endpoint}/${id}/complete`)
      .pipe(map((response) => unwrapApiData(response, 'Membro não encontrado.')));
  }
  getFullById(id: string): Observable<FullMember> {
    return this.http.get<ApiResponse<FullMember>>(
      `${this.endpoint}/${encodeURIComponent(id)}/full`,
    ).pipe(map((response) => unwrapApiData(response, 'Membro não encontrado.')));
  }
  create(payload: CompleteMember): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.endpoint}/complete`, payload);
  }
  update(id: string, payload: CompleteMember): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(`${this.endpoint}/${id}/complete`, payload);
  }
  getLookups(): Observable<Record<string, readonly LookupItem[]>> {
    const endpoints = {
      genders: 'Gender', maritalStatuses: 'MaritalStatus', phoneTypes: 'PhoneType',
      addressTypes: 'AddressType', educationLevels: 'EducationLevel',
      formationAreas: 'FormationArea', professions: 'Profession', churches: 'Church',
      membershipStatuses: 'MembershipStatus', religiousOrigins: 'ReligiousOrigin',
      churchRoles: 'ChurchRole', leaderTypes: 'LeaderType', pastors: 'Member/pastors',
    };
    const requests: Record<string, Observable<readonly LookupItem[]>> = {};
    Object.entries(endpoints).forEach(([key, endpoint]) => {
      requests[key] = this.http.get<ApiResponse<readonly LookupItem[]>>(
        `${environment.apiBaseUrl}/${endpoint}`,
      ).pipe(map((response) => (response.data ?? []).filter((item) => item.isActive !== false)));
    });
    return forkJoin(requests);
  }
  getChurchDepartments(): Observable<readonly ChurchDepartmentLookup[]> {
    return this.http.get<ApiResponse<readonly ChurchDepartmentLookup[]>>(
      `${environment.apiBaseUrl}/ChurchDepartment`,
    ).pipe(map((response) => (response.data ?? []).filter((item) => item.isActive)));
  }

  getChurchRoles(): Observable<readonly LookupItem[]> {
    return this.getActiveLookup('ChurchRole');
  }

  getLeaderTypes(): Observable<readonly LookupItem[]> {
    return this.getActiveLookup('LeaderType');
  }

  createMembershipRole(memberId: string, payload: CreateMembershipRoleRequest): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(
        `${this.endpoint}/${encodeURIComponent(memberId)}/church-roles`,
        payload,
      )
      .pipe(map((response) => this.completeOperation(response, 'NÃ£o foi possÃ­vel adicionar o cargo.')));
  }

  deleteMembershipRole(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(
        `${environment.apiBaseUrl}/MembershipRole/${encodeURIComponent(id)}`,
      )
      .pipe(map((response) => this.completeOperation(response, 'NÃ£o foi possÃ­vel remover o cargo.')));
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

  private getActiveLookup(endpoint: string): Observable<readonly LookupItem[]> {
    return this.http
      .get<ApiResponse<readonly LookupItem[]>>(`${environment.apiBaseUrl}/${endpoint}`)
      .pipe(map((response) => (response.data ?? []).filter((item) => item.isActive !== false)));
  }

  private completeOperation(response: ApiResponse<unknown>, fallbackMessage: string): void {
    if (!response.success) {
      throw new ApiResponseError(response.message || fallbackMessage);
    }
  }

}
