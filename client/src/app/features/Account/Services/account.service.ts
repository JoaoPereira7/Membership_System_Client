import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import { AccountProfileService } from '../../AccountProfile/Services/account-profile.service';
import {
  AccountApiDto,
  AccountListItem,
  AccountListQuery,
  AccountPagedResult,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../Models/account.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly accountProfileService = inject(AccountProfileService);
  private readonly endpoint = `${environment.apiBaseUrl}/Account`;

  getPaged(query: AccountListQuery): Observable<AccountPagedResult> {
    return forkJoin({
      accounts: this.http.get<ApiResponse<readonly AccountApiDto[]>>(this.endpoint),
      profiles: this.accountProfileService.getAll(),
    }).pipe(
      map(({ accounts, profiles }) => {
        const profileNames = new Map(profiles.map((profile) => [profile.id, profile.name]));
        const items = (accounts.data ?? []).map((item) =>
          this.toListItem(item, profileNames.get(item.accountProfileId)),
        );
        return this.paginate(items, query);
      }),
    );
  }

  getById(id: string): Observable<AccountListItem> {
    return forkJoin({
      account: this.http.get<ApiResponse<AccountApiDto>>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
      ),
      profiles: this.accountProfileService.getAll(),
    }).pipe(
      map(({ account, profiles }) => {
        const item = unwrapApiData(account, 'Usuário não encontrado.');
        return this.toListItem(
          item,
          profiles.find((profile) => profile.id === item.accountProfileId)?.name,
        );
      }),
    );
  }

  create(request: CreateAccountRequest): Observable<AccountListItem> {
    return this.http
      .post<ApiResponse<AccountApiDto>>(this.endpoint, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível cadastrar o usuário.'),
            undefined,
          ),
        ),
      );
  }

  update(id: string, request: UpdateAccountRequest): Observable<AccountListItem> {
    return this.http
      .put<ApiResponse<AccountApiDto>>(`${this.endpoint}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((response) =>
          this.toListItem(
            unwrapApiData(response, 'Não foi possível atualizar o usuário.'),
            undefined,
          ),
        ),
      );
  }

  private toListItem(item: AccountApiDto, accountProfileName?: string): AccountListItem {
    return {
      id: item.id,
      name: item.name,
      email: item.email,
      cpf: item.cpf,
      accountProfileId: item.accountProfileId,
      churchId: item.churchId ?? null,
      churchName: item.churchName ?? 'Todas as igrejas',
      accountProfileName: accountProfileName ?? 'Perfil não encontrado',
      isActive: item.isActive ?? true,
    };
  }

  private paginate(items: readonly AccountListItem[], query: AccountListQuery): AccountPagedResult {
    const search = query.search.trim().toLocaleLowerCase('pt-BR');
    const filtered = search
      ? items.filter((item) =>
          [item.name, item.email, item.cpf, item.accountProfileName].some((value) =>
            value.toLocaleLowerCase('pt-BR').includes(search),
          ),
        )
      : [...items];

    const sorted =
      query.sortActive && query.sortDirection
        ? [...filtered].sort((first, second) => {
            const key = query.sortActive as keyof AccountListItem;
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
