import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { FileRecord } from '../model/file.model';
import { FileService } from '../service/file.service';

@Component({
  selector: 'app-files-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './files-list.component.html',
  styleUrl: './files-list.component.scss'
})
export class FilesListComponent implements OnInit {
  private fileService = inject(FileService);

  files = signal<FileRecord[]>([]);
  isLoading = signal(false);
  deletingIds = signal<Set<number>>(new Set<number>());
  error = signal('');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.fileService
      .list()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (files) => this.files.set(files),
        error: () => this.error.set('Failed to load files.')
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
    this.fileService
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
        next: () => this.files.update((files) => files.filter((file) => file.id !== id)),
        error: () => this.error.set('Failed to delete file.')
      });
  }

  isDeleting(id?: number): boolean {
    return id !== undefined && this.deletingIds().has(id);
  }
}
