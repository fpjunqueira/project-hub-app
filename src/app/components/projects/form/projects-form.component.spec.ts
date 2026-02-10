import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsFormComponent } from './projects-form.component';
import { AddressService } from '../../addresses/service/address.service';
import { FileService } from '../../files/service/file.service';
import { OwnerService } from '../../owners/service/owner.service';
import { ProjectService } from '../service/project.service';

type ProjectServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getOwners: ReturnType<typeof vi.fn>;
  getFiles: ReturnType<typeof vi.fn>;
  getAddress: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

type AddressServiceSpy = {
  listAll: ReturnType<typeof vi.fn>;
};

type OwnerServiceSpy = {
  listAll: ReturnType<typeof vi.fn>;
};

type FileServiceSpy = {
  listAll: ReturnType<typeof vi.fn>;
};

const setup = async (routeId: string | null) => {
  const routeStub = {
    paramMap: of(convertToParamMap(routeId ? { id: routeId } : {}))
  } as unknown as ActivatedRoute;

  const serviceSpy: ProjectServiceSpy = {
    get: vi.fn().mockReturnValue(of({ id: 1, projectName: 'Loaded' })),
    getOwners: vi.fn().mockReturnValue(of([])),
    getFiles: vi.fn().mockReturnValue(of([])),
    getAddress: vi.fn().mockReturnValue(of(null)),
    create: vi.fn().mockReturnValue(of({ id: 2, projectName: 'Created' })),
    update: vi.fn().mockReturnValue(of({ id: 1, projectName: 'Updated' }))
  };

  const addressServiceSpy: AddressServiceSpy = {
    listAll: vi.fn().mockReturnValue(of([]))
  };

  const ownerServiceSpy: OwnerServiceSpy = {
    listAll: vi.fn().mockReturnValue(of([]))
  };

  const fileServiceSpy: FileServiceSpy = {
    listAll: vi.fn().mockReturnValue(of([]))
  };

  await TestBed.configureTestingModule({
    imports: [ProjectsFormComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub },
      { provide: ProjectService, useValue: serviceSpy },
      { provide: AddressService, useValue: addressServiceSpy },
      { provide: OwnerService, useValue: ownerServiceSpy },
      { provide: FileService, useValue: fileServiceSpy }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(ProjectsFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { fixture, component, serviceSpy, addressServiceSpy, ownerServiceSpy, fileServiceSpy, navigateSpy };
};

describe('ProjectsFormComponent', () => {
  it('loads project when route has id', async () => {
    const { serviceSpy, addressServiceSpy, ownerServiceSpy, fileServiceSpy } = await setup('1');
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(serviceSpy.getOwners).toHaveBeenCalledWith(1);
    expect(serviceSpy.getFiles).toHaveBeenCalledWith(1);
    expect(serviceSpy.getAddress).toHaveBeenCalledWith(1);
    expect(addressServiceSpy.listAll).toHaveBeenCalled();
    expect(ownerServiceSpy.listAll).toHaveBeenCalled();
    expect(fileServiceSpy.listAll).toHaveBeenCalled();
  });

  it('creates a project when no id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup(null);

    component.draft.set({ projectName: 'New' });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
  });

  it('updates a project when id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup('1');

    component.draft.set({ id: 1, projectName: 'Updated' });
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ id: 1, projectName: 'Updated' })
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
  });

  it('does not submit when project name is blank', async () => {
    const { component, serviceSpy } = await setup(null);

    component.draft.set({ projectName: '  ' });
    component.submit();

    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('renders empty relation options', async () => {
    const { component, fixture } = await setup(null);

    component.addresses.set([]);
    component.owners.set([]);
    component.files.set([]);
    component.addressLoading.set(false);
    component.ownersLoading.set(false);
    component.filesLoading.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No addresses available');
    expect(compiled.textContent).toContain('No owners available');
    expect(compiled.textContent).toContain('No files available');
  });

  it('updates selected owners and files ids', async () => {
    const { component } = await setup(null);

    const mockOwnersSelect = {
      selectedOptions: [{ value: '1' }, { value: 'invalid' }, { value: '2' }]
    } as unknown as HTMLSelectElement;
    const mockFilesSelect = {
      selectedOptions: [{ value: '3' }, { value: '4' }, { value: 'bad' }]
    } as unknown as HTMLSelectElement;
    component.updateSelectedOwners({ target: mockOwnersSelect } as unknown as Event);
    component.updateSelectedFiles({ target: mockFilesSelect } as unknown as Event);

    expect(component.selectedOwnerIds()).toEqual([1, 2]);
    expect(component.selectedFileIds()).toEqual([3, 4]);
  });

  it('updates selected address id', async () => {
    const { component } = await setup(null);

    component.updateSelectedAddress('');
    expect(component.selectedAddressId()).toBeNull();

    component.updateSelectedAddress('5');
    expect(component.selectedAddressId()).toBe(5);

    component.updateSelectedAddress('bad');
    expect(component.selectedAddressId()).toBeNull();
  });

  it('builds payload using selected relations', async () => {
    const { component } = await setup(null);

    component.owners.set([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
    component.files.set([{ id: 7, filename: 'doc.txt', path: '/doc.txt', projectId: null }]);
    component.addresses.set([{ id: 20, street: 'S', city: 'C', state: 'TX', number: '1', zipCode: '0' }]);
    component.selectedOwnerIds.set([1]);
    component.selectedFileIds.set([7]);
    component.selectedAddressId.set(20);

    const payload = component['buildUpdatePayload']({ projectName: 'New' });

    expect(payload.owners).toEqual([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
    expect(payload.files).toEqual([{ id: 7, filename: 'doc.txt', path: '/doc.txt', projectId: null }]);
    expect(payload.address?.id).toBe(20);
  });
});
