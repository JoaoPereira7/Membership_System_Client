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
  CreatePhoneTypeRequest,
  PhoneTypeApiDto,
  PhoneTypeListItem,
  UpdatePhoneTypeRequest,
} from '../Models/phone-type.models';

@Injectable({ providedIn: 'root' })
export class PhoneTypeService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/PhoneType`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<PhoneTypeListItem>> {
    return this.http.get<ApiResponse<readonly PhoneTypeApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: number): Observable<PhoneTypeListItem> {
    return this.http
      .get<ApiResponse<PhoneTypeApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Tipo de telefone não encontrado.')),
        ),
      );
  }

  create(request: CreatePhoneTypeRequest): Observable<PhoneTypeListItem> {
    return this.http
      .post<ApiResponse<PhoneTypeApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar o tipo de telefone.'),
          ),
        ),
      );
  }

  update(id: number, request: UpdatePhoneTypeRequest): Observable<PhoneTypeListItem> {
    return this.http
      .put<ApiResponse<PhoneTypeApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar o tipo de telefone.'),
          ),
        ),
      );
  }

  private toListItem(item: PhoneTypeApiDto): PhoneTypeListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
