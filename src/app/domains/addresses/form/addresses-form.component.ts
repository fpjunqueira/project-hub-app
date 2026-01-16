import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { Address } from '../../shared/models';
import { AddressService } from '../address.service';

@Component({
  selector: 'app-addresses-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './addresses-form.component.html',
  styleUrl: './addresses-form.component.scss'
})
export class AddressesFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  draft: Address = { street: '', city: '', state: '', number: '', zipCode: '' };
  isEdit = false;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.loadAddress(Number(idParam));
    }
  }

  submit(): void {
    if (!this.draft.street.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const request = this.isEdit && this.draft.id !== undefined
      ? this.addressService.update(this.draft.id, this.draft)
      : this.addressService.create(this.draft);

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => this.router.navigate(['/addresses']),
      error: () =>
        (this.error = this.isEdit
          ? 'Failed to update address.'
          : 'Failed to create address.')
    });
  }

  private loadAddress(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.addressService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (address) => (this.draft = { ...address }),
        error: () => (this.error = 'Failed to load address.')
      });
  }
}
