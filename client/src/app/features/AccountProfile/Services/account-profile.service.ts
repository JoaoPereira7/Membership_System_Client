import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import { paginateAuxiliaryItems } from '../../../core/models/auxiliary-data.models';
import {
  AccountProfileApiDto,
  AccountProfileListItem,
  AccountProfileListQuery,
  AccountProfilePagedResult,
  CreateAccountProfileRequest,
  UpdateAccountProfileRequest,
  PermissionApiDto,
  AccountProfilePermissionApiDto,
} from '../Models/account-profile.models';

@Injectable({ providedIn: 'root' })
export class AccountProfileService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/AccountProfile`;
  private readonly permissionEndpoint = `${environment.apiBaseUrl}/Permission`;
  private readonly profilePermissionEndpoint = `${environment.apiBaseUrl}/AccountProfilePermission`;

  getAll(activeOnly = false): Observable<readonly AccountProfileListItem[]> {
    return this.http
      .get<ApiResponse<readonly AccountProfileApiDto[]>>(this.endpoint)
      .pipe(
        map((response) =>
          (response.data ?? [])
            .map((item) => this.toListItem(item))
            .filter((item) => !activeOnly || item.isActive),
        ),
      );
  }

  getPaged(query: AccountProfileListQuery): Observable<AccountProfilePagedResult> {
    return this.getAll().pipe(map((items) => paginateAuxiliaryItems(items, query)));
  }

  getById(id: string): Observable<AccountProfileListItem> {
    return this.http
      .get<ApiResponse<AccountProfileApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((response) =>
          this.toListItem(unwrapApiData(response, 'Perfil de acesso não encontrado.')),
        ),
      );
  }

  create(request: CreateAccountProfileRequest): Observable<AccountProfileListItem> {
    return this.getAll().pipe(
      map((items) => Math.max(0, ...items.map((item) => item.code)) + 1),
      switchMap((code) =>
        this.http.post<ApiResponse<AccountProfileApiDto>>(this.endpoint, {
          code,
          ...request,
        }),
      ),
      map((response) =>
        this.toListItem(unwrapApiData(response, 'Não foi possível cadastrar o perfil de acesso.')),
      ),
    );
  }

  update(id: string, request: UpdateAccountProfileRequest): Observable<AccountProfileListItem> {
    return this.http
      .put<ApiResponse<AccountProfileApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar o perfil de acesso.'),
          ),
        ),
      );
  }

  getPermissions(): Observable<readonly PermissionApiDto[]> {
    return this.http
      .get<ApiResponse<readonly PermissionApiDto[]>>(this.permissionEndpoint)
      .pipe(
        map((response) =>
          (response.data ?? []).filter(
            (permission) =>
              permission.isActive && permission.normalizedName.toUpperCase().endsWith('_VIEW'),
          ),
        ),
      );
  }

  getProfilePermissionIds(accountProfileId: string): Observable<readonly string[]> {
    return this.http
      .get<ApiResponse<readonly AccountProfilePermissionApiDto[]>>(
        `${this.profilePermissionEndpoint}/profile/${encodeURIComponent(accountProfileId)}`,
      )
      .pipe(
        map((response) =>
          (response.data ?? []).filter((item) => item.isActive).map((item) => item.permissionId),
        ),
      );
  }

  replacePermissions(
    accountProfileId: string,
    permissionIds: readonly string[],
  ): Observable<void> {
    return this.http
      .put<ApiResponse<boolean>>(
        `${this.profilePermissionEndpoint}/profile/${encodeURIComponent(accountProfileId)}`,
        { permissionIds },
      )
      .pipe(
        map((response) => {
          unwrapApiData(response, 'Não foi possível atualizar as permissões do perfil.');
        }),
      );
  }

  private toListItem(item: AccountProfileApiDto): AccountProfileListItem {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description ?? '',
      isActive: item.isActive ?? true,
      createdDate: '',
      updateDate: '',
    };
  }
}
