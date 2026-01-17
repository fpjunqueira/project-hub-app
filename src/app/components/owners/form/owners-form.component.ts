import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { Project } from '../../projects/model/project.model';
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
  private destroyRef = inject(DestroyRef);

  draft = signal<Owner>({ name: '', email: '' });
  address = signal<Address | null>(null);
  projects = signal<Project[]>([]);
  isEdit = signal(false);
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
          this.isEdit.set(true);
          this.loadOwner(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set({ name: '', email: '' });
          this.resetRelations();
        }
      });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft.name.trim()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isEdit() && draft.id !== undefined
      ? this.ownerService.update(draft.id, draft)
      : this.ownerService.create(draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => this.router.navigate(['/owners']),
      error: () =>
        this.error.set(this.isEdit() ? 'Failed to update owner.' : 'Failed to create owner.')
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
          this.draft.set({ ...owner });
          if (owner.id !== undefined) {
            this.loadRelations(owner.id);
          } else {
            this.resetRelations();
          }
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

  updateName(name: string): void {
    this.draft.update((draft) => ({ ...draft, name }));
  }

  updateEmail(email: string): void {
    this.draft.update((draft) => ({ ...draft, email }));
  }
}
