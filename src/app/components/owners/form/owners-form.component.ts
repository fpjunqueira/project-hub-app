import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Owner } from '../model/owner.model';
import { OwnerService } from '../service/owner.service';

@Component({
  selector: 'app-owners-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './owners-form.component.html',
  styleUrl: './owners-form.component.scss'
})
export class OwnersFormComponent implements OnInit {
  private ownerService = inject(OwnerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  draft: Owner = { name: '', email: '' };
  isEdit = false;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.loadOwner(Number(idParam));
    }
  }

  submit(): void {
    if (!this.draft.name.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const request = this.isEdit && this.draft.id !== undefined
      ? this.ownerService.update(this.draft.id, this.draft)
      : this.ownerService.create(this.draft);

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => this.router.navigate(['/owners']),
      error: () =>
        (this.error = this.isEdit ? 'Failed to update owner.' : 'Failed to create owner.')
    });
  }

  private loadOwner(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.ownerService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (owner) => (this.draft = { ...owner }),
        error: () => (this.error = 'Failed to load owner.')
      });
  }
}
