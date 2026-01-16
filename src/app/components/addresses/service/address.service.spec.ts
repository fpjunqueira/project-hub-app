import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

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
    const response: Address[] = [
      { id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' }
    ];

    service.list().subscribe((addresses) => {
      expect(addresses).toEqual(response);
    });

    const req = httpMock.expectOne('/api/addresses');
    expect(req.request.method).toBe('GET');
    req.flush(response);
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
});
