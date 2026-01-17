import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  list: ReturnType<typeof vi.fn>;
};

type OwnerServiceSpy = {
  list: ReturnType<typeof vi.fn>;
};

type FileServiceSpy = {
  list: ReturnType<typeof vi.fn>;
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
    list: vi.fn().mockReturnValue(of([]))
  };

  const ownerServiceSpy: OwnerServiceSpy = {
    list: vi.fn().mockReturnValue(of([]))
  };

  const fileServiceSpy: FileServiceSpy = {
    list: vi.fn().mockReturnValue(of([]))
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
    expect(addressServiceSpy.list).toHaveBeenCalled();
    expect(ownerServiceSpy.list).toHaveBeenCalled();
    expect(fileServiceSpy.list).toHaveBeenCalled();
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
});
