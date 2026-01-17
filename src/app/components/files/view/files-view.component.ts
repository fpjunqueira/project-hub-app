import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Project } from '../../projects/model/project.model';
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
  project = signal<Project | null>(null);
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
          this.loadFile(Number(idParam));
        } else {
          this.file.set(null);
          this.resetRelations();
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
        next: (file) => {
          this.file.set(file);
          if (file.id !== undefined) {
            this.loadRelations(file.id);
          } else {
            this.resetRelations();
          }
        },
        error: () => {
          this.error.set('Failed to load file.');
          this.resetRelations();
        }
      });
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
}
