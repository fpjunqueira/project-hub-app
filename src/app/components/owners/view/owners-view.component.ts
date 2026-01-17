import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { Owner } from '../model/owner.model';
import { OwnerService } from '../service/owner.service';

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
  private destroyRef = inject(DestroyRef);

  owner = signal<Owner | null>(null);
  isLoading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.loadOwner(Number(idParam));
        } else {
          this.owner.set(null);
        }
      });
  }

  private loadOwner(id: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.ownerService
      .get(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (owner) => this.owner.set(owner),
        error: () => this.error.set('Failed to load owner.')
      });
  }
}
