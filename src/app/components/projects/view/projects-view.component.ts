import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Project } from '../model/project.model';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-projects-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects-view.component.html',
  styleUrl: './projects-view.component.scss'
})
export class ProjectsViewComponent implements OnInit {
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);

  project: Project | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadProject(Number(idParam));
    }
  }

  private loadProject(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.projectService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (project) => (this.project = project),
        error: () => (this.error = 'Failed to load project.')
      });
  }
}
