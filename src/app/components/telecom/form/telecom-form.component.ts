import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TelecomScreenConfig, TelecomScreenField, TelecomRecord } from '../model/telecom.model';
import { getTelecomScreen } from '../telecom.config';
import { TelecomService } from '../service/telecom.service';

interface SiteOption {
  id?: number;
  siteId?: string;
  addressId?: string;
  name?: string;
  sequence?: string;
}

interface ProjectOption {
  id?: number;
  projectName?: string;
  projectNumber?: string;
}

interface ContractRegistration {
  id?: number;
  directClient?: string;
  directClientManager?: string;
  finalClient?: string;
  finalClientManager?: string;
  projectType?: string;
  projectNumber?: string;
  purchaseOrder?: string;
  serviceOrder?: string;
  poNumber?: string;
  siteType?: string;
  siteId?: string;
  addressId?: string;
}

type SelectValue = string | number | null;

@Component({
  selector: 'app-telecom-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './telecom-form.component.html',
  styleUrl: './telecom-form.component.scss'
})
export class TelecomFormComponent implements OnInit {
  private readonly telecomService = inject(TelecomService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  screen = signal<TelecomScreenConfig | null>(null);
  fields = signal<TelecomScreenField[]>([]);
  draft = signal<TelecomRecord>({});
  showOptional = signal(false);
  siteOptions = signal<SiteOption[]>([]);
  siteLoading = signal(false);
  selectedSiteId = signal<number | string | null>(null);
  projectOptions = signal<ProjectOption[]>([]);
  projectLoading = signal(false);
  selectedProjectId = signal<number | null>(null);
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

    if (!this.canSubmit()) {
      this.error.set('Complete the prerequisite records before proceeding.');
      return;
    }

    if (this.hasMissingRequired(screen, draft)) {
      this.error.set('Please fill out all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isEdit() && draft.id !== undefined
      ? this.telecomService.update(screen.baseUrl, draft.id, draft)
      : this.telecomService.create(screen.baseUrl, draft);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        void this.router.navigate([`/${screen.route}`]);
      },
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

        this.initRelations(screen);
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

  private hasMissingRequired(screen: TelecomScreenConfig, draft: TelecomRecord): boolean {
    return screen.fields.some((field) => {
      if (!field.required) {
        return false;
      }
      const value = draft[field.key];
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value === 'string') {
        return value.trim() === '';
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return false;
      }
      if (typeof value === 'object') {
        return Object.keys(value).length === 0;
      }
      return false;
    });
  }

  visibleFields(): TelecomScreenField[] {
    return this.fields().filter((field) => !field.optional || this.showOptional());
  }

  toggleOptional(): void {
    this.showOptional.update((value) => !value);
  }

  canSubmit(): boolean {
    if (this.isContractScreen()) {
      return this.siteOptions().length > 0;
    }
    if (this.isTicketScreen() || this.isBillingScreen()) {
      return this.projectOptions().length > 0;
    }
    return true;
  }

  isContractScreen(): boolean {
    return this.screen()?.key === 'contractRegistrations';
  }

  isTicketScreen(): boolean {
    return this.screen()?.key === 'tickets';
  }

  isBillingScreen(): boolean {
    return this.screen()?.key === 'billings';
  }

  updateSiteType(siteType: string): void {
    this.updateField('siteType', siteType);
    this.loadSiteOptions(siteType);
  }

  updateSelectedSite(siteValue: SelectValue): void {
    if (siteValue === null || siteValue === '') {
      this.selectedSiteId.set(null);
      return;
    }

    this.selectedSiteId.set(siteValue);
    const siteValueText = String(siteValue ?? '');
    const site = this.siteOptions().find((option) =>
      String(option.siteId ?? option.sequence ?? '') === siteValueText
    );
    if (!site) {
      return;
    }
    this.updateField('siteId', site.siteId ?? site.sequence ?? '');
    this.updateField('addressId', site.addressId ?? '');
  }

  updateSelectedProject(projectId: SelectValue): void {
    if (projectId === null || projectId === '') {
      this.selectedProjectId.set(null);
      return;
    }

    const id = Number(projectId);
    if (!Number.isFinite(id)) {
      return;
    }
    this.selectedProjectId.set(id);
    this.prefillFromProject(id);
  }

  private initRelations(screen: TelecomScreenConfig): void {
    if (screen.key === 'contractRegistrations') {
      const currentSiteType = this.draft()['siteType'];
      const siteType = typeof currentSiteType === 'string' && currentSiteType.trim()
        ? currentSiteType
        : 'claro';
      if (currentSiteType !== siteType) {
        this.updateField('siteType', siteType);
      }
      this.loadSiteOptions(siteType);
    }

    if (screen.key === 'tickets' || screen.key === 'billings') {
      this.loadProjectOptions();
    }
  }

  private loadSiteOptions(siteType: string): void {
    const normalized = siteType.toLowerCase();
    let endpoint = '';
    if (normalized === 'claro') {
      endpoint = '/api/claro-sites/all';
    } else if (normalized === 'tim') {
      endpoint = '/api/tim-sites/all';
    } else if (normalized === 'vivo') {
      endpoint = '/api/vivo-sites/all';
    }

    if (!endpoint) {
      this.siteOptions.set([]);
      return;
    }

    this.siteLoading.set(true);
    this.http
      .get<SiteOption[]>(endpoint)
      .pipe(
        finalize(() => this.siteLoading.set(false)),
      )
      .subscribe({
        next: (sites) => this.siteOptions.set(sites),
        error: () => this.error.set('Failed to load sites.')
      });
  }

  private loadProjectOptions(): void {
    this.projectLoading.set(true);
    this.http
      .get<ProjectOption[]>('/api/projects/all')
      .pipe(finalize(() => this.projectLoading.set(false)))
      .subscribe({
        next: (projects) => this.projectOptions.set(projects),
        error: () => this.error.set('Failed to load projects.')
      });
  }

  private prefillFromProject(projectId: number): void {
    forkJoin({
      project: this.http.get<ProjectOption & TelecomRecord>(`/api/projects/${projectId}`),
      contract: this.http.get<ContractRegistration | null>(`/api/projects/${projectId}/contract`)
    }).subscribe({
      next: ({ project, contract }) => {
        if (this.isTicketScreen()) {
          this.draft.update((draft) => ({
            ...draft,
            project: { id: projectId },
            directClient: project['directClient'] ?? draft['directClient'] ?? '',
            directClientManager: project['directClientManager'] ?? draft['directClientManager'] ?? '',
            finalClient: project['finalClient'] ?? draft['finalClient'] ?? '',
            finalClientManager: project['finalClientManager'] ?? draft['finalClientManager'] ?? '',
            projectType: project['projectType'] ?? draft['projectType'] ?? '',
            projectNumber: project['projectNumber'] ?? draft['projectNumber'] ?? '',
            purchaseOrder: project['purchaseOrder'] ?? draft['purchaseOrder'] ?? '',
            serviceOrder: project['serviceOrder'] ?? draft['serviceOrder'] ?? '',
            poNumber: project['poNumber'] ?? draft['poNumber'] ?? '',
            siteType: contract?.siteType ?? draft['siteType'] ?? ''
          }));
        }

        if (this.isBillingScreen()) {
          this.draft.update((draft) => ({
            ...draft,
            project: { id: projectId },
            finalClientManager: project['finalClientManager'] ?? draft['finalClientManager'] ?? '',
            projectType: project['projectType'] ?? draft['projectType'] ?? '',
            projectNumber: project['projectNumber'] ?? draft['projectNumber'] ?? '',
            purchaseOrder: project['purchaseOrder'] ?? draft['purchaseOrder'] ?? '',
            serviceOrder: project['serviceOrder'] ?? draft['serviceOrder'] ?? '',
            poNumber: project['poNumber'] ?? draft['poNumber'] ?? '',
            finalClient: project['finalClient'] ?? draft['finalClient'] ?? ''
          }));
        }
      }
    });
  }
}
