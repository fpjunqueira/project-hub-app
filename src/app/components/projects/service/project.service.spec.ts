import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PageResponse } from '../../../shared/pagination/page.model';
import { Project } from '../model/project.model';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists projects', () => {
    const response: PageResponse<Project> = {
      content: [{ id: 1, projectName: 'Alpha' }],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    };

    service.list().subscribe((projects) => {
      expect(projects).toEqual(response);
    });

    const req = httpMock.expectOne('/api/projects?page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('lists all projects', () => {
    const response: Project[] = [{ id: 1, projectName: 'Alpha' }];

    service.listAll().subscribe((projects) => {
      expect(projects).toEqual(response);
    });

    const req = httpMock.expectOne('/api/projects/all');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('gets a project by id', () => {
    const response: Project = { id: 2, projectName: 'Beta' };

    service.get(2).subscribe((project) => {
      expect(project).toEqual(response);
    });

    const req = httpMock.expectOne('/api/projects/2');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('creates a project', () => {
    const payload: Project = { projectName: 'Gamma' };
    const response: Project = { ...payload, id: 3 };

    service.create(payload).subscribe((project) => {
      expect(project).toEqual(response);
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('updates a project', () => {
    const payload: Project = { id: 4, projectName: 'Delta' };

    service.update(4, payload).subscribe((project) => {
      expect(project).toEqual(payload);
    });

    const req = httpMock.expectOne('/api/projects/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('deletes a project', () => {
    service.delete(5).subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/api/projects/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
