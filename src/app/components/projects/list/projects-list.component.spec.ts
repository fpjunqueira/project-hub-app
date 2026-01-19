import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsListComponent } from './projects-list.component';
import { ProjectService } from '../service/project.service';

type ProjectServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const buildPage = (content: Array<{ id?: number; projectName: string }>) => ({
  content,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  size: 10,
  number: 0
});

describe('ProjectsListComponent', () => {
  let fixture: ComponentFixture<ProjectsListComponent>;
  let component: ProjectsListComponent;
  let serviceSpy: ProjectServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of(buildPage([]))),
      delete: vi.fn().mockReturnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent],
      providers: [provideRouter([]), { provide: ProjectService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads projects on init', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('removes a project on delete', () => {
    component.projects.set([
      { id: 1, projectName: 'One' },
      { id: 2, projectName: 'Two' }
    ]);

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(serviceSpy.list).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no projects', () => {
    component.projects.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-empty')?.textContent).toContain('No projects yet.');
  });

  it('renders table rows and pagination when projects exist', () => {
    component.projects.set([{ id: 1, projectName: 'Alpha' }]);
    component.pageIndex.set(0);
    component.totalPages.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.querySelector('.pagination')?.textContent).toContain('Page 1 of 2');
  });

  it('handles array responses on refresh', () => {
    serviceSpy.list.mockReturnValueOnce(of([{ id: 3, projectName: 'New' }]));

    component.refresh();

    expect(component.projects().length).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('sets error when refresh fails', () => {
    serviceSpy.list.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.refresh();

    expect(component.error()).toBe('Failed to load projects.');
  });

  it('skips delete when id is undefined', () => {
    component.delete();
    expect(serviceSpy.delete).not.toHaveBeenCalled();
  });

  it('moves between pages when available', () => {
    component.pageIndex.set(1);
    component.totalPages.set(3);

    component.previousPage();
    component.nextPage();

    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('ignores invalid page size values', () => {
    component.pageSize.set(10);

    component.updatePageSize('invalid');
    component.updatePageSize(-1);

    expect(component.pageSize()).toBe(10);
  });

  it('updates page size when value changes', () => {
    component.pageSize.set(10);

    component.updatePageSize(50);

    expect(component.pageSize()).toBe(50);
    expect(serviceSpy.list).toHaveBeenCalled();
  });
});
