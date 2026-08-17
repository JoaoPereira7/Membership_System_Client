export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly accountProfileId: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly user: AuthenticatedUser;
  readonly permissions: readonly string[];
}

export interface AuthSession extends LoginResponse {
  readonly expiresAt: number;
}
