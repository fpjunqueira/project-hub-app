import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../auth/auth.service';
import { TopbarComponent } from './topbar.component';

type AuthServiceSpy = {
  getCurrentUser: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
};

const setup = async (user: { username: string; displayName?: string | null } | null) => {
  const authServiceSpy: AuthServiceSpy = {
    getCurrentUser: vi.fn().mockReturnValue(user),
    logout: vi.fn()
  };

  await TestBed.configureTestingModule({
    imports: [TopbarComponent],
    providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }]
  }).compileComponents();

  const fixture = TestBed.createComponent(TopbarComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { component, authServiceSpy, navigateSpy };
};

describe('TopbarComponent', () => {
  it('shows Guest when there is no user', async () => {
    const { component } = await setup(null);
    expect(component.userLabel()).toBe('Guest');
  });

  it('prefers display name for the user label', async () => {
    const { component } = await setup({ username: 'felip', displayName: 'Felip' });
    expect(component.userLabel()).toBe('Felip');
  });

  it('falls back to username when display name is missing', async () => {
    const { component } = await setup({ username: 'felip', displayName: null });
    expect(component.userLabel()).toBe('felip');
  });

  it('logs out and navigates to login', async () => {
    const { component, authServiceSpy, navigateSpy } = await setup({ username: 'felip' });

    component.signOut();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
