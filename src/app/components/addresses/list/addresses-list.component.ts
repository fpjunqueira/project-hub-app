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
  pageIndex = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  deletingIds = signal<Set<number>>(new Set<number>());
  error = signal('');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(page = this.pageIndex()): void {
    this.isLoading.set(true);
    this.error.set('');
    this.addressService
      .list(page, this.pageSize())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.addresses.set(response);
            this.pageIndex.set(0);
            this.totalPages.set(response.length ? 1 : 0);
            this.totalElements.set(response.length);
            return;
          }

          const pageInfo = response.page;
          const pageIndex = response.number ?? pageInfo?.number ?? 0;
          const totalPages = response.totalPages ?? pageInfo?.totalPages ?? 0;
          const totalElements = response.totalElements ?? pageInfo?.totalElements ?? 0;
          const pageSize = response.size ?? pageInfo?.size;

          this.addresses.set(response.content ?? []);
          this.pageIndex.set(pageIndex);
          this.totalPages.set(totalPages);
          this.totalElements.set(totalElements);
          if (pageSize && pageSize > 0 && pageSize !== this.pageSize()) {
            this.pageSize.set(pageSize);
          }
        },
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
        next: () => {
          const targetPage = this.addresses().length <= 1 && this.pageIndex() > 0
            ? this.pageIndex() - 1
            : this.pageIndex();
          this.refresh(targetPage);
        },
        error: () => this.error.set('Failed to delete address.')
      });
  }

  isDeleting(id?: number): boolean {
    return id !== undefined && this.deletingIds().has(id);
  }

  previousPage(): void {
    if (this.pageIndex() > 0) {
      this.refresh(this.pageIndex() - 1);
    }
  }

  nextPage(): void {
    if (this.pageIndex() + 1 < this.totalPages()) {
      this.refresh(this.pageIndex() + 1);
    }
  }

  updatePageSize(value: number | string): void {
    const nextSize = Number(value);
    if (!Number.isFinite(nextSize) || nextSize <= 0) {
      return;
    }
    if (nextSize !== this.pageSize()) {
      this.pageSize.set(nextSize);
      this.refresh(0);
    }
  }

  rangeStart(): number {
    return this.totalElements() === 0 ? 0 : this.pageIndex() * this.pageSize() + 1;
  }

  rangeEnd(): number {
    return Math.min(this.totalElements(), (this.pageIndex() + 1) * this.pageSize());
  }
}
