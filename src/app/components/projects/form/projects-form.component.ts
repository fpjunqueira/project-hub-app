import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { Project } from '../model/project.model';
import { ProjectService } from '../service/project.service';

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
  private destroyRef = inject(DestroyRef);

  draft = signal<Project>({ projectName: '' });
  isEdit = signal(false);
  isLoading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit.set(true);
          this.loadProject(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set({ projectName: '' });
        }
      });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft.projectName.trim()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isEdit() && draft.id !== undefined
      ? this.projectService.update(draft.id, draft)
      : this.projectService.create(draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () =>
        this.error.set(
          this.isEdit() ? 'Failed to update project.' : 'Failed to create project.'
        )
    });
  }

  private loadProject(id: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.projectService
      .get(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (project) => this.draft.set({ ...project }),
        error: () => this.error.set('Failed to load project.')
      });
  }

  updateProjectName(projectName: string): void {
    this.draft.update((draft) => ({ ...draft, projectName }));
  }
}
