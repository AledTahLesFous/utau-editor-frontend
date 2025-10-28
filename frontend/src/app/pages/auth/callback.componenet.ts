import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Connexion en cours via GitHub...</p>`,
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token'); // Directus renvoie le JWT

    if (token) {
      localStorage.setItem('token', token);
      this.router.navigate(['/home']);
    } else {
      console.error('Token Directus manquant');
    }
  }
}
