import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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

  files: FileRecord[] = [];
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
