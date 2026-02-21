import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

type SidebarGroupKey = 'tickets' | 'projects' | 'sites' | 'finance' | 'clients' | 'general';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, TranslateModule],
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
