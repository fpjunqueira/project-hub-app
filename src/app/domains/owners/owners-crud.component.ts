import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Owner } from '../shared/models';
import { OwnerService } from './owner.service';

@Component({
  selector: 'app-owners-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owners-crud.component.html',
  styleUrl: './owners-crud.component.scss'
})
export class OwnersCrudComponent implements OnInit {
  private ownerService = inject(OwnerService);

  owners: Owner[] = [];
  draft: Owner = { name: '', email: '' };
  editDraft: Owner = { name: '', email: '' };
  editingId: number | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading = true;
    this.error = '';
    this.ownerService
      .list()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (owners) => (this.owners = owners),
        error: () => (this.error = 'Failed to load owners.')
      });
  }

  create(): void {
    if (!this.draft.name.trim()) {
      return;
    }

    const payload = { ...this.draft };
    this.isLoading = true;
    this.error = '';
    this.ownerService
      .create(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created) => {
          this.owners = [...this.owners, created];
          this.draft = { name: '', email: '' };
        },
        error: () => (this.error = 'Failed to create owner.')
      });
  }

  startEdit(owner: Owner): void {
    if (owner.id === undefined) {
      return;
    }
    this.editingId = owner.id;
    this.editDraft = { name: owner.name, email: owner.email };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = { name: '', email: '' };
  }

  update(): void {
    if (this.editingId === null) {
      return;
    }

    const payload = { ...this.editDraft, id: this.editingId };
    this.isLoading = true;
    this.error = '';
    this.ownerService
      .update(this.editingId, payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updated) => {
          this.owners = this.owners.map((owner) =>
            owner.id === this.editingId ? updated : owner
          );
          this.cancelEdit();
        },
        error: () => (this.error = 'Failed to update owner.')
      });
  }

  delete(id?: number): void {
    if (id === undefined) {
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.ownerService
      .delete(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => (this.owners = this.owners.filter((owner) => owner.id !== id)),
        error: () => (this.error = 'Failed to delete owner.')
      });
  }
}
