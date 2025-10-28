// Exemple simplifié AuthCallbackComponent
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-callback',
  template: `<p>Connexion en cours...</p>`,
  standalone: true,
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Appel pour récupérer l'utilisateur connecté
    this.http.get('http://localhost:8055/users/me', { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('Utilisateur connecté:', res);
          // Ici tu peux stocker un token si nécessaire
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erreur récupération utilisateur après OAuth:', err);
        }
      });
  }
}
