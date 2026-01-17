import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { AddressService } from '../../addresses/service/address.service';
import { Project } from '../../projects/model/project.model';
import { ProjectService } from '../../projects/service/project.service';
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
  private addressService = inject(AddressService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  draft = signal<Owner>({ name: '', email: '' });
  address = signal<Address | null>(null);
  projects = signal<Project[]>([]);
  selectedProjects = signal<Project[]>([]);
  addresses = signal<Address[]>([]);
  selectedProjectIds = signal<number[]>([]);
  selectedAddressId = signal<number | null>(null);
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
          this.loadRelationsForCreate();
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

    const payload = this.buildUpdatePayload(draft);
    const request = this.isEdit() && draft.id !== undefined
      ? this.ownerService.update(draft.id, payload)
      : this.ownerService.create(payload);

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
    this.projectService
      .list()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.projectsLoading.set(false))
      )
      .subscribe((projects) => this.projects.set(projects));

    this.ownerService
      .getProjects(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        })
      )
      .subscribe((projects) => {
        const ids = projects
          .map((project) => project.id)
          .filter((projectId): projectId is number => projectId !== undefined);
        this.selectedProjects.set(projects);
        this.selectedProjectIds.set(ids);
      });

    this.addressLoading.set(true);
    this.addressService
      .list()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.addressLoading.set(false))
      )
      .subscribe((addresses) => this.addresses.set(addresses));

    this.ownerService
      .getAddress(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        })
      )
      .subscribe((address) => {
        this.address.set(address);
        this.selectedAddressId.set(address?.id ?? null);
      });
  }

  private loadRelationsForCreate(): void {
    this.relationsError.set('');

    this.projectsLoading.set(true);
    this.projectService
      .list()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.projectsLoading.set(false))
      )
      .subscribe((projects) => this.projects.set(projects));

    this.addressLoading.set(true);
    this.addressService
      .list()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.addressLoading.set(false))
      )
      .subscribe((addresses) => this.addresses.set(addresses));
  }

  private resetRelations(): void {
    this.address.set(null);
    this.projects.set([]);
    this.selectedProjects.set([]);
    this.addresses.set([]);
    this.selectedProjectIds.set([]);
    this.selectedAddressId.set(null);
    this.addressLoading.set(false);
    this.projectsLoading.set(false);
    this.relationsError.set('');
  }

  private buildUpdatePayload(owner: Owner): Owner {
    const selectedProjects = this.projects().length
      ? this.projects().filter((project) =>
          project.id !== undefined && this.selectedProjectIds().includes(project.id)
        )
      : this.selectedProjects();
    const selectedAddressId = this.selectedAddressId();
    const selectedAddress = selectedAddressId !== null
      ? this.addresses().find((address) => address.id === selectedAddressId) ?? this.address()
      : null;

    return {
      ...owner,
      address: selectedAddress ?? null,
      projects: selectedProjects
    };
  }

  updateName(name: string): void {
    this.draft.update((draft) => ({ ...draft, name }));
  }

  updateEmail(email: string): void {
    this.draft.update((draft) => ({ ...draft, email }));
  }

  updateSelectedProjects(selected: Array<number | string> | null): void {
    const ids = Array.isArray(selected)
      ? selected.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [];
    this.selectedProjectIds.set(ids);
  }

  updateSelectedAddress(selected: number | string | null): void {
    if (selected === null || selected === '') {
      this.selectedAddressId.set(null);
      return;
    }

    const id = Number(selected);
    this.selectedAddressId.set(Number.isFinite(id) ? id : null);
  }
}
