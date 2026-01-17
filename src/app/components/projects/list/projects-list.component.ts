import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Project } from '../model/project.model';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss'
})
export class ProjectsListComponent implements OnInit {
  private projectService = inject(ProjectService);

  projects = signal<Project[]>([]);
  isLoading = signal(false);
  deletingIds = signal<Set<number>>(new Set<number>());
  error = signal('');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.projectService
      .list()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (projects) => this.projects.set(projects),
        error: () => this.error.set('Failed to load projects.')
      });
  }

  delete(id?: number): void {
    if (id === undefined) {
      return;
    }

    this.error.set('');
    this.deletingIds.update((ids) => {
      const next = new Set(ids);
      next.add(id);
      return next;
    });
    this.projectService
      .delete(id)
      .pipe(
        finalize(() =>
          this.deletingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(id);
            return next;
          })
        )
      )
      .subscribe({
        next: () =>
          this.projects.update((projects) => projects.filter((project) => project.id !== id)),
        error: () => this.error.set('Failed to delete project.')
      });
  }

  isDeleting(id?: number): boolean {
    return id !== undefined && this.deletingIds().has(id);
  }
}
