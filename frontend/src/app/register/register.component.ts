import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  first_name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    // Vérification mots de passe
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    // Données à envoyer à Directus
    const userData = {
      first_name: this.first_name,
      email: this.email,
      password: this.password
    };

    // Appel API via AuthService
    this.authService.registerUser(userData)
      .pipe(
        catchError(err => {
          console.error(err);
          this.errorMessage = err?.error?.message || 'Erreur lors de l’inscription.';
          return of(null);
        })
      )
      .subscribe(res => {
        if (res) {
          console.log('Utilisateur créé:', res);
          this.router.navigate(['/login']); // redirection vers login
        }
      });


      this.router.navigate(['/login']); // déjà connecté
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
