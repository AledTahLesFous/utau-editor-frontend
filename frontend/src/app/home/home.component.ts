import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  userName = localStorage.getItem('userName') || 'Utilisateur';

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    this.router.navigate(['']);
  }

  goToCreateProjet() {
    this.router.navigate(['/project']); // page de création
  }

  goToViewProjects() {
    this.router.navigate(['/projects']); // page de visualisation de tous les projets
  }

  goToLogin() {
    this.router.navigate(['/auth']); // page de visualisation de tous les projets
  }
}
