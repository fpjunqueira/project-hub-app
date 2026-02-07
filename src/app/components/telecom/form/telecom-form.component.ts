import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { TelecomScreenConfig, TelecomScreenField, TelecomRecord } from '../model/telecom.model';
import { getTelecomScreen } from '../telecom.config';
import { TelecomService } from '../service/telecom.service';

@Component({
  selector: 'app-telecom-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './telecom-form.component.html',
  styleUrl: './telecom-form.component.scss'
})
export class TelecomFormComponent implements OnInit {
  private telecomService = inject(TelecomService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  screen = signal<TelecomScreenConfig | null>(null);
  fields = signal<TelecomScreenField[]>([]);
  draft = signal<TelecomRecord>({});
  isEdit = signal(false);
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
        this.loadRouteState();
      });
  }

  submit(): void {
    const screen = this.screen();
    const draft = this.draft();
    if (!screen) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isEdit() && draft.id !== undefined
      ? this.telecomService.update(screen.baseUrl, draft.id, draft)
      : this.telecomService.create(screen.baseUrl, draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => this.router.navigate([`/${screen.route}`]),
      error: () =>
        this.error.set(this.isEdit() ? 'Failed to update record.' : 'Failed to create record.')
    });
  }

  updateField(key: string, value: string): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  screenTitle(): string {
    const title = this.screen()?.title ?? 'Telecom';
    return this.isEdit() ? `Edit ${title}` : `New ${title}`;
  }

  basePath(): string {
    const route = this.screen()?.route ?? '';
    return route ? `/${route}` : '';
  }

  private loadRouteState(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const screen = this.screen();
        if (!screen) {
          return;
        }

        const idParam = params.get('id');
        if (idParam) {
          this.isEdit.set(true);
          this.loadRecord(Number(idParam));
        } else {
          this.isEdit.set(false);
          this.error.set('');
          this.draft.set(this.buildEmptyDraft(screen));
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
        next: (record) => {
          this.draft.set({
            ...this.buildEmptyDraft(screen),
            ...record
          });
        },
        error: () => this.error.set('Failed to load record.')
      });
  }

  private buildEmptyDraft(screen: TelecomScreenConfig): TelecomRecord {
    return screen.fields.reduce<TelecomRecord>((acc, field) => {
      acc[field.key] = '';
      return acc;
    }, {});
  }
}
