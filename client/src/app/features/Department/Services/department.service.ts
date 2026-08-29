import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  AuxiliaryListQuery,
  PagedResult,
  paginateAuxiliaryItems,
} from '../../../core/models/auxiliary-data.models';
import {
  CreateDepartmentRequest,
  DepartmentApiDto,
  DepartmentListItem,
  UpdateDepartmentRequest,
} from '../Models/department.models';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Departments`;

  getAll(): Observable<readonly DepartmentListItem[]> {
    return this.http
      .get<ApiResponse<readonly DepartmentApiDto[]>>(this.endpoint)
      .pipe(map((response) => (response.data ?? []).map((item) => this.toListItem(item))));
  }

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<DepartmentListItem>> {
    return this.getAll().pipe(map((items) => paginateAuxiliaryItems(items, query)));
  }

  getById(id: number): Observable<DepartmentListItem> {
    return this.http
      .get<ApiResponse<DepartmentApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) => this.toListItem(unwrapApiData(response, 'Departamento não encontrado.'))),
      );
  }

  create(request: CreateDepartmentRequest): Observable<DepartmentListItem> {
    return this.http
      .post<ApiResponse<DepartmentApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar o departamento.')),
        ),
      );
  }

  update(id: number, request: UpdateDepartmentRequest): Observable<DepartmentListItem> {
    return this.http
      .put<ApiResponse<DepartmentApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível atualizar o departamento.')),
        ),
      );
  }

  private toListItem(item: DepartmentApiDto): DepartmentListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
