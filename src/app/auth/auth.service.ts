import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msalService = inject(MsalService);

  constructor() {
    this.initializeAccount();
  }

  login(): void {
    this.msalService.loginRedirect();
  }

  logout(): void {
    this.msalService.logoutRedirect();
  }

  isAuthenticated(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  private initializeAccount(): void {
    this.msalService.instance
      .handleRedirectPromise()
      .then((result) => {
        if (result?.account) {
          this.msalService.instance.setActiveAccount(result.account);
          return;
        }

        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
          this.msalService.instance.setActiveAccount(accounts[0]);
        }
      })
      .catch(() => null);
  }
}
