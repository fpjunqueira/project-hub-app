import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { Project } from '../../shared/models';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss'
})
export class ProjectsListComponent implements OnInit {
  private projectService = inject(ProjectService);

  projects: Project[] = [];
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
