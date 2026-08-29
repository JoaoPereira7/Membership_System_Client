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
  CreateEducationLevelRequest,
  EducationLevelApiDto,
  EducationLevelListItem,
  UpdateEducationLevelRequest,
} from '../Models/education-level.models';

@Injectable({ providedIn: 'root' })
export class EducationLevelService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/EducationLevel`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<EducationLevelListItem>> {
    return this.http.get<ApiResponse<readonly EducationLevelApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: number): Observable<EducationLevelListItem> {
    return this.http
      .get<ApiResponse<EducationLevelApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) => this.toListItem(unwrapApiData(response, 'Escolaridade não encontrada.'))),
      );
  }

  create(request: CreateEducationLevelRequest): Observable<EducationLevelListItem> {
    return this.http
      .post<ApiResponse<EducationLevelApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar a escolaridade.')),
        ),
      );
  }

  update(id: number, request: UpdateEducationLevelRequest): Observable<EducationLevelListItem> {
    return this.http
      .put<ApiResponse<EducationLevelApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível atualizar a escolaridade.')),
        ),
      );
  }

  private toListItem(item: EducationLevelApiDto): EducationLevelListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
