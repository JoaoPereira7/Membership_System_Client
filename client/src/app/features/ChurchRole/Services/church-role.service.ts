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
  ChurchRoleApiDto,
  ChurchRoleListItem,
  CreateChurchRoleRequest,
  UpdateChurchRoleRequest,
} from '../Models/church-role.models';

@Injectable({ providedIn: 'root' })
export class ChurchRoleService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/ChurchRole`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<ChurchRoleListItem>> {
    return this.http.get<ApiResponse<readonly ChurchRoleApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: number): Observable<ChurchRoleListItem> {
    return this.http
      .get<ApiResponse<ChurchRoleApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Cargo eclesiástico não encontrado.')),
        ),
      );
  }

  create(request: CreateChurchRoleRequest): Observable<ChurchRoleListItem> {
    return this.http
      .post<ApiResponse<ChurchRoleApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar o cargo eclesiástico.'),
          ),
        ),
      );
  }

  update(id: number, request: UpdateChurchRoleRequest): Observable<ChurchRoleListItem> {
    return this.http
      .put<ApiResponse<ChurchRoleApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar o cargo eclesiástico.'),
          ),
        ),
      );
  }

  private toListItem(item: ChurchRoleApiDto): ChurchRoleListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
