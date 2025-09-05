import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  // Mode flip
  isFlipped = false;

  // Login fields
  email = '';
  password = '';

  // Register fields
  first_name = '';
  confirmPassword = '';

  errorMessage = '';


  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['']); // déjà connecté
    }
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    this.errorMessage = '';
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

    const userData = {
      first_name: this.first_name,
      email: this.email,
      password: this.password
    };

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
          this.flipCard(); // Revenir sur le formulaire de login
        }
      });
  }
}
