import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { Owner } from '../../shared/models';
import { OwnerService } from '../owner.service';

@Component({
  selector: 'app-owners-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owners-view.component.html',
  styleUrl: './owners-view.component.scss'
})
export class OwnersViewComponent implements OnInit {
  private ownerService = inject(OwnerService);
  private route = inject(ActivatedRoute);

  owner: Owner | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadOwner(Number(idParam));
    }
  }

  private loadOwner(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.ownerService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (owner) => (this.owner = owner),
        error: () => (this.error = 'Failed to load owner.')
      });
  }
}
