export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresAt: string;
}

export interface AuthUser {
  username: string;
  displayName?: string;
  token: string;
  tokenType: string;
  expiresAt: string;
}
