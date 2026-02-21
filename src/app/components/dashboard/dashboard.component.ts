import { CommonModule } from '@angular/common';
import { DashCardComponent } from '../../shared/dash-card/dash-card.component';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';


const TICKETS_BASE_URL = '/api/tickets';

export type TicketStatusKey = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'CLOSED' | 'LATE';

export interface TicketDashboardStats {
  open: number;
  inProgress: number;
  closed: number;
  onHold: number;
  late: number;
  total: number;
}

export interface Ticket {
  id: number;
  ticketNumber?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  directClient?: string;
  directClientManager?: string;
  finalClient?: string;
  finalClientManager?: string;
  projectType?: string;
  projectNumber?: string;
  purchaseOrder?: string;
  serviceOrder?: string;
  poNumber?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  siteType?: string;
  accessReleaseNumber?: string;
  tbsaId?: string;
  tbsaTicket?: string;
  activityDescription?: string;
}

export interface TicketHistoryItem {
  id: number;
  ticketId: number;
  previousStatus?: string;
  newStatus?: string;
  changedAt: string;
  changedBy?: string;
}

const STATUS_KEYS: { key: TicketStatusKey; statKey: keyof TicketDashboardStats; labelKey: string }[] = [
  { key: 'OPEN', statKey: 'open', labelKey: 'dashboard.ticketsOpen' },
  { key: 'IN_PROGRESS', statKey: 'inProgress', labelKey: 'dashboard.ticketsActive' },
  { key: 'ON_HOLD', statKey: 'onHold', labelKey: 'dashboard.ticketsOnHold' },
  { key: 'CLOSED', statKey: 'closed', labelKey: 'dashboard.ticketsClosed' },
  { key: 'LATE', statKey: 'late', labelKey: 'dashboard.ticketsLate' }
];


function isLateTicket(t: Ticket): boolean {
  if (t.status === 'CLOSED') return false;
  if (!t.dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return t.dueDate < today;
}

function ticketMatchesStatus(t: Ticket, statusKey: TicketStatusKey): boolean {
  if (statusKey === 'LATE') return isLateTicket(t);
  return t.status === statusKey;
}

/** Client-side filter - only applied when user has typed in the search input */
function ticketMatchesFilter(t: Ticket, filter: string): boolean {
  if (!filter || !filter.trim()) return true;
  const q = filter.trim().toLowerCase();
  const values = [
    t.ticketNumber, t.status, t.dueDate, t.directClient, t.directClientManager,
    t.finalClient, t.finalClientManager, t.projectType, t.projectNumber, t.purchaseOrder,
    t.serviceOrder, t.poNumber, t.address, t.addressNumber, t.district, t.city, t.state,
    t.zipCode, t.accessReleaseNumber, t.tbsaId, t.tbsaTicket, t.activityDescription
  ].filter(Boolean).map(String);
  return values.some(v => v.toLowerCase().includes(q));
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashCardComponent, RouterModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly STATUS_KEYS = STATUS_KEYS;
  readonly ticketStats = signal<TicketDashboardStats | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal('');
  readonly selectedStatus = signal<TicketStatusKey>('LATE');
  readonly tickets = signal<Ticket[]>([]);
  readonly ticketsLoading = signal(false);
  readonly filterText = signal('');
  readonly expandedTicketIds = signal<Set<number>>(new Set());
  readonly ticketHistories = signal<Map<number, TicketHistoryItem[]>>(new Map());

  filteredTickets = computed(() => {
    const list = this.tickets();
    const statusKey = this.selectedStatus();
    const filter = this.filterText();
    let result = list.filter(t => ticketMatchesStatus(t, statusKey));
    if (filter?.trim()) result = result.filter(t => ticketMatchesFilter(t, filter));
    return result;
  });

  selectedStatusLabel = computed(() => {
    const key = this.selectedStatus();
    const map: Record<TicketStatusKey, string> = {
      OPEN: 'dashboard.ticketsOpen',
      IN_PROGRESS: 'dashboard.ticketsActive',
      ON_HOLD: 'dashboard.ticketsOnHold',
      CLOSED: 'dashboard.ticketsClosed',
      LATE: 'dashboard.ticketsLate'
    };
    return map[key] ?? key;
  });

  getTicketStatusStyle(ticket: Ticket): string {
    return isLateTicket(ticket) ? 'late' : this.getStatusCssClass((ticket.status ?? 'OPEN') as TicketStatusKey) || 'open';
  }

  getStatusCssClass(key: TicketStatusKey): string {
    const map: Record<TicketStatusKey, string> = {
      OPEN: 'open',
      IN_PROGRESS: 'active',
      ON_HOLD: 'on-hold',
      CLOSED: 'closed',
      LATE: 'late'
    };
    return map[key] ?? '';
  }

  getStatusColor(key: TicketStatusKey): string {
    const map: Record<TicketStatusKey, string> = {
      OPEN: '#0ea5e9',
      IN_PROGRESS: '#22c55e',
      ON_HOLD: '#f59e0b',
      CLOSED: '#64748b',
      LATE: '#dc2626'
    };
    return map[key] ?? '#94a3b8';
  }

  pieChartGradient(stats: TicketDashboardStats): string {
    const total = stats.total || 1;
    const values = [
      { pct: ((stats.open ?? 0) / total) * 100, color: '#0ea5e9' },
      { pct: ((stats.inProgress ?? 0) / total) * 100, color: '#22c55e' },
      { pct: ((stats.onHold ?? 0) / total) * 100, color: '#f59e0b' },
      { pct: ((stats.closed ?? 0) / total) * 100, color: '#64748b' },
      { pct: ((stats.late ?? 0) / total) * 100, color: '#dc2626' }
    ];
    let acc = 0;
    const stops = values
      .filter(v => v.pct > 0)
      .map(v => {
        const start = acc;
        acc += v.pct;
        return `${v.color} ${start}% ${acc}%`;
      });
    if (stops.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
    return `conic-gradient(${stops.join(', ')})`;
  }

  ngOnInit(): void {
    this.loadCounts();
    this.loadAllTickets();
  }

  selectStatus(key: TicketStatusKey): void {
    this.selectedStatus.set(key);
    this.filterText.set('');
  }

  setFilter(value: string): void {
    this.filterText.set(value);
  }

  toggleHistory(ticketId: number): void {
    const current = new Set(this.expandedTicketIds());
    if (current.has(ticketId)) {
      current.delete(ticketId);
      this.expandedTicketIds.set(new Set(current));
      return;
    }
    current.add(ticketId);
    this.expandedTicketIds.set(new Set(current));
    const map = this.ticketHistories();
    if (map.has(ticketId)) return;
    this.http.get<TicketHistoryItem[]>(`${TICKETS_BASE_URL}/${ticketId}/history`)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
      .subscribe(history => {
        const next = new Map(map);
        next.set(ticketId, history);
        this.ticketHistories.set(next);
      });
  }

  isHistoryExpanded(ticketId: number): boolean {
    return this.expandedTicketIds().has(ticketId);
  }

  private loadAllTickets(): void {
    this.ticketsLoading.set(true);
    this.http.get<Ticket[]>(`${TICKETS_BASE_URL}/all`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([])),
        finalize(() => this.ticketsLoading.set(false))
      )
      .subscribe(list => this.tickets.set(list ?? []));
  }

  private loadCounts(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.http
      .get<TicketDashboardStats>(`${TICKETS_BASE_URL}/dashboard-stats`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of({ open: 0, inProgress: 0, closed: 0, onHold: 0, late: 0, total: 0 })),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => this.ticketStats.set(data),
        error: () => this.error.set('common.failedToLoadDashboard')
      });
  }
}
