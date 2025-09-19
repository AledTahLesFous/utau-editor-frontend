// app-header.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  @Input() isLoggedIn = !!localStorage.getItem('token');

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToCreateProjet() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth']);
    } else {
      this.router.navigate(['/project']);
    }
  }

  goHome() {
    this.router.navigate(['']);

  }

  goToViewProjects() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth']);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}
