import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

  address: Address | null = null;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadAddress(Number(idParam));
    }
  }

  private loadAddress(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.addressService
      .get(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (address) => (this.address = address),
        error: () => (this.error = 'Failed to load address.')
      });
  }
}
