import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { FileRecord } from '../../shared/models';
import { FileService } from '../file.service';

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

  file: FileRecord | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadFile(Number(idParam));
    }
  }

  private loadFile(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.fileService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (file) => (this.file = file),
        error: () => (this.error = 'Failed to load file.')
      });
  }
}
