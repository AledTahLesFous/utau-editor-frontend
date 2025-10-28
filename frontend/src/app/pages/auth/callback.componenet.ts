import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Connexion en cours via GitHub...</p>`,
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code'); // récupère le code GitHub


    if (!code) {
      console.error('Code GitHub manquant');
      return;
    }

    // 🔹 Envoi du code à Directus pour récupérer JWT
    this.http
      .post('http://localhost:8055/auth/exchange-code', { code })
      .subscribe({
        next: (res: any) => {
          // Directus renvoie { access_token, user }
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('userId', res.user.id);
          this.router.navigate(['/home']);
        },
        error: (err) => console.error('Erreur login Directus:', err),
      });
  }
}
