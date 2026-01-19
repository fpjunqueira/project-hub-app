import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthResponse, AuthUser, LoginCredentials } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'project-hub-auth';
  private readonly tokenTypeFallback = 'Bearer';
  private http = inject(HttpClient);

  login(credentials: LoginCredentials): Observable<AuthUser> {
    const normalizedUsername = credentials.username.trim();
    const normalizedPassword = credentials.password.trim();
    return this.http
      .post<AuthResponse>('/api/auth/login', {
        username: normalizedUsername,
        password: normalizedPassword
      })
      .pipe(
        map((response) => {
          const user: AuthUser = {
            username: normalizedUsername,
            displayName: normalizedUsername,
            token: response.token,
            tokenType: response.tokenType || this.tokenTypeFallback,
            expiresAt: response.expiresAt
          };
          this.persistUser(user);
          return user;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getCurrentUser(): AuthUser | null {
    const user = this.getStoredUser();
    if (!user) {
      return null;
    }

    if (this.isExpired(user)) {
      this.logout();
      return null;
    }

    return user;
  }

  getAuthorizationHeader(): string | null {
    const user = this.getCurrentUser();
    if (!user?.token) {
      return null;
    }

    const tokenType = user.tokenType?.trim() || this.tokenTypeFallback;
    return `${tokenType} ${user.token}`;
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private isExpired(user: AuthUser): boolean {
    if (!user.expiresAt) {
      return false;
    }

    const expiresAt = new Date(user.expiresAt).getTime();
    if (Number.isNaN(expiresAt)) {
      return false;
    }

    return Date.now() >= expiresAt;
  }
}
