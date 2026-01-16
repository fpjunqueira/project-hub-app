import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Project } from '../shared/models';

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
}
