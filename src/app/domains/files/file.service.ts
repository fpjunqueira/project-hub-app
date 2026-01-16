import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { FileRecord } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class FileService {
  private http = inject(HttpClient);
  private baseUrl = '/api/files';

  list() {
    return this.http.get<FileRecord[]>(this.baseUrl);
  }

  get(id: number) {
    return this.http.get<FileRecord>(`${this.baseUrl}/${id}`);
  }

  create(file: FileRecord) {
    return this.http.post<FileRecord>(this.baseUrl, file);
  }

  update(id: number, file: FileRecord) {
    return this.http.put<FileRecord>(`${this.baseUrl}/${id}`, file);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
