import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Address } from '../../addresses/model/address.model';
import { FileRecord } from '../../files/model/file.model';
import { Owner } from '../../owners/model/owner.model';
import { Project } from '../model/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = '/api/projects';

  list() {
    return this.http.get<Project[]>(this.baseUrl);
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
