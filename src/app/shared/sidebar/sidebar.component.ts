import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type SidebarGroupKey = 'tickets' | 'projects' | 'sites' | 'finance' | 'clients' | 'general';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  expanded: Record<SidebarGroupKey, boolean> = {
    tickets: true,
    projects: true,
    sites: true,
    finance: true,
    clients: true,
    general: true
  };

  toggle(group: SidebarGroupKey): void {
    this.expanded[group] = !this.expanded[group];
  }
}
