import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

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
  private fileService = inject(FileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  draft = signal<FileRecord>({ filename: '', path: '', projectId: null });
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
          this.loadFile(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set({ filename: '', path: '', projectId: null });
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
          this.draft.set({
            ...file,
            projectId: file.projectId ?? null
          }),
        error: () => this.error.set('Failed to load file.')
      });
  }

  updateFilename(filename: string): void {
    this.draft.update((draft) => ({ ...draft, filename }));
  }

  updatePath(path: string): void {
    this.draft.update((draft) => ({ ...draft, path }));
  }
}
