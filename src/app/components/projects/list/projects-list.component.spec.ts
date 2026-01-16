import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsListComponent } from './projects-list.component';
import { ProjectService } from '../service/project.service';

type ProjectServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('ProjectsListComponent', () => {
  let fixture: ComponentFixture<ProjectsListComponent>;
  let component: ProjectsListComponent;
  let serviceSpy: ProjectServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
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
    component.projects = [
      { id: 1, projectName: 'One' },
      { id: 2, projectName: 'Two' }
    ];

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.projects).toEqual([{ id: 2, projectName: 'Two' }]);
  });
});
