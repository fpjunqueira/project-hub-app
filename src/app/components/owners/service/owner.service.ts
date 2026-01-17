import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { Project } from '../../projects/model/project.model';
import { PageResponse } from '../../../shared/pagination/page.model';
import { Owner } from '../model/owner.model';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private http = inject(HttpClient);
  private baseUrl = '/api/owners';

  list(page = 0, size = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<Owner> | Owner[]>(this.baseUrl, { params })
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
    return this.http.get<Owner[]>(`${this.baseUrl}/all`).pipe(
      catchError(() =>
        this.list(0, 1000).pipe(map((response) => response.content))
      )
    );
  }

  get(id: number) {
    return this.http.get<Owner>(`${this.baseUrl}/${id}`);
  }

  create(owner: Owner) {
    return this.http.post<Owner>(this.baseUrl, owner);
  }

  update(id: number, owner: Owner) {
    return this.http.put<Owner>(`${this.baseUrl}/${id}`, owner);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getProjects(id: number) {
    return this.http.get<Project[]>(`${this.baseUrl}/${id}/projects`);
  }

  getAddress(id: number) {
    return this.http.get<Address | null>(`${this.baseUrl}/${id}/address`);
  }
}
