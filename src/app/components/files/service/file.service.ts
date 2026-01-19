import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

import { Project } from '../../projects/model/project.model';
import { PageResponse } from '../../../shared/pagination/page.model';
import { FileRecord } from '../model/file.model';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/files';

  list(page = 0, size = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<FileRecord> | FileRecord[]>(this.baseUrl, { params })
      .pipe(
        map((response) => {
          if (!Array.isArray(response)) {
            return response;
          }

          const totalElements = response.length;
          const totalPages = Math.max(1, Math.ceil(totalElements / size));
          const safePage = Math.min(Math.max(page, 0), totalPages - 1);
          const start = safePage * size;
          const content = response.slice(start, start + size);
          const numberOfElements = content.length;

          return {
            content,
            totalElements,
            totalPages,
            size,
            number: safePage,
            first: safePage === 0,
            last: safePage >= totalPages - 1,
            numberOfElements,
            empty: totalElements === 0,
            pageable: {
              pageNumber: safePage,
              pageSize: size,
              offset: safePage * size,
              paged: true,
              unpaged: false
            },
            sort: {
              sorted: false,
              unsorted: true,
              empty: true
            }
          };
        })
      );
  }

  listAll() {
    return this.http.get<FileRecord[]>(`${this.baseUrl}/all`).pipe(
      catchError(() =>
        this.list(0, 1000).pipe(map((response) => response.content))
      )
    );
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

  upload(file: File, projectId?: number | null) {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId !== undefined && projectId !== null) {
      formData.append('projectId', String(projectId));
    }
    return this.http.post<FileRecord>(`${this.baseUrl}/upload`, formData);
  }

  replaceFile(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileRecord>(`${this.baseUrl}/${id}/upload`, formData);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getProject(id: number) {
    return this.http.get<Project | null>(`${this.baseUrl}/${id}/project`);
  }
}
