import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Owner } from '../../owners/model/owner.model';
import { Project } from '../../projects/model/project.model';
import { Address } from '../model/address.model';
import { AddressService } from '../service/address.service';

@Component({
  selector: 'app-addresses-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './addresses-view.component.html',
  styleUrl: './addresses-view.component.scss'
})
export class AddressesViewComponent implements OnInit {
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  address = signal<Address | null>(null);
  owner = signal<Owner | null>(null);
  project = signal<Project | null>(null);
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
          this.loadAddress(Number(idParam));
        } else {
          this.address.set(null);
          this.resetRelations();
        }
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
          this.address.set(address);
          this.loadRelations(id);
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
}
