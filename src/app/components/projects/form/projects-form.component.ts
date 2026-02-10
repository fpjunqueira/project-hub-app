import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
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

interface ContractRegistration {
  id?: number;
  directClient?: string;
  directClientManager?: string;
  finalClient?: string;
  finalClientManager?: string;
  projectType?: string;
  projectNumber?: string;
  purchaseOrder?: string;
  serviceOrder?: string;
  poNumber?: string;
  siteId?: string;
  addressId?: string;
}

@Component({
  selector: 'app-projects-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects-form.component.html',
  styleUrl: './projects-form.component.scss'
})
export class ProjectsFormComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly http = inject(HttpClient);
  private readonly addressService = inject(AddressService);
  private readonly ownerService = inject(OwnerService);
  private readonly fileService = inject(FileService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  draft = signal<Project>({ projectName: '' });
  contractRegistrations = signal<ContractRegistration[]>([]);
  selectedContractId = signal<number | null>(null);
  owners = signal<Owner[]>([]);
  files = signal<FileRecord[]>([]);
  addresses = signal<Address[]>([]);
  address = signal<Address | null>(null);
  selectedOwnerIds = signal<number[]>([]);
  selectedFileIds = signal<number[]>([]);
  selectedAddressId = signal<number | null>(null);
  selectedOwners = signal<Owner[]>([]);
  selectedFiles = signal<FileRecord[]>([]);
  contractLoading = signal(false);
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
          this.loadRelationsForCreate();
        }
      });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft.projectName.trim()) {
      return;
    }

    if (!this.canSubmit()) {
      this.error.set('Complete contract registrations before creating a project.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const payload = this.buildUpdatePayload(draft);
    const request = this.isEdit() && draft.id !== undefined
      ? this.projectService.update(draft.id, payload)
      : this.projectService.create(payload);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        void this.router.navigate(['/projects']);
      },
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
          const projectId = project.id;
          if (projectId === undefined) {
            this.resetRelations();
            return;
          }
          this.loadRelations(projectId);
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
      .listAll()
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
      .listAll()
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

    this.loadContractRegistrations();

    this.projectService
      .getContract(id)
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of(null);
        })
      )
      .subscribe((contract) => {
        this.selectedContractId.set(contract?.id ?? null);
      });

    this.addressLoading.set(true);
    this.addressService
      .listAll()
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

  private loadRelationsForCreate(): void {
    this.relationsError.set('');

    this.ownersLoading.set(true);
    this.ownerService
      .listAll()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.ownersLoading.set(false))
      )
      .subscribe((owners) => this.owners.set(owners));

    this.filesLoading.set(true);
    this.fileService
      .listAll()
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.filesLoading.set(false))
      )
      .subscribe((files) => this.files.set(files));

    this.loadContractRegistrations();

    this.addressLoading.set(true);
    this.addressService
      .listAll()
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
    this.owners.set([]);
    this.files.set([]);
    this.addresses.set([]);
    this.address.set(null);
    this.selectedOwnerIds.set([]);
    this.selectedFileIds.set([]);
    this.selectedAddressId.set(null);
    this.selectedOwners.set([]);
    this.selectedFiles.set([]);
    this.contractRegistrations.set([]);
    this.selectedContractId.set(null);
    this.contractLoading.set(false);
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
    let selectedAddress: Address | null = null;
    if (selectedAddressId !== null) {
      selectedAddress = this.addresses().find((address) => address.id === selectedAddressId) ?? this.address();
    }

    return {
      ...project,
      owners: selectedOwners,
      files: selectedFiles,
      address: selectedAddress ?? null,
      contractRegistration: this.selectedContractId() ? { id: this.selectedContractId() ?? undefined } : null
    };
  }

  private loadContractRegistrations(): void {
    this.contractLoading.set(true);
    this.http
      .get<ContractRegistration[]>('/api/contract-registrations/all')
      .pipe(
        catchError(() => {
          this.relationsError.set('Failed to load related data.');
          return of([]);
        }),
        finalize(() => this.contractLoading.set(false))
      )
      .subscribe((contracts) => this.contractRegistrations.set(contracts));
  }

  updateSelectedContract(contractId: number | string | null): void {
    if (contractId === null || contractId === '') {
      this.selectedContractId.set(null);
      return;
    }
    const id = Number(contractId);
    if (!Number.isFinite(id)) {
      return;
    }
    this.selectedContractId.set(id);
    this.prefillFromContract(id);
  }

  private prefillFromContract(contractId: number): void {
    this.http.get<ContractRegistration>(`/api/contract-registrations/${contractId}`).subscribe({
      next: (contract) => {
        this.draft.update((draft) => ({
          ...draft,
          projectType: contract.projectType ?? draft.projectType ?? '',
          projectNumber: contract.projectNumber ?? draft.projectNumber ?? '',
          purchaseOrder: contract.purchaseOrder ?? draft.purchaseOrder ?? '',
          serviceOrder: contract.serviceOrder ?? draft.serviceOrder ?? '',
          poNumber: contract.poNumber ?? draft.poNumber ?? '',
          directClient: contract.directClient ?? draft.directClient ?? '',
          directClientManager: contract.directClientManager ?? draft.directClientManager ?? '',
          finalClient: contract.finalClient ?? draft.finalClient ?? '',
          finalClientManager: contract.finalClientManager ?? draft.finalClientManager ?? '',
          siteId: contract.siteId ?? draft.siteId ?? '',
          addressId: contract.addressId ?? draft.addressId ?? ''
        }));
      }
    });
  }

  updateProjectName(projectName: string): void {
    this.draft.update((draft) => ({ ...draft, projectName }));
  }

  canSubmit(): boolean {
    return this.contractRegistrations().length > 0 || this.isEdit();
  }

  updateProjectType(projectType: string): void {
    this.draft.update((draft) => ({ ...draft, projectType }));
  }

  updateProjectNumber(projectNumber: string): void {
    this.draft.update((draft) => ({ ...draft, projectNumber }));
  }

  updatePurchaseOrder(purchaseOrder: string): void {
    this.draft.update((draft) => ({ ...draft, purchaseOrder }));
  }

  updateServiceOrder(serviceOrder: string): void {
    this.draft.update((draft) => ({ ...draft, serviceOrder }));
  }

  updatePoNumber(poNumber: string): void {
    this.draft.update((draft) => ({ ...draft, poNumber }));
  }

  updateDirectClient(directClient: string): void {
    this.draft.update((draft) => ({ ...draft, directClient }));
  }

  updateDirectClientManager(directClientManager: string): void {
    this.draft.update((draft) => ({ ...draft, directClientManager }));
  }

  updateFinalClient(finalClient: string): void {
    this.draft.update((draft) => ({ ...draft, finalClient }));
  }

  updateFinalClientManager(finalClientManager: string): void {
    this.draft.update((draft) => ({ ...draft, finalClientManager }));
  }

  updateSiteId(siteId: string): void {
    this.draft.update((draft) => ({ ...draft, siteId }));
  }

  updateAddressId(addressId: string): void {
    this.draft.update((draft) => ({ ...draft, addressId }));
  }

  updateSelectedOwners(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select) {
      this.selectedOwnerIds.set([]);
      return;
    }

    const ids = Array.from(select.selectedOptions)
      .map((option) => Number(option.value))
      .filter((value) => Number.isFinite(value));
    this.selectedOwnerIds.set(ids);
  }

  updateSelectedFiles(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select) {
      this.selectedFileIds.set([]);
      return;
    }

    const ids = Array.from(select.selectedOptions)
      .map((option) => Number(option.value))
      .filter((value) => Number.isFinite(value));
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
