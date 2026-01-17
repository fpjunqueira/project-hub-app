import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  username = signal('');
  password = signal('');
  error = signal('');
  isLoading = signal(false);

  submit(): void {
    const username = this.username().trim();
    const password = this.password().trim();

    if (!username || !password) {
      this.error.set('Please enter your login and password.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService
      .login({ username, password })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => this.router.navigate(['/projects']),
        error: () => this.error.set('Invalid login or password.')
      });
  }
}
