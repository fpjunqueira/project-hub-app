import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const msalServiceMock = {
    instance: {
      handleRedirectPromise: () => Promise.resolve(null),
      getAllAccounts: () => [],
      setActiveAccount: () => null
    },
    loginRedirect: () => null,
    logoutRedirect: () => null
  } as unknown as MsalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: MsalService,
          useValue: msalServiceMock
        }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('returns false when no accounts exist', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('returns true when accounts exist', () => {
    msalServiceMock.instance.getAllAccounts = () => [{ username: 'user' } as never];
    expect(service.isAuthenticated()).toBe(true);
  });
});
