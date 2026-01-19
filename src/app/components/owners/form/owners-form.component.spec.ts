import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OwnersFormComponent } from './owners-form.component';
import { AddressService } from '../../addresses/service/address.service';
import { ProjectService } from '../../projects/service/project.service';
import { OwnerService } from '../service/owner.service';

type OwnerServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getProjects: ReturnType<typeof vi.fn>;
  getAddress: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

type AddressServiceSpy = {
  listAll: ReturnType<typeof vi.fn>;
};

type ProjectServiceSpy = {
  listAll: ReturnType<typeof vi.fn>;
};

const setup = async (routeId: string | null) => {
  const routeStub = {
    paramMap: of(convertToParamMap(routeId ? { id: routeId } : {}))
  } as unknown as ActivatedRoute;

  const serviceSpy: OwnerServiceSpy = {
    get: vi.fn().mockReturnValue(of({ id: 1, name: 'Loaded', email: 'a@b.com' })),
    getProjects: vi.fn().mockReturnValue(of([])),
    getAddress: vi.fn().mockReturnValue(of(null)),
    create: vi.fn().mockReturnValue(of({ id: 2, name: 'New', email: 'n@b.com' })),
    update: vi.fn().mockReturnValue(of({ id: 1, name: 'Updated', email: 'u@b.com' }))
  };

  const addressServiceSpy: AddressServiceSpy = {
    listAll: vi.fn().mockReturnValue(of([]))
  };

  const projectServiceSpy: ProjectServiceSpy = {
    listAll: vi.fn().mockReturnValue(of([]))
  };

  await TestBed.configureTestingModule({
    imports: [OwnersFormComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub },
      { provide: OwnerService, useValue: serviceSpy },
      { provide: AddressService, useValue: addressServiceSpy },
      { provide: ProjectService, useValue: projectServiceSpy }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(OwnersFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { fixture, component, serviceSpy, addressServiceSpy, projectServiceSpy, navigateSpy };
};

describe('OwnersFormComponent', () => {
  it('loads owner when route has id', async () => {
    const { serviceSpy, addressServiceSpy, projectServiceSpy } = await setup('1');
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(serviceSpy.getProjects).toHaveBeenCalledWith(1);
    expect(serviceSpy.getAddress).toHaveBeenCalledWith(1);
    expect(addressServiceSpy.listAll).toHaveBeenCalled();
    expect(projectServiceSpy.listAll).toHaveBeenCalled();
  });

  it('creates an owner when no id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup(null);

    component.draft.set({ name: 'Ada', email: 'ada@example.com' });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/owners']);
  });

  it('updates an owner when id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup('1');

    component.draft.set({ id: 1, name: 'Updated', email: 'u@example.com' });
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        id: 1,
        name: 'Updated',
        email: 'u@example.com',
        address: null,
        projects: []
      })
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/owners']);
  });

  it('does not submit when name is blank', async () => {
    const { component, serviceSpy } = await setup(null);

    component.draft.set({ name: ' ', email: 'ada@example.com' });
    component.submit();

    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('renders empty address and project options', async () => {
    const { component, fixture } = await setup(null);
    component.addresses.set([]);
    component.projects.set([]);
    component.addressLoading.set(false);
    component.projectsLoading.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No addresses available');
    expect(compiled.textContent).toContain('No projects available');
  });

  it('updates selected projects ids', async () => {
    const { component } = await setup(null);

    component.updateSelectedProjects(['1', 'invalid', 2]);

    expect(component.selectedProjectIds()).toEqual([1, 2]);
  });

  it('updates selected address id', async () => {
    const { component } = await setup(null);

    component.updateSelectedAddress('');
    expect(component.selectedAddressId()).toBeNull();

    component.updateSelectedAddress('3');
    expect(component.selectedAddressId()).toBe(3);

    component.updateSelectedAddress('bad');
    expect(component.selectedAddressId()).toBeNull();
  });

  it('builds payload using selected relations', async () => {
    const { component } = await setup(null);

    component.projects.set([{ id: 1, projectName: 'P1' }, { id: 2, projectName: 'P2' }]);
    component.addresses.set([{ id: 10, street: 'S', city: 'C', state: 'TX', number: '1', zipCode: '0' }]);
    component.selectedProjectIds.set([2]);
    component.selectedAddressId.set(10);

    const payload = component['buildUpdatePayload']({ name: 'Owner', email: 'o@example.com' });

    expect(payload.projects).toEqual([{ id: 2, projectName: 'P2' }]);
    expect(payload.address?.id).toBe(10);
  });
});
