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
  ChurchesCategoryApiDto,
  ChurchesCategoryListItem,
  CreateChurchesCategoryRequest,
  UpdateChurchesCategoryRequest,
} from '../Models/churches-category.models';

@Injectable({ providedIn: 'root' })
export class ChurchesCategoryService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/ChurchesCategory`;

  getAll(): Observable<readonly ChurchesCategoryListItem[]> {
    return this.http
      .get<ApiResponse<readonly ChurchesCategoryApiDto[]>>(this.endpoint)
      .pipe(map((response) => (response.data ?? []).map((item) => this.toListItem(item))));
  }

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<ChurchesCategoryListItem>> {
    return this.getAll().pipe(map((items) => paginateAuxiliaryItems(items, query)));
  }

  getById(id: string): Observable<ChurchesCategoryListItem> {
    return this.http
      .get<ApiResponse<ChurchesCategoryApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Categoria de igreja não encontrada.')),
        ),
      );
  }

  create(request: CreateChurchesCategoryRequest): Observable<ChurchesCategoryListItem> {
    return this.http
      .post<ApiResponse<ChurchesCategoryApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar a categoria de igreja.'),
          ),
        ),
      );
  }

  update(id: string, request: UpdateChurchesCategoryRequest): Observable<ChurchesCategoryListItem> {
    return this.http
      .put<ApiResponse<ChurchesCategoryApiDto>>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
        request,
      )
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar a categoria de igreja.'),
          ),
        ),
      );
  }

  private toListItem(item: ChurchesCategoryApiDto): ChurchesCategoryListItem {
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
