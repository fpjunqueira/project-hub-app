import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { Project } from '../../shared/models';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-projects-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './projects-form.component.html',
  styleUrl: './projects-form.component.scss'
})
export class ProjectsFormComponent implements OnInit {
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  draft: Project = { projectName: '' };
  isEdit = false;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.loadProject(Number(idParam));
    }
  }

  submit(): void {
    if (!this.draft.projectName.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const request = this.isEdit && this.draft.id !== undefined
      ? this.projectService.update(this.draft.id, this.draft)
      : this.projectService.create(this.draft);

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () =>
        (this.error = this.isEdit ? 'Failed to update project.' : 'Failed to create project.')
    });
  }

  private loadProject(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.projectService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (project) => (this.draft = { ...project }),
        error: () => (this.error = 'Failed to load project.')
      });
  }
}
