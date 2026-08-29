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
  CreateProfessionRequest,
  ProfessionApiDto,
  ProfessionListItem,
  UpdateProfessionRequest,
} from '../Models/profession.models';

@Injectable({ providedIn: 'root' })
export class ProfessionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Profession`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<ProfessionListItem>> {
    return this.http.get<ApiResponse<readonly ProfessionApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: number): Observable<ProfessionListItem> {
    return this.http
      .get<ApiResponse<ProfessionApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) => this.toListItem(unwrapApiData(response, 'Profissão não encontrada.'))),
      );
  }

  create(request: CreateProfessionRequest): Observable<ProfessionListItem> {
    return this.http
      .post<ApiResponse<ProfessionApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar a profissão.')),
        ),
      );
  }

  update(id: number, request: UpdateProfessionRequest): Observable<ProfessionListItem> {
    return this.http
      .put<ApiResponse<ProfessionApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível atualizar a profissão.')),
        ),
      );
  }

  private toListItem(item: ProfessionApiDto): ProfessionListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
