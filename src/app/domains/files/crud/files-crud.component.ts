import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { FileRecord } from '../../shared/models';
import { FileService } from '../file.service';

@Component({
  selector: 'app-files-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './files-crud.component.html',
  styleUrl: './files-crud.component.scss'
})
export class FilesCrudComponent implements OnInit {
  private fileService = inject(FileService);

  files: FileRecord[] = [];
  draft: FileRecord = { filename: '', path: '', projectId: null };
  editDraft: FileRecord = { filename: '', path: '', projectId: null };
  editingId: number | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading = true;
    this.error = '';
    this.fileService
      .list()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (files) => (this.files = files),
        error: () => (this.error = 'Failed to load files.')
      });
  }

  create(): void {
    if (!this.draft.filename.trim()) {
      return;
    }

    const payload = { ...this.draft };
    this.isLoading = true;
    this.error = '';
    this.fileService
      .create(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created) => {
          this.files = [...this.files, created];
          this.draft = { filename: '', path: '', projectId: null };
        },
        error: () => (this.error = 'Failed to create file.')
      });
  }

  startEdit(file: FileRecord): void {
    if (file.id === undefined) {
      return;
    }
    this.editingId = file.id;
    this.editDraft = {
      filename: file.filename,
      path: file.path,
      projectId: file.projectId ?? null
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = { filename: '', path: '', projectId: null };
  }

  update(): void {
    if (this.editingId === null) {
      return;
    }

    const payload = { ...this.editDraft, id: this.editingId };
    this.isLoading = true;
    this.error = '';
    this.fileService
      .update(this.editingId, payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updated) => {
          this.files = this.files.map((file) =>
            file.id === this.editingId ? updated : file
          );
          this.cancelEdit();
        },
        error: () => (this.error = 'Failed to update file.')
      });
  }

  delete(id?: number): void {
    if (id === undefined) {
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.fileService
      .delete(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => (this.files = this.files.filter((file) => file.id !== id)),
        error: () => (this.error = 'Failed to delete file.')
      });
  }
}
