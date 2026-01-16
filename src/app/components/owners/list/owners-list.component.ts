import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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

  owners: Owner[] = [];
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
