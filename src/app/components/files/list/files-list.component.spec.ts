import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
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
});
