import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { Project } from '../../projects/model/project.model';
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
  address = signal<Address | null>(null);
  projects = signal<Project[]>([]);
  isLoading = signal(false);
  addressLoading = signal(false);
  projectsLoading = signal(false);
  relationsError = signal('');
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
          this.resetRelations();
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
        next: (owner) => {
          this.owner.set(owner);
          this.loadRelations(id);
        },
        error: () => {
          this.error.set('Failed to load owner.');
          this.resetRelations();
        }
      });
  }

  private loadRelations(id: number): void {
    this.relationsError.set('');

    this.projectsLoading.set(true);
    this.ownerService
      .getProjects(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.projectsLoading.set(false))
      )
      .subscribe((projects) => this.projects.set(projects));

    this.addressLoading.set(true);
    this.ownerService
      .getAddress(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        }),
        finalize(() => this.addressLoading.set(false))
      )
      .subscribe((address) => this.address.set(address));
  }

  private resetRelations(): void {
    this.address.set(null);
    this.projects.set([]);
    this.addressLoading.set(false);
    this.projectsLoading.set(false);
    this.relationsError.set('');
  }
}
