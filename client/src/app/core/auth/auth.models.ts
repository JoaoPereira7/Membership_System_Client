export interface LoginRequest {
  readonly email: string;
  readonly password: string;
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
}

export interface AuthSession extends LoginResponse {
  readonly expiresAt: number;
}
