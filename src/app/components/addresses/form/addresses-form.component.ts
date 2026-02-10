import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Owner } from '../../owners/model/owner.model';
import { Project } from '../../projects/model/project.model';
import { Address } from '../model/address.model';
import { AddressService } from '../service/address.service';

@Component({
  selector: 'app-addresses-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './addresses-form.component.html',
  styleUrl: './addresses-form.component.scss'
})
export class AddressesFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  draft = signal<Address>({ street: '', city: '', state: '', number: '', zipCode: '' });
  owner = signal<Owner | null>(null);
  project = signal<Project | null>(null);
  isEdit = signal(false);
  isLoading = signal(false);
  ownerLoading = signal(false);
  projectLoading = signal(false);
  relationsError = signal('');
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit.set(true);
          this.loadAddress(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set({ street: '', city: '', state: '', number: '', zipCode: '' });
          this.resetRelations();
        }
      });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft.street.trim()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isEdit() && draft.id !== undefined
      ? this.addressService.update(draft.id, draft)
      : this.addressService.create(draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => this.router.navigate(['/addresses']),
      error: () =>
        this.error.set(
          this.isEdit() ? 'Failed to update address.' : 'Failed to create address.'
        )
    });
  }

  private loadAddress(id: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.addressService
      .get(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (address) => {
          this.draft.set({ ...address });
          if (address.id !== undefined) {
            this.loadRelations(address.id);
          } else {
            this.resetRelations();
          }
        },
        error: () => {
          this.error.set('Failed to load address.');
          this.resetRelations();
        }
      });
  }

  private loadRelations(id: number): void {
    this.relationsError.set('');

    this.ownerLoading.set(true);
    this.addressService
      .getOwner(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        }),
        finalize(() => this.ownerLoading.set(false))
      )
      .subscribe((owner) => this.owner.set(owner));

    this.projectLoading.set(true);
    this.addressService
      .getProject(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        }),
        finalize(() => this.projectLoading.set(false))
      )
      .subscribe((project) => this.project.set(project));
  }

  private resetRelations(): void {
    this.owner.set(null);
    this.project.set(null);
    this.ownerLoading.set(false);
    this.projectLoading.set(false);
    this.relationsError.set('');
  }

  updateStreet(street: string): void {
    this.draft.update((draft) => ({ ...draft, street }));
  }

  updateCity(city: string): void {
    this.draft.update((draft) => ({ ...draft, city }));
  }

  updateState(state: string): void {
    this.draft.update((draft) => ({ ...draft, state }));
  }

  updateNumber(number: string): void {
    this.draft.update((draft) => ({ ...draft, number }));
  }

  updateZipCode(zipCode: string): void {
    this.draft.update((draft) => ({ ...draft, zipCode }));
  }
}
