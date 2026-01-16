import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OwnersFormComponent } from './owners-form.component';
import { OwnerService } from '../service/owner.service';

type OwnerServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const setup = async (routeId: string | null) => {
  const routeStub = {
    snapshot: { paramMap: { get: () => routeId } }
  } as unknown as ActivatedRoute;

  const serviceSpy: OwnerServiceSpy = {
    get: vi.fn().mockReturnValue(of({ id: 1, name: 'Loaded', email: 'a@b.com' })),
    create: vi.fn().mockReturnValue(of({ id: 2, name: 'New', email: 'n@b.com' })),
    update: vi.fn().mockReturnValue(of({ id: 1, name: 'Updated', email: 'u@b.com' }))
  };

  await TestBed.configureTestingModule({
    imports: [OwnersFormComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub },
      { provide: OwnerService, useValue: serviceSpy }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(OwnersFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { fixture, component, serviceSpy, navigateSpy };
};

describe('OwnersFormComponent', () => {
  it('loads owner when route has id', async () => {
    const { serviceSpy } = await setup('1');
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
  });

  it('creates an owner when no id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup(null);

    component.draft.name = 'Ada';
    component.draft.email = 'ada@example.com';
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/owners']);
  });

  it('updates an owner when id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup('1');

    component.draft = { id: 1, name: 'Updated', email: 'u@example.com' };
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      name: 'Updated',
      email: 'u@example.com'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/owners']);
  });
});
