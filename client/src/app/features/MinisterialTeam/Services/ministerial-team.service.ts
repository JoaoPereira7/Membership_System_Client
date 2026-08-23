import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  MinisterialTeamListQuery,
  MinisterialTeamPagedResult,
} from '../Models/ministerial-team.models';

@Injectable({ providedIn: 'root' })
export class MinisterialTeamService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/Member/ministerial-team`;

  getPaged(query: MinisterialTeamListQuery): Observable<MinisterialTeamPagedResult> {
    const params = new HttpParams()
      .set('search', query.search)
      .set('page', query.pageIndex + 1)
      .set('pageSize', query.pageSize)
      .set('sortActive', query.sortActive ?? 'memberName')
      .set('sortDirection', query.sortDirection || 'asc');

    return this.http
      .get<ApiResponse<MinisterialTeamPagedResult>>(this.endpoint, { params })
      .pipe(
        map((response) =>
          unwrapApiData(response, 'Não foi possível carregar a equipe ministerial.'),
        ),
      );
  }
}
