import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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

  addresses: Address[] = [];
  isLoading = false;
  error = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading = true;
    this.error = '';
    this.addressService
      .list()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (addresses) => (this.addresses = addresses),
        error: () => (this.error = 'Failed to load addresses.')
      });
  }

  delete(id?: number): void {
    if (id === undefined) {
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.addressService
      .delete(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () =>
          (this.addresses = this.addresses.filter((address) => address.id !== id)),
        error: () => (this.error = 'Failed to delete address.')
      });
  }
}
