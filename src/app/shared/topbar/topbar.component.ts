import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userLabel = computed(() => {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return 'Guest';
    }

    return user.displayName ?? user.username;
  });

  signOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
