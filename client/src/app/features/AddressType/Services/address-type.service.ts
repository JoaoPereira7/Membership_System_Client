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
  AddressTypeApiDto,
  AddressTypeListItem,
  CreateAddressTypeRequest,
  UpdateAddressTypeRequest,
} from '../Models/address-type.models';

@Injectable({ providedIn: 'root' })
export class AddressTypeService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/AddressType`;

  getPaged(query: AuxiliaryListQuery): Observable<PagedResult<AddressTypeListItem>> {
    return this.http.get<ApiResponse<readonly AddressTypeApiDto[]>>(this.endpoint).pipe(
      map((response) =>
        paginateAuxiliaryItems(
          (response.data ?? []).map((item) => this.toListItem(item)),
          query,
        ),
      ),
    );
  }

  getById(id: number): Observable<AddressTypeListItem> {
    return this.http
      .get<ApiResponse<AddressTypeApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Tipo de endereço não encontrado.')),
        ),
      );
  }

  create(request: CreateAddressTypeRequest): Observable<AddressTypeListItem> {
    return this.http
      .post<ApiResponse<AddressTypeApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar o tipo de endereço.'),
          ),
        ),
      );
  }

  update(id: number, request: UpdateAddressTypeRequest): Observable<AddressTypeListItem> {
    return this.http
      .put<ApiResponse<AddressTypeApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar o tipo de endereço.'),
          ),
        ),
      );
  }

  private toListItem(item: AddressTypeApiDto): AddressTypeListItem {
    return {
      id: item.id,
      name: item.name,
      isActive: item.isActive ?? true,
      createdDate: item.createdDate ?? '',
      updateDate: item.updateDate ?? '',
    };
  }
}
