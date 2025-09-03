import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Login</h2>
      <form (ngSubmit)="login()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required />
        <input type="password" [(ngModel)]="password" name="password" placeholder="Mot de passe" required />
        <button type="submit">Se connecter</button>
      </form>
      <p *ngIf="errorMessage" style="color:red">{{ errorMessage }}</p>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Token:', res.data.access_token);
        localStorage.setItem('token', res.data.access_token);
        this.errorMessage = 'Login réussi !';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Login échoué';
      }
    });
  }
}
