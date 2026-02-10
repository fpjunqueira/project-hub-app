import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../auth/auth.service';
import { LoginComponent } from './login.component';

const setup = async (options?: { authEnabled?: boolean; isAuthenticated?: boolean }) => {
  const loginLocalSpy = vi.fn().mockResolvedValue(true);
  const loginSpy = vi.fn();
  const isAuthEnabled = vi.fn().mockReturnValue(options?.authEnabled ?? false);
  const isAuthenticated = vi.fn().mockReturnValue(options?.isAuthenticated ?? false);

  await TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: {
          isAuthEnabled,
          loginLocal: loginLocalSpy,
          login: loginSpy,
          isAuthenticated
        }
      }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(LoginComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { component, loginLocalSpy, loginSpy, navigateSpy };
};

describe('LoginComponent', () => {
  it('calls loginLocal and navigates when auth is disabled', async () => {
    const { component, loginLocalSpy, navigateSpy } = await setup();

    await component.login();

    expect(loginLocalSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('calls login (MSAL) when auth is enabled', async () => {
    const { component, loginSpy } = await setup({ authEnabled: true });

    await component.login();

    expect(loginSpy).toHaveBeenCalled();
  });

  it('navigates to dashboard when backToApp and authenticated', async () => {
    const { component, navigateSpy } = await setup({ isAuthenticated: true });

    component.backToApp();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
