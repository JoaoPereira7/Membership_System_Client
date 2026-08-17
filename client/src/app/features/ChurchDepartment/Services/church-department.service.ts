import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  ChurchDepartmentApiDto,
  ChurchDepartmentListItem,
  ChurchDepartmentListQuery,
  ChurchDepartmentPagedResult,
  CreateChurchDepartmentRequest,
  UpdateChurchDepartmentRequest,
} from '../Models/church-department.models';

@Injectable({ providedIn: 'root' })
export class ChurchDepartmentService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/ChurchDepartment`;

  getAll(): Observable<readonly ChurchDepartmentListItem[]> {
    return this.http
      .get<ApiResponse<readonly ChurchDepartmentApiDto[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  getPaged(query: ChurchDepartmentListQuery): Observable<ChurchDepartmentPagedResult> {
    return this.getAll().pipe(map((items) => this.paginate(items, query)));
  }

  getById(id: string): Observable<ChurchDepartmentListItem> {
    return this.http
      .get<ApiResponse<ChurchDepartmentApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          unwrapApiData(response, 'Vínculo entre igreja e departamento não encontrado.'),
        ),
      );
  }

  create(request: CreateChurchDepartmentRequest): Observable<ChurchDepartmentListItem> {
    return this.http
      .post<ApiResponse<ChurchDepartmentApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          unwrapApiData(response, 'Não foi possível vincular o departamento à igreja.'),
        ),
      );
  }

  update(id: string, request: UpdateChurchDepartmentRequest): Observable<ChurchDepartmentListItem> {
    return this.http
      .put<ApiResponse<ChurchDepartmentApiDto>>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
        request,
      )
      .pipe(
        map((response) =>
          unwrapApiData(
            response,
            'Não foi possível atualizar o vínculo entre igreja e departamento.',
          ),
        ),
      );
  }

  private paginate(
    items: readonly ChurchDepartmentListItem[],
    query: ChurchDepartmentListQuery,
  ): ChurchDepartmentPagedResult {
    const search = query.search.trim().toLocaleLowerCase('pt-BR');
    const filtered = search
      ? items.filter((item) =>
          [item.churchName, item.departmentName].some((value) =>
            value.toLocaleLowerCase('pt-BR').includes(search),
          ),
        )
      : [...items];
    const sorted =
      query.sortActive && query.sortDirection
        ? [...filtered].sort((first, second) => {
            const key = query.sortActive as keyof ChurchDepartmentListItem;
            const comparison = String(first[key]).localeCompare(String(second[key]), 'pt-BR', {
              numeric: true,
              sensitivity: 'base',
            });
            return query.sortDirection === 'asc' ? comparison : -comparison;
          })
        : filtered;
    const start = query.pageIndex * query.pageSize;

    return {
      items: sorted.slice(start, start + query.pageSize),
      totalItems: sorted.length,
    };
  }
}
