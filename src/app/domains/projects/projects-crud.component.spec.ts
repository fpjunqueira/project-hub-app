import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsCrudComponent } from './projects-crud.component';
import { ProjectService } from './project.service';

type ProjectServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('ProjectsCrudComponent', () => {
  let fixture: ComponentFixture<ProjectsCrudComponent>;
  let component: ProjectsCrudComponent;
  let serviceSpy: ProjectServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectsCrudComponent],
      providers: [{ provide: ProjectService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and loads projects', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('adds a project on create', () => {
    const created = { id: 1, projectName: 'Alpha' };
    serviceSpy.create.mockReturnValue(of(created));

    component.draft.projectName = 'Alpha';
    component.create();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(component.projects).toEqual([created]);
  });

  it('updates a project', () => {
    const updated = { id: 1, projectName: 'Updated' };
    serviceSpy.update.mockReturnValue(of(updated));
    component.projects = [{ id: 1, projectName: 'Old' }];

    component.startEdit(component.projects[0]);
    component.editDraft.projectName = 'Updated';
    component.update();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      projectName: 'Updated'
    });
    expect(component.projects[0]).toEqual(updated);
  });

  it('removes a project on delete', () => {
    serviceSpy.delete.mockReturnValue(of(void 0));
    component.projects = [
      { id: 1, projectName: 'One' },
      { id: 2, projectName: 'Two' }
    ];

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.projects).toEqual([{ id: 2, projectName: 'Two' }]);
  });
});
