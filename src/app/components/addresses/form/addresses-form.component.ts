import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { Address } from '../model/address.model';
import { AddressService } from '../service/address.service';

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
  private destroyRef = inject(DestroyRef);

  draft = signal<Address>({ street: '', city: '', state: '', number: '', zipCode: '' });
  isEdit = signal(false);
  isLoading = signal(false);
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
        next: (address) => this.draft.set({ ...address }),
        error: () => this.error.set('Failed to load address.')
      });
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
