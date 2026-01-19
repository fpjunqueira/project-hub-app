import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { FilesListComponent } from './files-list.component';
import { FileService } from '../service/file.service';

type FileServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const buildPage = (content: Array<{ id?: number; filename: string; path: string; projectId?: number | null }>) => ({
  content,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  size: 10,
  number: 0
});

describe('FilesListComponent', () => {
  let fixture: ComponentFixture<FilesListComponent>;
  let component: FilesListComponent;
  let serviceSpy: FileServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of(buildPage([]))),
      delete: vi.fn().mockReturnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [FilesListComponent],
      providers: [provideRouter([]), { provide: FileService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads files on init', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('removes a file on delete', () => {
    component.files.set([
      { id: 1, filename: 'one.txt', path: '/1.txt', projectId: null },
      { id: 2, filename: 'two.txt', path: '/2.txt', projectId: null }
    ]);

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(serviceSpy.list).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no files', () => {
    component.files.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-empty')?.textContent).toContain('No files yet.');
  });

  it('renders table rows and pagination when files exist', () => {
    component.files.set([{ id: 1, filename: 'doc.txt', path: '/doc.txt', projectId: null }]);
    component.pageIndex.set(0);
    component.totalPages.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.querySelector('.pagination')?.textContent).toContain('Page 1 of 2');
  });

  it('handles array responses on refresh', () => {
    serviceSpy.list.mockReturnValueOnce(
      of([{ id: 3, filename: 'a.txt', path: '/a.txt', projectId: null }])
    );

    component.refresh();

    expect(component.files().length).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('sets error when refresh fails', () => {
    serviceSpy.list.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.refresh();

    expect(component.error()).toBe('Failed to load files.');
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
