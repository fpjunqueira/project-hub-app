import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { AuthUser, LoginCredentials } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'project-hub-user';
  private readonly mockUsername = 'adm';
  private readonly mockPassword = 'adm';

  login(credentials: LoginCredentials): Observable<AuthUser> {
    const normalizedUsername = credentials.username.trim();
    const normalizedPassword = credentials.password.trim();

    if (
      normalizedUsername !== this.mockUsername ||
      normalizedPassword !== this.mockPassword
    ) {
      return throwError(() => new Error('Invalid credentials.'));
    }

    const user: AuthUser = {
      username: normalizedUsername,
      displayName: 'Administrator'
    };

    this.persistUser(user);
    return of(user);
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getCurrentUser(): AuthUser | null {
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

  private persistUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }
}
