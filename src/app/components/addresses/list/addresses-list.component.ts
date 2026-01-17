import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Address } from '../model/address.model';
import { AddressService } from '../service/address.service';

@Component({
  selector: 'app-addresses-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './addresses-list.component.html',
  styleUrl: './addresses-list.component.scss'
})
export class AddressesListComponent implements OnInit {
  private addressService = inject(AddressService);

  addresses = signal<Address[]>([]);
  isLoading = signal(false);
  deletingIds = signal<Set<number>>(new Set<number>());
  error = signal('');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.addressService
      .list()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (addresses) => this.addresses.set(addresses),
        error: () => this.error.set('Failed to load addresses.')
      });
  }

  delete(id?: number): void {
    if (id === undefined) {
      return;
    }

    this.error.set('');
    this.deletingIds.update((ids) => {
      const next = new Set(ids);
      next.add(id);
      return next;
    });
    this.addressService
      .delete(id)
      .pipe(
        finalize(() =>
          this.deletingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(id);
            return next;
          })
        )
      )
      .subscribe({
        next: () =>
          this.addresses.update((addresses) =>
            addresses.filter((address) => address.id !== id)
          ),
        error: () => this.error.set('Failed to delete address.')
      });
  }

  isDeleting(id?: number): boolean {
    return id !== undefined && this.deletingIds().has(id);
  }
}
