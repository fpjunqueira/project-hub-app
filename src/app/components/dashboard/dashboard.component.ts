import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AddressService } from '../addresses/service/address.service';
import { OwnerService } from '../owners/service/owner.service';
import { ProjectService } from '../projects/service/project.service';
import { TelecomService } from '../telecom/service/telecom.service';

const TICKETS_BASE_URL = '/api/tickets';
const CONTRACT_REGISTRATIONS_BASE_URL = '/api/contract-registrations';
const BILLINGS_BASE_URL = '/api/billings';

function totalFromResponse(r: { totalElements?: number; page?: { totalElements?: number } } | unknown[]): number {
  if (Array.isArray(r)) return r.length;
  const page = (r as { page?: { totalElements?: number } })?.page;
  return (r as { totalElements?: number })?.totalElements ?? page?.totalElements ?? 0;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly telecomService = inject(TelecomService);
  private readonly ownerService = inject(OwnerService);
  private readonly addressService = inject(AddressService);
  private readonly destroyRef = inject(DestroyRef);

  projectsCount = signal<number | null>(null);
  ticketsCount = signal<number | null>(null);
  clientsCount = signal<number | null>(null);
  contractRegistrationsCount = signal<number | null>(null);
  addressesCount = signal<number | null>(null);
  billingsCount = signal<number | null>(null);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadCounts();
  }

  private loadCounts(): void {
    this.isLoading.set(true);
    this.error.set('');

    forkJoin({
      projects: this.projectService.list(0, 1),
      tickets: this.telecomService.list(TICKETS_BASE_URL, 0, 1),
      owners: this.ownerService.list(0, 1),
      contractRegistrations: this.telecomService.list(CONTRACT_REGISTRATIONS_BASE_URL, 0, 1),
      addresses: this.addressService.list(0, 1),
      billings: this.telecomService.list(BILLINGS_BASE_URL, 0, 1)
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.projectsCount.set(totalFromResponse(data.projects));
          this.ticketsCount.set(totalFromResponse(data.tickets));
          this.clientsCount.set(totalFromResponse(data.owners));
          this.contractRegistrationsCount.set(totalFromResponse(data.contractRegistrations));
          this.addressesCount.set(totalFromResponse(data.addresses));
          this.billingsCount.set(totalFromResponse(data.billings));
        },
        error: () => this.error.set('Failed to load dashboard data.')
      });
  }
}
