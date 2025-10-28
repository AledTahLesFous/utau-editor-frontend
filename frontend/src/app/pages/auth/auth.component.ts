import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  isFlipped = false;

  // Login fields
  email = '';
  password = '';

  // Register fields
  first_name = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isNotificationLeaving = false;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

ngOnInit(): void {
  const token = localStorage.getItem('token');
  if (token) {
    this.router.navigate(['/home']); // déjà connecté
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token'); // Directus met le JWT ici
  if (accessToken) {
    localStorage.setItem('token', accessToken);
    // enlever le param pour garder l'URL propre
    window.history.replaceState({}, '', '/auth');
    this.router.navigate(['/home']);
  }
}



flipCard(showSuccess = false, successMsg: string = '') {
  this.isFlipped = !this.isFlipped;
  this.errorMessage = '';

  if (showSuccess && successMsg) {
    this.successMessage = successMsg;

    // Faire disparaître la notification après 4 secondes
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }
}



  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        const token = res.data.access_token;
        localStorage.setItem('token', token);

        this.authService.getMe(token).subscribe({
          next: (userRes: any) => {
            localStorage.setItem('userId', userRes.data.id);
            this.router.navigate(['']);
          },
          error: (err) => {
            console.error('Erreur récupération utilisateur:', err);
            this.errorMessage = 'Login échoué';
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Login échoué';
      }
    });
  }

register() {
  if (!this.email.includes('@') || !this.email.includes('.')) {
    this.errorMessage = 'Veuillez saisir une adresse email valide.';
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Les mots de passe ne correspondent pas.';
    return;
  }

  const userData = { first_name: this.first_name, email: this.email, password: this.password };

  this.authService.registerUser(userData)
    .pipe(catchError(err => {
      this.errorMessage = err?.error?.message || 'Erreur lors de l’inscription.';
      return of(null);
    }))
    .subscribe(() => {
      this.flipCard();

      this.successMessage = 'Utilisateur créé ! Connectez-vous.';
      this.isNotificationLeaving = false;

      // Après 3s, lance l'animation slide-out
      setTimeout(() => {
        this.isNotificationLeaving = true;
      }, 3000);

      // Après 3.5s, supprime le message
      setTimeout(() => {
        this.successMessage = '';
      }, 3500);
    });
}

loginWithGitHub() {
  window.location.href = 'http://localhost:8055/auth/login/github?redirect=http://localhost:4200/auth/callback';
}


}

