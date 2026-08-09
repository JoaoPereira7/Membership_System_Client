import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../api/api.models';
import { AuthSession, LoginRequest, LoginResponse } from './auth.models';

const SESSION_KEY = 'membership_ieq_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly endpoint = `${environment.apiBaseUrl}/Auth/login`;

  login(request: LoginRequest, rememberMe = false): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(this.endpoint, request).pipe(
      map((response) => unwrapApiData(response, 'Não foi possível realizar o login.')),
      tap((response) => this.saveSession(response, rememberMe)),
    );
  }

  getSession(): AuthSession | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const serialized = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!serialized) return null;

    try {
      const session = JSON.parse(serialized) as AuthSession;
      if (!session.accessToken || session.expiresAt <= Date.now()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  private saveSession(response: LoginResponse, rememberMe: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const session: AuthSession = {
      ...response,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
    this.clearSession();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}
