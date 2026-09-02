import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  CreateVisitorRequest,
  UpdateVisitorRequest,
  VisitorListItem,
  VisitorListQuery,
  VisitorPagedResult,
} from '../Models/visitor.models';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/visitors`;

  getPaged(query: VisitorListQuery): Observable<VisitorPagedResult> {
    const params = new HttpParams()
      .set('search', query.search)
      .set('page', query.pageIndex + 1)
      .set('pageSize', query.pageSize)
      .set('sortActive', query.sortActive ?? 'name')
      .set('sortDirection', query.sortDirection || 'asc');

    return this.http
      .get<ApiResponse<VisitorPagedResult>>(this.endpoint, { params })
      .pipe(
        map((response) =>
          unwrapApiData(response, 'Não foi possível carregar os visitantes.'),
        ),
      );
  }

  getById(id: string): Observable<VisitorListItem> {
    return this.http
      .get<ApiResponse<VisitorListItem>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(map((response) => unwrapApiData(response, 'Visitante não encontrado.')));
  }

  create(request: CreateVisitorRequest): Observable<VisitorListItem> {
    return this.http
      .post<ApiResponse<VisitorListItem>>(this.endpoint, request)
      .pipe(
        map((response) =>
          unwrapApiData(response, 'Não foi possível cadastrar o visitante.'),
        ),
      );
  }

  update(id: string, request: UpdateVisitorRequest): Observable<VisitorListItem> {
    return this.http
      .put<ApiResponse<VisitorListItem>>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
        request,
      )
      .pipe(
        map((response) =>
          unwrapApiData(response, 'Não foi possível atualizar o visitante.'),
        ),
      );
  }
}
