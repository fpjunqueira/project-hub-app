import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Project } from '../shared/models';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-projects-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-crud.component.html',
  styleUrl: './projects-crud.component.scss'
})
export class ProjectsCrudComponent implements OnInit {
  private projectService = inject(ProjectService);

  projects: Project[] = [];
  draft: Project = { projectName: '' };
  editDraft: Project = { projectName: '' };
  editingId: number | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading = true;
    this.error = '';
    this.projectService
      .list()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (projects) => (this.projects = projects),
        error: () => (this.error = 'Failed to load projects.')
      });
  }

  create(): void {
    if (!this.draft.projectName.trim()) {
      return;
    }

    const payload = { ...this.draft };
    this.isLoading = true;
    this.error = '';
    this.projectService
      .create(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created) => {
          this.projects = [...this.projects, created];
          this.draft = { projectName: '' };
        },
        error: () => (this.error = 'Failed to create project.')
      });
  }

  startEdit(project: Project): void {
    if (project.id === undefined) {
      return;
    }
    this.editingId = project.id;
    this.editDraft = { projectName: project.projectName };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = { projectName: '' };
  }

  update(): void {
    if (this.editingId === null) {
      return;
    }

    const payload = { ...this.editDraft, id: this.editingId };
    this.isLoading = true;
    this.error = '';
    this.projectService
      .update(this.editingId, payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updated) => {
          this.projects = this.projects.map((project) =>
            project.id === this.editingId ? updated : project
          );
          this.cancelEdit();
        },
        error: () => (this.error = 'Failed to update project.')
      });
  }

  delete(id?: number): void {
    if (id === undefined) {
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.projectService
      .delete(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () =>
          (this.projects = this.projects.filter((project) => project.id !== id)),
        error: () => (this.error = 'Failed to delete project.')
      });
  }
}
