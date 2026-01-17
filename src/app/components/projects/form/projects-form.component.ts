import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { FileRecord } from '../../files/model/file.model';
import { Owner } from '../../owners/model/owner.model';
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
  owners = signal<Owner[]>([]);
  files = signal<FileRecord[]>([]);
  address = signal<Address | null>(null);
  isEdit = signal(false);
  isLoading = signal(false);
  addressLoading = signal(false);
  ownersLoading = signal(false);
  filesLoading = signal(false);
  relationsError = signal('');
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
          this.resetRelations();
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
        next: (project) => {
          this.draft.set({ ...project });
          if (project.id !== undefined) {
            this.loadRelations(project.id);
          } else {
            this.resetRelations();
          }
        },
        error: () => {
          this.error.set('Failed to load project.');
          this.resetRelations();
        }
      });
  }

  private loadRelations(id: number): void {
    this.relationsError.set('');

    this.ownersLoading.set(true);
    this.projectService
      .getOwners(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.ownersLoading.set(false))
      )
      .subscribe((owners) => this.owners.set(owners));

    this.filesLoading.set(true);
    this.projectService
      .getFiles(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.filesLoading.set(false))
      )
      .subscribe((files) => this.files.set(files));

    this.addressLoading.set(true);
    this.projectService
      .getAddress(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        }),
        finalize(() => this.addressLoading.set(false))
      )
      .subscribe((address) => this.address.set(address));
  }

  private resetRelations(): void {
    this.owners.set([]);
    this.files.set([]);
    this.address.set(null);
    this.addressLoading.set(false);
    this.ownersLoading.set(false);
    this.filesLoading.set(false);
    this.relationsError.set('');
  }

  updateProjectName(projectName: string): void {
    this.draft.update((draft) => ({ ...draft, projectName }));
  }
}
