import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { FileRecord } from '../model/file.model';
import { FileService } from '../service/file.service';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './files-view.component.html',
  styleUrl: './files-view.component.scss'
})
export class FilesViewComponent implements OnInit {
  private fileService = inject(FileService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  file = signal<FileRecord | null>(null);
  isLoading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.loadFile(Number(idParam));
        } else {
          this.file.set(null);
        }
      });
  }

  private loadFile(id: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.fileService
      .get(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (file) => this.file.set(file),
        error: () => this.error.set('Failed to load file.')
      });
  }
}
