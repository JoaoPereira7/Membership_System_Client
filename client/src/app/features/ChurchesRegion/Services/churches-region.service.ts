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
  ChurchesRegionApiDto,
  ChurchesRegionListItem,
  CreateChurchesRegionRequest,
  UpdateChurchesRegionRequest,
} from '../Models/churches-region.models';

@Injectable({ providedIn: 'root' })
export class ChurchesRegionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/ChurchesRegion`;

  getAll(): Observable<readonly ChurchesRegionListItem[]> {
    return this.http
      .get<ApiResponse<readonly ChurchesRegionApiDto[]>>(this.endpoint)
      .pipe(map((response) => (response.data ?? []).map((item) => this.toListItem(item))));
  }

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<ChurchesRegionListItem>> {
    return this.getAll().pipe(map((items) => paginateAuxiliaryItems(items, query)));
  }

  getById(id: number): Observable<ChurchesRegionListItem> {
    return this.http
      .get<ApiResponse<ChurchesRegionApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Região de igreja não encontrada.')),
        ),
      );
  }

  create(request: CreateChurchesRegionRequest): Observable<ChurchesRegionListItem> {
    return this.http
      .post<ApiResponse<ChurchesRegionApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar a região de igreja.'),
          ),
        ),
      );
  }

  update(id: number, request: UpdateChurchesRegionRequest): Observable<ChurchesRegionListItem> {
    return this.http
      .put<ApiResponse<ChurchesRegionApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar a região de igreja.'),
          ),
        ),
      );
  }

  private toListItem(item: ChurchesRegionApiDto): ChurchesRegionListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
