// home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div style="text-align:center; margin-top:50px;">
      <h2>Bienvenue, {{ userName }} !</h2>
      <p>Vous êtes connecté.</p>
      <button (click)="goToProjet()">Nouveau projet</button>
      <button (click)="logout()">Se déconnecter</button>
    </div>
  `
})
export class HomeComponent {
  userName = localStorage.getItem('userName') || 'Utilisateur';

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }

  goToProjet() {
    this.router.navigate(['/project']);
  }
}
