import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FileRecord } from '../model/file.model';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(FileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists files', () => {
    const response: FileRecord[] = [{ id: 1, filename: 'doc.txt', path: '/doc.txt', projectId: null }];

    service.list().subscribe((files) => {
      expect(files).toEqual(response);
    });

    const req = httpMock.expectOne('/api/files');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('gets a file by id', () => {
    const response: FileRecord = { id: 2, filename: 'file.txt', path: '/file.txt', projectId: null };

    service.get(2).subscribe((file) => {
      expect(file).toEqual(response);
    });

    const req = httpMock.expectOne('/api/files/2');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('creates a file', () => {
    const payload: FileRecord = { filename: 'new.txt', path: '/new.txt', projectId: 1 };
    const response: FileRecord = { ...payload, id: 3 };

    service.create(payload).subscribe((file) => {
      expect(file).toEqual(response);
    });

    const req = httpMock.expectOne('/api/files');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('updates a file', () => {
    const payload: FileRecord = { id: 4, filename: 'update.txt', path: '/update.txt', projectId: 2 };

    service.update(4, payload).subscribe((file) => {
      expect(file).toEqual(payload);
    });

    const req = httpMock.expectOne('/api/files/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('deletes a file', () => {
    service.delete(5).subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/api/files/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
