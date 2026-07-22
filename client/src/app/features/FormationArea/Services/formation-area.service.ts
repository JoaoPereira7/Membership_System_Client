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
  CreateFormationAreaRequest,
  FormationAreaApiDto,
  FormationAreaListItem,
  UpdateFormationAreaRequest,
} from '../Models/formation-area.models';

@Injectable({ providedIn: 'root' })
export class FormationAreaService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/FormationArea`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<FormationAreaListItem>> {
    return this.http.get<ApiResponse<readonly FormationAreaApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: string): Observable<FormationAreaListItem> {
    return this.http
      .get<ApiResponse<FormationAreaApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Área de formação não encontrada.')),
        ),
      );
  }

  create(request: CreateFormationAreaRequest): Observable<FormationAreaListItem> {
    return this.http
      .post<ApiResponse<FormationAreaApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar a área de formação.'),
          ),
        ),
      );
  }

  update(id: string, request: UpdateFormationAreaRequest): Observable<FormationAreaListItem> {
    return this.http
      .put<ApiResponse<FormationAreaApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar a área de formação.'),
          ),
        ),
      );
  }

  private toListItem(item: FormationAreaApiDto): FormationAreaListItem {
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
