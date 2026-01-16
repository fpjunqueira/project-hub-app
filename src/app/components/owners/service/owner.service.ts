import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Owner } from '../model/owner.model';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private http = inject(HttpClient);
  private baseUrl = '/api/owners';

  list() {
    return this.http.get<Owner[]>(this.baseUrl);
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
}
