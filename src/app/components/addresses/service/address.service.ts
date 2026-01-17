import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Address } from '../model/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = '/api/addresses';

  list() {
    return this.http.get<Address[]>(this.baseUrl);
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
}
