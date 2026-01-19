import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './files-form.component.html',
  styleUrl: './files-form.component.scss'
})
export class FilesFormComponent implements OnInit {
  private readonly fileService = inject(FileService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  draft = signal<FileRecord>({ filename: '', path: '', projectId: null });
  isDragging = signal(false);
  isUploading = signal(false);
  uploadError = signal('');
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
    const filename = draft.filename.trim();
    if (filename.length === 0) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const recordId = draft.id;
    const request = recordId === undefined
      ? this.fileService.create(draft)
      : this.fileService.update(recordId, draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        void this.router.navigate(['/files']);
      },
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

    const fileId = file.id;
    if (fileId === undefined) {
      this.resetRelations();
    } else {
      this.loadRelations(fileId);
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

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    if (this.isUploading()) {
      return;
    }

    this.isUploading.set(true);
    this.uploadError.set('');

    const draft = this.draft();
    const recordId = draft.id;
    const request = recordId === undefined
      ? this.fileService.upload(file, draft.projectId)
      : this.fileService.replaceFile(recordId, file);

    request.pipe(finalize(() => this.isUploading.set(false))).subscribe({
      next: (saved) =>
        this.draft.set({
          ...saved,
          projectId: saved.projectId ?? null
        }),
      error: () => this.uploadError.set('Failed to upload file.')
    });
  }
}
