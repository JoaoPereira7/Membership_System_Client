import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../../../core/api/api.models';
import {
  DashboardChurchTotal,
  DashboardNamedTotal,
  DashboardTotal,
} from '../Models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/dashboard`;

  getTotalMembers(): Observable<DashboardTotal> {
    return this.get('total-members');
  }

  getActiveMembers(): Observable<DashboardTotal> {
    return this.get('active-members');
  }

  getInactiveMembers(): Observable<DashboardTotal> {
    return this.get('inactive-members');
  }

  getMembersByStatus(): Observable<readonly DashboardNamedTotal[]> {
    return this.get('members-by-status');
  }

  getMembersByDepartment(): Observable<readonly DashboardNamedTotal[]> {
    return this.get('members-by-department');
  }

  getMembersWithoutDepartment(): Observable<DashboardTotal> {
    return this.get('members-without-department');
  }

  getMembersByRole(): Observable<readonly DashboardNamedTotal[]> {
    return this.get('members-by-role');
  }

  getMembersWithoutRole(): Observable<DashboardTotal> {
    return this.get('members-without-role');
  }

  getLeaders(): Observable<DashboardTotal> {
    return this.get('leaders');
  }

  getLeadersByDepartment(): Observable<readonly DashboardNamedTotal[]> {
    return this.get('leaders-by-department');
  }

  getDepartmentsCount(): Observable<DashboardTotal> {
    return this.get('departments-count');
  }

  getMembersByChurch(): Observable<readonly DashboardChurchTotal[]> {
    return this.get('members-by-church');
  }

  private get<T>(path: string): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.endpoint}/${path}`)
      .pipe(map((response) => unwrapApiData(response, 'Não foi possível carregar o indicador.')));
  }
}
