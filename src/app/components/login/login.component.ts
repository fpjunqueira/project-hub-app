import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async login(): Promise<void> {
    if (!this.authService.isAuthEnabled()) {
      const loggedIn = await this.authService.loginLocal();
      if (loggedIn) {
        void this.router.navigate(['/projects']);
      }
      return;
    }

    this.authService.login();
  }

  backToApp(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/projects']);
    }
  }

  isAuthEnabled(): boolean {
    return this.authService.isAuthEnabled();
  }
}
