import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Owner } from '../model/owner.model';
import { OwnerService } from '../service/owner.service';

@Component({
  selector: 'app-owners-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owners-list.component.html',
  styleUrl: './owners-list.component.scss'
})
export class OwnersListComponent implements OnInit {
  private ownerService = inject(OwnerService);

  owners = signal<Owner[]>([]);
  isLoading = signal(false);
  deletingIds = signal<Set<number>>(new Set<number>());
  error = signal('');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.ownerService
      .list()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (owners) => this.owners.set(owners),
        error: () => this.error.set('Failed to load owners.')
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
    this.ownerService
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
        next: () => this.owners.update((owners) => owners.filter((owner) => owner.id !== id)),
        error: () => this.error.set('Failed to delete owner.')
      });
  }

  isDeleting(id?: number): boolean {
    return id !== undefined && this.deletingIds().has(id);
  }
}
