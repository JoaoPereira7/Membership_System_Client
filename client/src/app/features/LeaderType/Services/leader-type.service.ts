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
  CreateLeaderTypeRequest,
  LeaderTypeApiDto,
  LeaderTypeListItem,
  UpdateLeaderTypeRequest,
} from '../Models/leader-type.models';

@Injectable({ providedIn: 'root' })
export class LeaderTypeService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/LeaderType`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<LeaderTypeListItem>> {
    return this.http.get<ApiResponse<readonly LeaderTypeApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: string): Observable<LeaderTypeListItem> {
    return this.http
      .get<ApiResponse<LeaderTypeApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Tipo de liderança não encontrado.')),
        ),
      );
  }

  create(request: CreateLeaderTypeRequest): Observable<LeaderTypeListItem> {
    return this.http
      .post<ApiResponse<LeaderTypeApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar o tipo de liderança.'),
          ),
        ),
      );
  }

  update(id: string, request: UpdateLeaderTypeRequest): Observable<LeaderTypeListItem> {
    return this.http
      .put<ApiResponse<LeaderTypeApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar o tipo de liderança.'),
          ),
        ),
      );
  }

  private toListItem(item: LeaderTypeApiDto): LeaderTypeListItem {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
