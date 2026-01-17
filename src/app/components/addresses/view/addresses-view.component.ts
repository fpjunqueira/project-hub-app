import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

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
  isLoading = signal(false);
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
        next: (address) => this.address.set(address),
        error: () => this.error.set('Failed to load address.')
      });
  }
}
