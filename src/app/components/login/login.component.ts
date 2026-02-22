import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  error = signal<string | null>(null);
  isLoading = signal(false);
  username = signal('');
  password = signal('');

  async login(): Promise<void> {
    if (this.authService.isAuthEnabled()) {
      this.authService.login();
      return;
    }

    this.error.set(null);
    this.isLoading.set(true);
    try {
      const loggedIn = await this.authService.loginLocal(this.username(), this.password());
      if (loggedIn) {
        void this.router.navigate(['/dashboard']);
      } else {
        this.error.set('login.error');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  isAuthEnabled(): boolean {
    return this.authService.isAuthEnabled();
  }
}
