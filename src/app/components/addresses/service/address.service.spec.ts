import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PageResponse } from '../../../shared/pagination/page.model';
import { Address } from '../model/address.model';
import { AddressService } from './address.service';

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists addresses', () => {
    const response: PageResponse<Address> = {
      content: [
        { id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    };

    service.list().subscribe((addresses) => {
      expect(addresses).toEqual(response);
    });

    const req = httpMock.expectOne('/api/addresses?page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('maps array responses into a page', () => {
    const response: Address[] = [
      { id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' },
      { id: 2, street: 'Second', city: 'B', state: 'TX', number: '2', zipCode: '1' }
    ];

    service.list(0, 1).subscribe((page) => {
      expect(page.content).toEqual([response[0]]);
      expect(page.totalPages).toBe(2);
    });

    const req = httpMock.expectOne('/api/addresses?page=0&size=1');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('lists all addresses', () => {
    const response: Address[] = [
      { id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' }
    ];

    service.listAll().subscribe((addresses) => {
      expect(addresses).toEqual(response);
    });

    const req = httpMock.expectOne('/api/addresses/all');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('falls back to list when listAll fails', () => {
    service.listAll().subscribe((addresses) => {
      expect(addresses).toEqual([{ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' }]);
    });

    const allReq = httpMock.expectOne('/api/addresses/all');
    allReq.flush(null, { status: 500, statusText: 'Server error' });

    const fallbackReq = httpMock.expectOne('/api/addresses?page=0&size=1000');
    fallbackReq.flush({
      content: [{ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' }],
      totalElements: 1,
      totalPages: 1,
      size: 1000,
      number: 0
    });
  });

  it('gets an address by id', () => {
    const response: Address = {
      id: 2,
      street: 'Second',
      city: 'B',
      state: 'TX',
      number: '2',
      zipCode: '1'
    };

    service.get(2).subscribe((address) => {
      expect(address).toEqual(response);
    });

    const req = httpMock.expectOne('/api/addresses/2');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('creates an address', () => {
    const payload: Address = {
      street: 'Third',
      city: 'C',
      state: 'TX',
      number: '3',
      zipCode: '2'
    };
    const response: Address = { ...payload, id: 3 };

    service.create(payload).subscribe((address) => {
      expect(address).toEqual(response);
    });

    const req = httpMock.expectOne('/api/addresses');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('updates an address', () => {
    const payload: Address = {
      id: 4,
      street: 'Fourth',
      city: 'D',
      state: 'TX',
      number: '4',
      zipCode: '3'
    };

    service.update(4, payload).subscribe((address) => {
      expect(address).toEqual(payload);
    });

    const req = httpMock.expectOne('/api/addresses/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('deletes an address', () => {
    service.delete(5).subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/api/addresses/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('gets address owner', () => {
    service.getOwner(1).subscribe((owner) => {
      expect(owner?.name).toBe('Owner');
    });

    const req = httpMock.expectOne('/api/addresses/1/owner');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, name: 'Owner', email: 'owner@example.com' });
  });

  it('gets address project', () => {
    service.getProject(1).subscribe((project) => {
      expect(project?.projectName).toBe('Project');
    });

    const req = httpMock.expectOne('/api/addresses/1/project');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, projectName: 'Project' });
  });
});
