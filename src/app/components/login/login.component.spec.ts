import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../../auth/auth.service';
import { LoginComponent } from './login.component';

type AuthServiceSpy = {
  login: ReturnType<typeof vi.fn>;
};

const setup = async () => {
  const authServiceSpy: AuthServiceSpy = {
    login: vi.fn().mockReturnValue(
      of({
        username: 'user',
        displayName: 'User',
        token: 'token',
        tokenType: 'Bearer',
        expiresAt: null
      })
    )
  };

  await TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }]
  }).compileComponents();

  const fixture = TestBed.createComponent(LoginComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { component, authServiceSpy, navigateSpy };
};

describe('LoginComponent', () => {
  it('shows an error when credentials are missing', async () => {
    const { component, authServiceSpy } = await setup();

    component.username.set('');
    component.password.set('');
    component.submit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.error()).toBe('Please enter your login and password.');
  });

  it('logs in and navigates on success', async () => {
    const { component, authServiceSpy, navigateSpy } = await setup();

    component.username.set(' user ');
    component.password.set(' pass ');
    component.submit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
    expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
    expect(component.isLoading()).toBe(false);
  });

  it('shows a friendly message on auth error', async () => {
    const { component, authServiceSpy } = await setup();
    authServiceSpy.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    component.username.set('user');
    component.password.set('wrong');
    component.submit();

    expect(component.error()).toBe('Invalid login or password.');
    expect(component.isLoading()).toBe(false);
  });
});
