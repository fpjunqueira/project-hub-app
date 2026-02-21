import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  currentLang = toSignal(
    this.translate.onLangChange.pipe(
      map((e) => e.lang),
      startWith(this.translate.currentLang || this.translate.defaultLang || 'en')
    ),
    { initialValue: this.translate.currentLang || this.translate.defaultLang || 'en' }
  );

  userLabel = computed(() => {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return 'common.guest';
    }
    return user.displayName ?? user.username;
  });

  signOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchLanguage(): void {
    const next = this.translate.currentLang === 'pt' ? 'en' : 'pt';
    this.translate.use(next);
    localStorage.setItem('projectHub_lang', next);
  }
}
