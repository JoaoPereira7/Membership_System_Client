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
  CreateMembershipStatusRequest,
  MembershipStatusApiDto,
  MembershipStatusListItem,
  UpdateMembershipStatusRequest,
} from '../Models/membership-status.models';

@Injectable({ providedIn: 'root' })
export class MembershipStatusService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/MembershipStatus`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<MembershipStatusListItem>> {
    return this.http.get<ApiResponse<readonly MembershipStatusApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: string): Observable<MembershipStatusListItem> {
    return this.http
      .get<ApiResponse<MembershipStatusApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Situação da membresia não encontrada.')),
        ),
      );
  }

  create(request: CreateMembershipStatusRequest): Observable<MembershipStatusListItem> {
    return this.http
      .post<ApiResponse<MembershipStatusApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar a situação da membresia.'),
          ),
        ),
      );
  }

  update(id: string, request: UpdateMembershipStatusRequest): Observable<MembershipStatusListItem> {
    return this.http
      .put<ApiResponse<MembershipStatusApiDto>>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
        request,
      )
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar a situação da membresia.'),
          ),
        ),
      );
  }

  private toListItem(item: MembershipStatusApiDto): MembershipStatusListItem {
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
