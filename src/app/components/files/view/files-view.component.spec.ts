import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { FilesViewComponent } from './files-view.component';
import { FileService } from '../service/file.service';

type FileServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getProject: ReturnType<typeof vi.fn>;
};

describe('FilesViewComponent', () => {
  let fixture: ComponentFixture<FilesViewComponent>;
  let component: FilesViewComponent;
  let serviceSpy: FileServiceSpy;

  beforeEach(async () => {
    const routeStub = {
      paramMap: of(convertToParamMap({ id: '1' }))
    } as unknown as ActivatedRoute;

    serviceSpy = {
      get: vi.fn().mockReturnValue(
        of({ id: 1, filename: 'doc.txt', path: '/doc.txt', projectId: null })
      ),
      getProject: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [FilesViewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: FileService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads file details', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(serviceSpy.getProject).toHaveBeenCalledWith(1);
  });

  it('renders empty project state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No project linked.');
  });

  it('renders project details when available', () => {
    component.project.set({ id: 1, projectName: 'Project' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Project');
  });

  it('shows loading indicator for relations', () => {
    component.projectLoading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Loading related data...');
  });
});
