import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsViewComponent } from './projects-view.component';
import { ProjectService } from '../service/project.service';

type ProjectServiceSpy = {
  get: ReturnType<typeof vi.fn>;
};

describe('ProjectsViewComponent', () => {
  let fixture: ComponentFixture<ProjectsViewComponent>;
  let component: ProjectsViewComponent;
  let serviceSpy: ProjectServiceSpy;

  beforeEach(async () => {
    const routeStub = {
      snapshot: { paramMap: { get: () => '1' } }
    } as unknown as ActivatedRoute;

    serviceSpy = {
      get: vi.fn().mockReturnValue(of({ id: 1, projectName: 'Loaded' }))
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
  });
});
