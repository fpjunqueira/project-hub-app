import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { FileRecord } from '../../files/model/file.model';
import { Owner } from '../../owners/model/owner.model';
import { PageResponse } from '../../../shared/pagination/page.model';
import { Project } from '../model/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = '/api/projects';

  list(page = 0, size = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<Project> | Project[]>(this.baseUrl, { params })
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

          return {
            content,
            totalElements,
            totalPages,
            size,
            number: safePage
          };
        })
      );
  }

  listAll() {
    return this.http.get<Project[]>(`${this.baseUrl}/all`).pipe(
      catchError(() =>
        this.list(0, 1000).pipe(map((response) => response.content))
      )
    );
  }

  get(id: number) {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  create(project: Project) {
    return this.http.post<Project>(this.baseUrl, project);
  }

  update(id: number, project: Project) {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, project);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getOwners(id: number) {
    return this.http.get<Owner[]>(`${this.baseUrl}/${id}/owners`);
  }

  getFiles(id: number) {
    return this.http.get<FileRecord[]>(`${this.baseUrl}/${id}/files`);
  }

  getAddress(id: number) {
    return this.http.get<Address | null>(`${this.baseUrl}/${id}/address`);
  }
}
