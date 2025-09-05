import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- important pour *ngIf
import { AppHeaderComponent } from '../shared/app-header.component'; // <-- important pour *ngIf

@Component({
  selector: 'app-home',
  standalone: true, // si tu veux que ce component soit standalone
  imports: [CommonModule, AppHeaderComponent], // <-- ngIf et autres directives Angular
  templateUrl: './home.component.html',
})
export class HomeComponent {
  isLoggedIn = !!localStorage.getItem('token');

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    this.isLoggedIn = false;
    this.router.navigate(['/auth']);
  }

goToCreateProjet() {
  const token = localStorage.getItem('token');
  if (!token) {
    // pas connecté → redirige vers /auth
    this.router.navigate(['/auth']);
    return;
  }
  // connecté → va sur la page de création
  this.router.navigate(['/project']);
}

  goToViewProjects() {
    this.router.navigate(['/projects']);
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
