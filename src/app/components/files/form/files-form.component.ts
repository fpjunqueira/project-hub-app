import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Project } from '../../projects/model/project.model';
import { FileRecord } from '../model/file.model';
import { FileService } from '../service/file.service';

@Component({
  selector: 'app-files-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './files-form.component.html',
  styleUrl: './files-form.component.scss'
})
export class FilesFormComponent implements OnInit {
  private fileService = inject(FileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  draft = signal<FileRecord>({ filename: '', path: '', projectId: null });
  project = signal<Project | null>(null);
  isEdit = signal(false);
  isLoading = signal(false);
  projectLoading = signal(false);
  relationsError = signal('');
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit.set(true);
          this.loadFile(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set({ filename: '', path: '', projectId: null });
          this.resetRelations();
        }
      });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft.filename.trim()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isEdit() && draft.id !== undefined
      ? this.fileService.update(draft.id, draft)
      : this.fileService.create(draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => this.router.navigate(['/files']),
      error: () =>
        this.error.set(this.isEdit() ? 'Failed to update file.' : 'Failed to create file.')
    });
  }

  private loadFile(id: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.fileService
      .get(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (file) =>
          this.handleFileLoad(file),
        error: () => {
          this.error.set('Failed to load file.');
          this.resetRelations();
        }
      });
  }

  private handleFileLoad(file: FileRecord): void {
    this.draft.set({
      ...file,
      projectId: file.projectId ?? null
    });

    if (file.id !== undefined) {
      this.loadRelations(file.id);
    } else {
      this.resetRelations();
    }
  }

  private loadRelations(id: number): void {
    this.projectLoading.set(true);
    this.relationsError.set('');

    this.fileService
      .getProject(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        }),
        finalize(() => this.projectLoading.set(false))
      )
      .subscribe((project) => this.project.set(project));
  }

  private resetRelations(): void {
    this.project.set(null);
    this.projectLoading.set(false);
    this.relationsError.set('');
  }

  updateFilename(filename: string): void {
    this.draft.update((draft) => ({ ...draft, filename }));
  }

  updatePath(path: string): void {
    this.draft.update((draft) => ({ ...draft, path }));
  }
}
