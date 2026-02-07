import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { TelecomScreenConfig, TelecomScreenField, TelecomRecord } from '../model/telecom.model';
import { getTelecomScreen } from '../telecom.config';
import { TelecomService } from '../service/telecom.service';

@Component({
  selector: 'app-telecom-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './telecom-view.component.html',
  styleUrl: './telecom-view.component.scss'
})
export class TelecomViewComponent implements OnInit {
  private telecomService = inject(TelecomService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  screen = signal<TelecomScreenConfig | null>(null);
  fields = signal<TelecomScreenField[]>([]);
  record = signal<TelecomRecord | null>(null);
  isLoading = signal(false);
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
        this.fields.set(screen.fields);
        this.loadRecordFromRoute();
      });
  }

  screenTitle(): string {
    return `${this.screen()?.title ?? 'Telecom'} Details`;
  }

  basePath(): string {
    const route = this.screen()?.route ?? '';
    return route ? `/${route}` : '';
  }

  private loadRecordFromRoute(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const screen = this.screen();
        if (!screen) {
          return;
        }

        const idParam = params.get('id');
        if (idParam) {
          this.loadRecord(Number(idParam));
        } else {
          this.record.set(null);
        }
      });
  }

  private loadRecord(id: number): void {
    const screen = this.screen();
    if (!screen) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.telecomService
      .get(screen.baseUrl, id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (record) => this.record.set(record),
        error: () => this.error.set('Failed to load record.')
      });
  }
}
