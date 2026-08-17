import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiData } from '../api/api.models';
import { AuthSession, LoginRequest, LoginResponse } from './auth.models';

const REMEMBER_KEY = 'membership_ieq_remember';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly endpoint = `${environment.apiBaseUrl}/Auth`;
  private readonly sessionState = signal<AuthSession | null>(null);
  private refreshInFlight: Observable<LoginResponse> | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly permissionSet = computed(
    () => new Set(this.sessionState()?.permissions ?? []),
  );

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.endpoint}/login`, request, {
        withCredentials: true,
      })
      .pipe(
        map((response) => unwrapApiData(response, 'Não foi possível realizar o login.')),
        tap((response) => this.saveSession(response, request.rememberMe)),
      );
  }

  refreshAccessToken(): Observable<LoginResponse> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const rememberMe = this.usesPersistentStorage();
    this.refreshInFlight = this.http
      .post<ApiResponse<LoginResponse>>(
        `${this.endpoint}/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        map((response) => unwrapApiData(response, 'Sua sessão expirou.')),
        tap((response) => this.saveSession(response, rememberMe)),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshInFlight;
  }

  ensureAuthenticated(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) return of(false);
    if (this.hasValidAccessToken()) return of(true);

    return this.refreshAccessToken().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  logout(): Observable<void> {
    return this.http
      .post(`${this.endpoint}/logout`, {}, { withCredentials: true })
      .pipe(
        map(() => undefined),
        catchError((error: unknown) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => this.clearSession()),
      );
  }

  getSession(): AuthSession | null {
    return this.sessionState();
  }

  getAccessToken(): string | null {
    const session = this.sessionState();
    return session && session.expiresAt > Date.now() ? session.accessToken : null;
  }

  hasValidAccessToken(): boolean {
    return this.getAccessToken() !== null;
  }

  hasPermission(permission: string): boolean {
    return this.permissionSet().has(permission);
  }

  clearSession(): void {
    this.sessionState.set(null);
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(REMEMBER_KEY);
  }

  private saveSession(response: LoginResponse, rememberMe: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const session: AuthSession = {
      ...response,
      permissions: [...response.permissions],
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
    if (rememberMe) localStorage.setItem(REMEMBER_KEY, '1');
    else localStorage.removeItem(REMEMBER_KEY);
    this.sessionState.set(session);
  }

  private usesPersistentStorage(): boolean {
    return isPlatformBrowser(this.platformId) && localStorage.getItem(REMEMBER_KEY) !== null;
  }
}
