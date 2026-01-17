import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Address } from '../../addresses/model/address.model';
import { AddressService } from '../../addresses/service/address.service';
import { FileRecord } from '../../files/model/file.model';
import { FileService } from '../../files/service/file.service';
import { Owner } from '../../owners/model/owner.model';
import { OwnerService } from '../../owners/service/owner.service';
import { Project } from '../model/project.model';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-projects-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './projects-form.component.html',
  styleUrl: './projects-form.component.scss'
})
export class ProjectsFormComponent implements OnInit {
  private projectService = inject(ProjectService);
  private addressService = inject(AddressService);
  private ownerService = inject(OwnerService);
  private fileService = inject(FileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  draft = signal<Project>({ projectName: '' });
  owners = signal<Owner[]>([]);
  files = signal<FileRecord[]>([]);
  addresses = signal<Address[]>([]);
  address = signal<Address | null>(null);
  selectedOwnerIds = signal<number[]>([]);
  selectedFileIds = signal<number[]>([]);
  selectedAddressId = signal<number | null>(null);
  selectedOwners = signal<Owner[]>([]);
  selectedFiles = signal<FileRecord[]>([]);
  isEdit = signal(false);
  isLoading = signal(false);
  addressLoading = signal(false);
  ownersLoading = signal(false);
  filesLoading = signal(false);
  relationsError = signal('');
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit.set(true);
          this.loadProject(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set({ projectName: '' });
          this.resetRelations();
        }
      });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft.projectName.trim()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const payload = this.isEdit()
      ? this.buildUpdatePayload(draft)
      : draft;
    const request = this.isEdit() && draft.id !== undefined
      ? this.projectService.update(draft.id, payload)
      : this.projectService.create(payload);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () =>
        this.error.set(
          this.isEdit() ? 'Failed to update project.' : 'Failed to create project.'
        )
    });
  }

  private loadProject(id: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.projectService
      .get(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (project) => {
          this.draft.set({ ...project });
          if (project.id !== undefined) {
            this.loadRelations(project.id);
          } else {
            this.resetRelations();
          }
        },
        error: () => {
          this.error.set('Failed to load project.');
          this.resetRelations();
        }
      });
  }

  private loadRelations(id: number): void {
    this.relationsError.set('');

    this.ownersLoading.set(true);
    this.ownerService
      .list()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.ownersLoading.set(false))
      )
      .subscribe((owners) => this.owners.set(owners));

    this.projectService
      .getOwners(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        })
      )
      .subscribe((owners) => {
        const ids = owners
          .map((owner) => owner.id)
          .filter((ownerId): ownerId is number => ownerId !== undefined);
        this.selectedOwners.set(owners);
        this.selectedOwnerIds.set(ids);
      });

    this.filesLoading.set(true);
    this.fileService
      .list()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.filesLoading.set(false))
      )
      .subscribe((files) => this.files.set(files));

    this.projectService
      .getFiles(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        })
      )
      .subscribe((files) => {
        const ids = files
          .map((file) => file.id)
          .filter((fileId): fileId is number => fileId !== undefined);
        this.selectedFiles.set(files);
        this.selectedFileIds.set(ids);
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

    this.projectService
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

  private resetRelations(): void {
    this.owners.set([]);
    this.files.set([]);
    this.addresses.set([]);
    this.address.set(null);
    this.selectedOwnerIds.set([]);
    this.selectedFileIds.set([]);
    this.selectedAddressId.set(null);
    this.selectedOwners.set([]);
    this.selectedFiles.set([]);
    this.addressLoading.set(false);
    this.ownersLoading.set(false);
    this.filesLoading.set(false);
    this.relationsError.set('');
  }

  private buildUpdatePayload(project: Project): Project {
    const selectedOwners = this.owners().length
      ? this.owners().filter((owner) =>
          owner.id !== undefined && this.selectedOwnerIds().includes(owner.id)
        )
      : this.selectedOwners();
    const selectedFiles = this.files().length
      ? this.files().filter((file) =>
          file.id !== undefined && this.selectedFileIds().includes(file.id)
        )
      : this.selectedFiles();
    const selectedAddressId = this.selectedAddressId();
    const selectedAddress = selectedAddressId !== null
      ? this.addresses().find((address) => address.id === selectedAddressId) ?? this.address()
      : null;

    return {
      ...project,
      owners: selectedOwners,
      files: selectedFiles,
      address: selectedAddress ?? null
    };
  }

  updateProjectName(projectName: string): void {
    this.draft.update((draft) => ({ ...draft, projectName }));
  }

  updateSelectedOwners(selected: Array<number | string> | null): void {
    const ids = Array.isArray(selected)
      ? selected.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [];
    this.selectedOwnerIds.set(ids);
  }

  updateSelectedFiles(selected: Array<number | string> | null): void {
    const ids = Array.isArray(selected)
      ? selected.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [];
    this.selectedFileIds.set(ids);
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
