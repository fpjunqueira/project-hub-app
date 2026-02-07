import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';

import { PageResponse } from '../../../shared/pagination/page.model';
import { TelecomRecord } from '../model/telecom.model';

@Injectable({ providedIn: 'root' })
export class TelecomService {
  private http = inject(HttpClient);

  list(baseUrl: string, page = 0, size = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<TelecomRecord> | TelecomRecord[]>(baseUrl, { params })
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

  listAll(baseUrl: string) {
    return this.http.get<TelecomRecord[]>(`${baseUrl}/all`);
  }

  get(baseUrl: string, id: number) {
    return this.http.get<TelecomRecord>(`${baseUrl}/${id}`);
  }

  create(baseUrl: string, record: TelecomRecord) {
    return this.http.post<TelecomRecord>(baseUrl, record);
  }

  update(baseUrl: string, id: number, record: TelecomRecord) {
    return this.http.put<TelecomRecord>(`${baseUrl}/${id}`, record);
  }

  delete(baseUrl: string, id: number) {
    return this.http.delete<void>(`${baseUrl}/${id}`);
  }
}
