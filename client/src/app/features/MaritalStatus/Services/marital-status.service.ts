import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  AuxiliaryListQuery,
  PagedResult,
  paginateAuxiliaryItems,
} from '../../../core/models/auxiliary-data.models';
import { environment } from '../../../../environments/environment';
import {
  CreateMaritalStatusRequest,
  MaritalStatusApiDto,
  MaritalStatusListItem,
  UpdateMaritalStatusRequest,
} from '../Models/marital-status.models';

@Injectable({ providedIn: 'root' })
export class MaritalStatusService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/MaritalStatus`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<MaritalStatusListItem>> {
    return this.http.get<ApiResponse<readonly MaritalStatusApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: number): Observable<MaritalStatusListItem> {
    return this.http
      .get<ApiResponse<MaritalStatusApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) => this.toListItem(unwrapApiData(response, 'Estado civil não encontrado.'))),
      );
  }

  create(request: CreateMaritalStatusRequest): Observable<MaritalStatusListItem> {
    return this.http
      .post<ApiResponse<MaritalStatusApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar o estado civil.')),
        ),
      );
  }

  update(id: number, request: UpdateMaritalStatusRequest): Observable<MaritalStatusListItem> {
    return this.http
      .put<ApiResponse<MaritalStatusApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível atualizar o estado civil.')),
        ),
      );
  }

  private toListItem(item: MaritalStatusApiDto): MaritalStatusListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
