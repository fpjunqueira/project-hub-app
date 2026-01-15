import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { FilesCrudComponent } from './files-crud.component';
import { FileService } from './file.service';

type FileServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('FilesCrudComponent', () => {
  let fixture: ComponentFixture<FilesCrudComponent>;
  let component: FilesCrudComponent;
  let serviceSpy: FileServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FilesCrudComponent],
      providers: [{ provide: FileService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FilesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and loads files', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('adds a file on create', () => {
    const created = { id: 1, filename: 'doc.txt', path: '/tmp/doc.txt' };
    serviceSpy.create.mockReturnValue(of(created));

    component.draft.filename = 'doc.txt';
    component.draft.path = '/tmp/doc.txt';
    component.create();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(component.files).toEqual([created]);
  });

  it('updates a file', () => {
    const updated = { id: 1, filename: 'new.txt', path: '/new.txt' };
    serviceSpy.update.mockReturnValue(of(updated));
    component.files = [{ id: 1, filename: 'old.txt', path: '/old.txt' }];

    component.startEdit(component.files[0]);
    component.editDraft.filename = 'new.txt';
    component.editDraft.path = '/new.txt';
    component.update();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      filename: 'new.txt',
      path: '/new.txt',
      projectId: null
    });
    expect(component.files[0]).toEqual(updated);
  });

  it('removes a file on delete', () => {
    serviceSpy.delete.mockReturnValue(of(void 0));
    component.files = [
      { id: 1, filename: 'one.txt', path: '/1.txt' },
      { id: 2, filename: 'two.txt', path: '/2.txt' }
    ];

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.files).toEqual([
      { id: 2, filename: 'two.txt', path: '/2.txt' }
    ]);
  });
});
