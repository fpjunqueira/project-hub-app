import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dash-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="dash-card">
      @if (title) {
        <h2 class="dash-card-title">{{ title | translate }}</h2>
      }
      <ng-content />
    </section>
  `,
  styles: [`
    .dash-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
      overflow: hidden;
      padding: 24px;
    }

    .dash-card-title {
      margin: 0 0 16px;
      padding: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2933;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
  `]
})
export class DashCardComponent {
  @Input() title = '';
}
