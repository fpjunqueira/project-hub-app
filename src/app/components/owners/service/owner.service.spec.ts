import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

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
    const response: Owner[] = [{ id: 1, name: 'Ada', email: 'ada@example.com' }];

    service.list().subscribe((owners) => {
      expect(owners).toEqual(response);
    });

    const req = httpMock.expectOne('/api/owners');
    expect(req.request.method).toBe('GET');
    req.flush(response);
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
});
