import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  ChurchDepartmentLookup, CompleteMember, LookupItem, MemberListItem,
  MemberListQuery, MemberPagedResult,
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
      churchRoles: 'ChurchRole', leaderTypes: 'LeaderType', pastors: 'Member',
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
}
