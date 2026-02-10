import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { TelecomScreenConfig, TelecomScreenField, TelecomRecord } from '../model/telecom.model';
import { getTelecomScreen } from '../telecom.config';
import { TelecomService } from '../service/telecom.service';

@Component({
  selector: 'app-telecom-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './telecom-list.component.html',
  styleUrl: './telecom-list.component.scss'
})
export class TelecomListComponent implements OnInit {
  private readonly telecomService = inject(TelecomService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  screen = signal<TelecomScreenConfig | null>(null);
  fields = signal<TelecomScreenField[]>([]);
  records = signal<TelecomRecord[]>([]);
  pageIndex = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  deletingIds = signal<Set<number>>(new Set<number>());
  error = signal('');

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const screenKey = String(data['screenKey'] ?? '');
        const screen = getTelecomScreen(screenKey);
        if (!screen) {
          this.error.set('Failed to load screen configuration.');
          return;
        }
        this.screen.set(screen);
        const visibleFields = screen.fields.filter((field) => field.showInList !== false);
        this.fields.set(visibleFields.length ? visibleFields : screen.fields);
        this.refresh(0);
      });
  }

  refresh(page = this.pageIndex()): void {
    const screen = this.screen();
    if (!screen) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.telecomService
      .list(screen.baseUrl, page, this.pageSize())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.records.set(response);
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

          this.records.set(response.content ?? []);
          this.pageIndex.set(pageIndex);
          this.totalPages.set(totalPages);
          this.totalElements.set(totalElements);
          if (pageSize && pageSize > 0 && pageSize !== this.pageSize()) {
            this.pageSize.set(pageSize);
          }
        },
        error: () => this.error.set('Failed to load records.')
      });
  }

  delete(id?: number): void {
    const screen = this.screen();
    if (!screen || id === undefined) {
      return;
    }

    this.error.set('');
    this.deletingIds.update((ids) => {
      const next = new Set(ids);
      next.add(id);
      return next;
    });
    this.telecomService
      .delete(screen.baseUrl, id)
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
          const targetPage = this.records().length <= 1 && this.pageIndex() > 0
            ? this.pageIndex() - 1
            : this.pageIndex();
          this.refresh(targetPage);
        },
        error: () => this.error.set('Failed to delete record.')
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

  screenTitle(): string {
    return this.screen()?.title ?? 'Telecom';
  }

  basePath(): string {
    const route = this.screen()?.route ?? '';
    return route ? `/${route}` : '';
  }
}
