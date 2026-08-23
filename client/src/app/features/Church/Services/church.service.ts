import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  ChurchApiDto,
  ChurchListItem,
  ChurchListQuery,
  ChurchPagedResult,
  CreateChurchRequest,
  UpdateChurchRequest,
} from '../Models/church.models';

@Injectable({ providedIn: 'root' })
export class ChurchService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Church`;

  getAll(): Observable<readonly ChurchListItem[]> {
    return this.http.get<ApiResponse<readonly ChurchApiDto[]>>(this.endpoint).pipe(
      map((response) => {
        const items = response.data ?? [];
        const names = new Map(items.map((item) => [item.id, item.name]));
        return items.map((item) => this.toListItem(item, names.get(item.parentChurchId ?? '')));
      }),
    );
  }

  getPaged(query: ChurchListQuery): Observable<ChurchPagedResult> {
    return this.getAll().pipe(map((items) => this.paginate(items, query)));
  }

  getById(id: string): Observable<ChurchListItem> {
    return this.http
      .get<ApiResponse<ChurchApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Igreja não encontrada.'), undefined),
        ),
      );
  }

  create(request: CreateChurchRequest): Observable<ChurchListItem> {
    return this.http
      .post<ApiResponse<ChurchApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar a igreja.')),
        ),
      );
  }

  update(id: string, request: UpdateChurchRequest): Observable<ChurchListItem> {
    return this.http
      .put<ApiResponse<ChurchApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Não foi possível atualizar a igreja.')),
        ),
      );
  }

  private toListItem(item: ChurchApiDto, parentChurchName?: string): ChurchListItem {
    return {
      id: item.id,
      name: item.name,
      parentChurchId: item.parentChurchId ?? null,
      parentChurchName: parentChurchName ?? item.parentChurchName ?? '',
      churchesCategoryId: item.churchesCategoryId ?? null,
      churchesCategoryName: item.churchesCategoryName ?? '',
      churchesRegionId: item.churchesRegionId ?? null,
      churchesRegionName: item.churchesRegionName ?? '',
      isActive: item.isActive ?? true,
    };
  }

  private paginate(items: readonly ChurchListItem[], query: ChurchListQuery): ChurchPagedResult {
    const search = query.search.trim().toLocaleLowerCase('pt-BR');
    const filtered = search
      ? items.filter((item) =>
          [
            item.name,
            item.parentChurchName,
            item.churchesCategoryName,
            item.churchesRegionName,
          ].some((value) => value.toLocaleLowerCase('pt-BR').includes(search)),
        )
      : [...items];
    const sorted =
      query.sortActive && query.sortDirection
        ? [...filtered].sort((first, second) => {
            const key = query.sortActive as keyof ChurchListItem;
            const comparison = String(first[key]).localeCompare(String(second[key]), 'pt-BR', {
              numeric: true,
              sensitivity: 'base',
            });
            return query.sortDirection === 'asc' ? comparison : -comparison;
          })
        : filtered;
    const start = query.pageIndex * query.pageSize;

    return {
      items: sorted.slice(start, start + query.pageSize),
      totalItems: sorted.length,
    };
  }
}
