import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';


  constructor(private authService: AuthService, private router: Router) {}

login() {
  this.authService.login(this.email, this.password).subscribe({
    next: (res) => {
      const token = res.data.access_token;
      localStorage.setItem('token', token);

      // Récupérer l'utilisateur connecté
      this.authService.getMe(token).subscribe({
        next: (userRes: any) => {
          localStorage.setItem('userId', userRes.data.id);
          localStorage.setItem('userName', userRes.data.first_name || 'Utilisateur');

          // Rediriger vers home
          this.router.navigate(['/home']);
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


ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/home']); // déjà connecté
    }
  }
}
