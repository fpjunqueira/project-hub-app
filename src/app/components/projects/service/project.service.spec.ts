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

  it('maps array responses into a page', () => {
    const response: Project[] = [
      { id: 1, projectName: 'Alpha' },
      { id: 2, projectName: 'Beta' }
    ];

    service.list(0, 1).subscribe((page) => {
      expect(page.content).toEqual([response[0]]);
      expect(page.totalPages).toBe(2);
    });

    const req = httpMock.expectOne('/api/projects?page=0&size=1');
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

  it('falls back to list when listAll fails', () => {
    service.listAll().subscribe((projects) => {
      expect(projects).toEqual([{ id: 1, projectName: 'Alpha' }]);
    });

    const allReq = httpMock.expectOne('/api/projects/all');
    allReq.flush(null, { status: 500, statusText: 'Server error' });

    const fallbackReq = httpMock.expectOne('/api/projects?page=0&size=1000');
    fallbackReq.flush({
      content: [{ id: 1, projectName: 'Alpha' }],
      totalElements: 1,
      totalPages: 1,
      size: 1000,
      number: 0
    });
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

  it('gets project owners', () => {
    service.getOwners(1).subscribe((owners) => {
      expect(owners).toEqual([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
    });

    const req = httpMock.expectOne('/api/projects/1/owners');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
  });

  it('gets project files', () => {
    service.getFiles(1).subscribe((files) => {
      expect(files).toEqual([{ id: 1, filename: 'doc.txt', path: '/doc.txt', projectId: null }]);
    });

    const req = httpMock.expectOne('/api/projects/1/files');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, filename: 'doc.txt', path: '/doc.txt', projectId: null }]);
  });

  it('gets project address', () => {
    service.getAddress(1).subscribe((address) => {
      expect(address?.street).toBe('Main');
    });

    const req = httpMock.expectOne('/api/projects/1/address');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' });
  });
});
