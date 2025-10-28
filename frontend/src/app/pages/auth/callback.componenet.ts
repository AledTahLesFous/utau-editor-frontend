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
  this.http.get('http://localhost:8055/auth/exchange-cookie', { withCredentials: true })
    .subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.access_token);
        this.router.navigate(['/home']);
      },
      error: (err) => console.error('Erreur échange cookie → JWT', err),
    });
}

}
