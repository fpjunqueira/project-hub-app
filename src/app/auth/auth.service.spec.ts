import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('normalizes credentials and stores the user on login', () => {
    service.login({ username: '  admin ', password: ' secret ' }).subscribe((user) => {
      expect(user.username).toBe('admin');
      expect(user.tokenType).toBe('Bearer');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.body).toEqual({ username: 'admin', password: 'secret' });
    req.flush({ token: 'token-value', tokenType: '', expiresAt: null });

    const stored = localStorage.getItem('project-hub-auth');
    expect(stored).toContain('admin');
  });

  it('returns null when stored user is invalid json', () => {
    localStorage.setItem('project-hub-auth', '{bad json');
    expect(service.getCurrentUser()).toBeNull();
  });

  it('returns null and clears storage for expired users', () => {
    const expired = {
      username: 'user',
      displayName: 'user',
      token: 'token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() - 1000).toISOString()
    };
    localStorage.setItem('project-hub-auth', JSON.stringify(expired));

    expect(service.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('project-hub-auth')).toBeNull();
  });

  it('returns authorization header when token is present', () => {
    const user = {
      username: 'user',
      displayName: 'user',
      token: 'token',
      tokenType: '  Token ',
      expiresAt: null
    };
    localStorage.setItem('project-hub-auth', JSON.stringify(user));

    expect(service.getAuthorizationHeader()).toBe('Token token');
  });

  it('returns null authorization header when user is missing', () => {
    expect(service.getAuthorizationHeader()).toBeNull();
  });
});
