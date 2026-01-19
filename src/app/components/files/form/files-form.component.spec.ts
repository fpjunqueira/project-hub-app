import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { FilesFormComponent } from './files-form.component';
import { FileService } from '../service/file.service';

type FileServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getProject: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const setup = async (routeId: string | null) => {
  const routeStub = {
    paramMap: of(convertToParamMap(routeId ? { id: routeId } : {}))
  } as unknown as ActivatedRoute;

  const serviceSpy: FileServiceSpy = {
    get: vi.fn().mockReturnValue(
      of({ id: 1, filename: 'doc.txt', path: '/doc.txt', projectId: null })
    ),
    getProject: vi.fn().mockReturnValue(of(null)),
    create: vi.fn().mockReturnValue(
      of({ id: 2, filename: 'new.txt', path: '/new.txt', projectId: null })
    ),
    update: vi.fn().mockReturnValue(
      of({ id: 1, filename: 'updated.txt', path: '/updated.txt', projectId: null })
    )
  };

  await TestBed.configureTestingModule({
    imports: [FilesFormComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub },
      { provide: FileService, useValue: serviceSpy }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(FilesFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { fixture, component, serviceSpy, navigateSpy };
};

describe('FilesFormComponent', () => {
  it('loads file when route has id', async () => {
    const { serviceSpy } = await setup('1');
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(serviceSpy.getProject).toHaveBeenCalledWith(1);
  });

  it('creates a file when no id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup(null);

    component.draft.set({ filename: 'new.txt', path: '/new.txt', projectId: null });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/files']);
  });

  it('updates a file when id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup('1');

    component.draft.set({
      id: 1,
      filename: 'updated.txt',
      path: '/updated.txt',
      projectId: null
    });
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      filename: 'updated.txt',
      path: '/updated.txt',
      projectId: null
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/files']);
  });

  it('does not submit when filename is blank', async () => {
    const { component, serviceSpy } = await setup(null);

    component.draft.set({ filename: '  ', path: '/new.txt', projectId: null });
    component.submit();

    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('renders edit state with empty project', async () => {
    const { fixture } = await setup('1');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Edit File');
    expect(compiled.textContent).toContain('No project linked.');
  });

  it('renders loading and error states for relations', async () => {
    const { component, fixture } = await setup('1');

    component.projectLoading.set(true);
    component.relationsError.set('Failed to load related data.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Loading related data...');
    expect(compiled.textContent).toContain('Failed to load related data.');
  });

  it('sets relation error when relation fetch fails', async () => {
    const { component, serviceSpy } = await setup('1');
    serviceSpy.getProject.mockReturnValueOnce(throwError(() => new Error('fail')));

    component['loadRelations'](1);

    expect(component.relationsError()).toBe('Failed to load related data.');
  });

  it('resets relations when file has no id', async () => {
    const { component } = await setup(null);

    component.project.set({ id: 1, projectName: 'P' });
    component['handleFileLoad']({ id: undefined, filename: 'a', path: '/a', projectId: null });

    expect(component.project()).toBeNull();
  });

  it('updates draft fields from input handlers', async () => {
    const { component } = await setup(null);

    component.updateFilename('doc.txt');
    component.updatePath('/doc.txt');

    expect(component.draft()).toEqual({ filename: 'doc.txt', path: '/doc.txt', projectId: null });
  });
});
