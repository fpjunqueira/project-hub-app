import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

import { Owner } from '../../owners/model/owner.model';
import { Project } from '../../projects/model/project.model';
import { PageResponse } from '../../../shared/pagination/page.model';
import { Address } from '../model/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = '/api/addresses';

  list(page = 0, size = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<Address> | Address[]>(this.baseUrl, { params })
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
    return this.http.get<Address[]>(`${this.baseUrl}/all`).pipe(
      catchError(() =>
        this.list(0, 1000).pipe(map((response) => response.content))
      )
    );
  }

  get(id: number) {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  create(address: Address) {
    return this.http.post<Address>(this.baseUrl, address);
  }

  update(id: number, address: Address) {
    return this.http.put<Address>(`${this.baseUrl}/${id}`, address);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getOwner(id: number) {
    return this.http.get<Owner | null>(`${this.baseUrl}/${id}/owner`);
  }

  getProject(id: number) {
    return this.http.get<Project | null>(`${this.baseUrl}/${id}/project`);
  }
}
