import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Address } from '../../shared/models';
import { AddressService } from '../address.service';

@Component({
  selector: 'app-addresses-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses-crud.component.html',
  styleUrl: './addresses-crud.component.scss'
})
export class AddressesCrudComponent implements OnInit {
  private addressService = inject(AddressService);

  addresses: Address[] = [];
  draft: Address = { street: '', city: '', state: '', number: '', zipCode: '' };
  editDraft: Address = {
    street: '',
    city: '',
    state: '',
    number: '',
    zipCode: ''
  };
  editingId: number | null = null;
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

  create(): void {
    if (!this.draft.street.trim()) {
      return;
    }

    const payload = { ...this.draft };
    this.isLoading = true;
    this.error = '';
    this.addressService
      .create(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created) => {
          this.addresses = [...this.addresses, created];
          this.draft = {
            street: '',
            city: '',
            state: '',
            number: '',
            zipCode: ''
          };
        },
        error: () => (this.error = 'Failed to create address.')
      });
  }

  startEdit(address: Address): void {
    if (address.id === undefined) {
      return;
    }
    this.editingId = address.id;
    this.editDraft = {
      street: address.street,
      city: address.city,
      state: address.state,
      number: address.number,
      zipCode: address.zipCode
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = {
      street: '',
      city: '',
      state: '',
      number: '',
      zipCode: ''
    };
  }

  update(): void {
    if (this.editingId === null) {
      return;
    }

    const payload = { ...this.editDraft, id: this.editingId };
    this.isLoading = true;
    this.error = '';
    this.addressService
      .update(this.editingId, payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updated) => {
          this.addresses = this.addresses.map((address) =>
            address.id === this.editingId ? updated : address
          );
          this.cancelEdit();
        },
        error: () => (this.error = 'Failed to update address.')
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
