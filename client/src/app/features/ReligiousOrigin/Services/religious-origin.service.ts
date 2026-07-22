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
  CreateReligiousOriginRequest,
  ReligiousOriginApiDto,
  ReligiousOriginListItem,
  UpdateReligiousOriginRequest,
} from '../Models/religious-origin.models';

@Injectable({ providedIn: 'root' })
export class ReligiousOriginService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/ReligiousOrigin`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<ReligiousOriginListItem>> {
    return this.http.get<ApiResponse<readonly ReligiousOriginApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: string): Observable<ReligiousOriginListItem> {
    return this.http
      .get<ApiResponse<ReligiousOriginApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Origem religiosa não encontrada.')),
        ),
      );
  }

  create(request: CreateReligiousOriginRequest): Observable<ReligiousOriginListItem> {
    return this.http
      .post<ApiResponse<ReligiousOriginApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar a origem religiosa.'),
          ),
        ),
      );
  }

  update(id: string, request: UpdateReligiousOriginRequest): Observable<ReligiousOriginListItem> {
    return this.http
      .put<ApiResponse<ReligiousOriginApiDto>>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
        request,
      )
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar a origem religiosa.'),
          ),
        ),
      );
  }

  private toListItem(item: ReligiousOriginApiDto): ReligiousOriginListItem {
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
