import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsViewComponent } from './projects-view.component';
import { ProjectService } from '../service/project.service';

type ProjectServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getOwners: ReturnType<typeof vi.fn>;
  getFiles: ReturnType<typeof vi.fn>;
  getAddress: ReturnType<typeof vi.fn>;
};

describe('ProjectsViewComponent', () => {
  let fixture: ComponentFixture<ProjectsViewComponent>;
  let component: ProjectsViewComponent;
  let serviceSpy: ProjectServiceSpy;

  beforeEach(async () => {
    const routeStub = {
      paramMap: of(convertToParamMap({ id: '1' }))
    } as unknown as ActivatedRoute;

    serviceSpy = {
      get: vi.fn().mockReturnValue(of({ id: 1, projectName: 'Loaded' })),
      getOwners: vi.fn().mockReturnValue(of([])),
      getFiles: vi.fn().mockReturnValue(of([])),
      getAddress: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [ProjectsViewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: ProjectService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads project details', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(serviceSpy.getOwners).toHaveBeenCalledWith(1);
    expect(serviceSpy.getFiles).toHaveBeenCalledWith(1);
    expect(serviceSpy.getAddress).toHaveBeenCalledWith(1);
  });

  it('renders empty relation states', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No address assigned.');
    expect(compiled.textContent).toContain('No owners linked.');
    expect(compiled.textContent).toContain('No files linked.');
  });

  it('renders owners, files, and address when available', () => {
    component.address.set({
      id: 10,
      street: 'Main',
      city: 'A',
      state: 'TX',
      number: '1',
      zipCode: '0'
    });
    component.owners.set([{ id: 2, name: 'Ada', email: 'ada@example.com' }]);
    component.files.set([{ id: 3, filename: 'doc.txt', path: '/doc.txt', projectId: null }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Main');
    expect(compiled.textContent).toContain('Ada');
    expect(compiled.textContent).toContain('doc.txt');
  });

  it('shows loading indicators for relations', () => {
    component.addressLoading.set(true);
    component.ownersLoading.set(true);
    component.filesLoading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Loading related data...');
  });
});
