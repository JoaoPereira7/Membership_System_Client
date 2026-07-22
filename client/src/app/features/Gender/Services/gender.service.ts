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
  CreateGenderRequest,
  GenderApiDto,
  GenderListItem,
  UpdateGenderRequest,
} from '../Models/gender.models';

@Injectable({ providedIn: 'root' })
export class GenderService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Gender`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<GenderListItem>> {
    console.log('GenderService.getPaged called with query:', this.endpoint, query); // Debugging log
    return this.http.get<ApiResponse<readonly GenderApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: string): Observable<GenderListItem> {
    return this.http
      .get<ApiResponse<GenderApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(map((response) => this.toListItem(unwrapApiData(response, 'Gênero não encontrado.'))));
  }

  create(request: CreateGenderRequest): Observable<GenderListItem> {
    return this.http
      .post<ApiResponse<GenderApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar o gênero.')),
        ),
      );
  }

  update(id: string, request: UpdateGenderRequest): Observable<GenderListItem> {
    return this.http
      .put<ApiResponse<GenderApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível atualizar o gênero.')),
        ),
      );
  }

  private toListItem(item: GenderApiDto): GenderListItem {
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
