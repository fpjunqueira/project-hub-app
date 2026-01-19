import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PageResponse } from '../../../shared/pagination/page.model';
import { Owner } from '../model/owner.model';
import { OwnerService } from './owner.service';

describe('OwnerService', () => {
  let service: OwnerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(OwnerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists owners', () => {
    const response: PageResponse<Owner> = {
      content: [{ id: 1, name: 'Ada', email: 'ada@example.com' }],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    };

    service.list().subscribe((owners) => {
      expect(owners).toEqual(response);
    });

    const req = httpMock.expectOne('/api/owners?page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('maps array responses into a page', () => {
    const response: Owner[] = [
      { id: 1, name: 'Ada', email: 'ada@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];

    service.list(0, 1).subscribe((page) => {
      expect(page.content).toEqual([response[0]]);
      expect(page.totalPages).toBe(2);
    });

    const req = httpMock.expectOne('/api/owners?page=0&size=1');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('lists all owners', () => {
    const response: Owner[] = [{ id: 1, name: 'Ada', email: 'ada@example.com' }];

    service.listAll().subscribe((owners) => {
      expect(owners).toEqual(response);
    });

    const req = httpMock.expectOne('/api/owners/all');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('falls back to list when listAll fails', () => {
    service.listAll().subscribe((owners) => {
      expect(owners).toEqual([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
    });

    const allReq = httpMock.expectOne('/api/owners/all');
    allReq.flush(null, { status: 500, statusText: 'Server error' });

    const fallbackReq = httpMock.expectOne('/api/owners?page=0&size=1000');
    fallbackReq.flush({
      content: [{ id: 1, name: 'Ada', email: 'ada@example.com' }],
      totalElements: 1,
      totalPages: 1,
      size: 1000,
      number: 0
    });
  });

  it('gets an owner by id', () => {
    const response: Owner = { id: 2, name: 'Bob', email: 'bob@example.com' };

    service.get(2).subscribe((owner) => {
      expect(owner).toEqual(response);
    });

    const req = httpMock.expectOne('/api/owners/2');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('creates an owner', () => {
    const payload: Owner = { name: 'Cara', email: 'cara@example.com' };
    const response: Owner = { ...payload, id: 3 };

    service.create(payload).subscribe((owner) => {
      expect(owner).toEqual(response);
    });

    const req = httpMock.expectOne('/api/owners');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('updates an owner', () => {
    const payload: Owner = { id: 4, name: 'Dan', email: 'dan@example.com' };

    service.update(4, payload).subscribe((owner) => {
      expect(owner).toEqual(payload);
    });

    const req = httpMock.expectOne('/api/owners/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('deletes an owner', () => {
    service.delete(5).subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/api/owners/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('gets owner projects', () => {
    service.getProjects(1).subscribe((projects) => {
      expect(projects).toEqual([{ id: 1, projectName: 'Project' }]);
    });

    const req = httpMock.expectOne('/api/owners/1/projects');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, projectName: 'Project' }]);
  });

  it('gets owner address', () => {
    service.getAddress(1).subscribe((address) => {
      expect(address?.street).toBe('Main');
    });

    const req = httpMock.expectOne('/api/owners/1/address');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' });
  });
});
