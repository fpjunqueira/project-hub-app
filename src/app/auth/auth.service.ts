import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

type LocalAuthSession = {
  token: string;
  tokenType: string;
  expiresAt: string;
};

type LocalAuthResponse = {
  token: string;
  tokenType: string;
  expiresAt: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly msalService = inject(MsalService);
  private initializePromise: Promise<void> | null = null;
  private readonly authEnabled = environment.auth.enabled;
  private readonly localStorageKey = 'project-hub.auth.session';

  login(): void {
    if (!this.authEnabled) {
      return;
    }

    void this.initialize().then(() => this.msalService.loginRedirect());
  }

  logout(): void {
    if (!this.authEnabled) {
      this.clearLocalSession();
      return;
    }

    void this.initialize().then(() => this.msalService.logoutRedirect());
  }

  isAuthenticated(): boolean {
    if (!this.authEnabled) {
      return this.isLocalSessionValid();
    }

    return this.msalService.instance.getAllAccounts().length > 0;
  }

  isAuthEnabled(): boolean {
    return this.authEnabled;
  }

  initialize(): Promise<void> {
    const current = this.initializePromise;
    if (current) {
      return current;
    }

    const initialized = this.authEnabled ? this.initializeAccount() : this.initializeLocal();
    this.initializePromise = initialized;
    return initialized;
  }

  getCurrentUser(): { username: string; displayName?: string | null } | null {
    if (!this.authEnabled) {
      if (!this.isLocalSessionValid()) {
        return null;
      }

      return {
        username: environment.auth.mockUser.username,
        displayName: environment.auth.mockUser.displayName ?? null
      };
    }

    const account =
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0];

    if (!account) {
      return null;
    }

    return {
      username: account.username,
      displayName: account.name ?? null
    };
  }

  getLocalAccessToken(): { token: string; tokenType: string } | null {
    if (this.authEnabled) {
      return null;
    }

    const session = this.getLocalSession();
    if (!session || !this.isLocalSessionValid(session)) {
      return null;
    }

    return {
      token: session.token,
      tokenType: session.tokenType
    };
  }

  async loginLocal(): Promise<boolean> {
    if (this.authEnabled) {
      return false;
    }

    if (this.isLocalSessionValid()) {
      return true;
    }

    const username = environment.auth.mockUser.username;
    const password = environment.auth.mockUser.password;
    if (!username || !password) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<LocalAuthResponse>('/api/auth/login', { username, password })
      );
      this.saveLocalSession(response);
      return true;
    } catch {
      this.clearLocalSession();
      return false;
    }
  }

  private async initializeAccount(): Promise<void> {
    if (!this.authEnabled) {
      return;
    }

    await this.msalService.instance.initialize();

    try {
      const result = await this.msalService.instance.handleRedirectPromise();
      if (result?.account) {
        this.msalService.instance.setActiveAccount(result.account);
        return;
      }
    } catch {
      return;
    }

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
  }

  private async initializeLocal(): Promise<void> {
    await this.loginLocal();
  }

  private getLocalSession(): LocalAuthSession | null {
    const raw = localStorage.getItem(this.localStorageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LocalAuthSession;
    } catch {
      return null;
    }
  }

  private saveLocalSession(response: LocalAuthResponse): void {
    const session: LocalAuthSession = {
      token: response.token,
      tokenType: response.tokenType,
      expiresAt: response.expiresAt
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(session));
  }

  private clearLocalSession(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  private isLocalSessionValid(session: LocalAuthSession | null = this.getLocalSession()): boolean {
    if (!session?.token || !session.expiresAt) {
      return false;
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    if (Number.isNaN(expiresAt)) {
      return false;
    }

    return expiresAt > Date.now();
  }
}
