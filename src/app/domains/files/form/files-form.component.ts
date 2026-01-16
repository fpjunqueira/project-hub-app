import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { FileRecord } from '../../shared/models';
import { FileService } from '../file.service';

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

  draft: FileRecord = { filename: '', path: '', projectId: null };
  isEdit = false;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.loadFile(Number(idParam));
    }
  }

  submit(): void {
    if (!this.draft.filename.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const request = this.isEdit && this.draft.id !== undefined
      ? this.fileService.update(this.draft.id, this.draft)
      : this.fileService.create(this.draft);

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => this.router.navigate(['/files']),
      error: () =>
        (this.error = this.isEdit ? 'Failed to update file.' : 'Failed to create file.')
    });
  }

  private loadFile(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.fileService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (file) =>
          (this.draft = {
            ...file,
            projectId: file.projectId ?? null
          }),
        error: () => (this.error = 'Failed to load file.')
      });
  }
}
