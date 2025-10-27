import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }

    this.authService.getMe(token).subscribe({
      next: (response) => {
        console.log(response)
        this.user = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du profil :', err);
        this.error = 'Impossible de charger le profil utilisateur.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth']);
  }

  editProfile(): void {
    alert('La modification du profil sera bientôt disponible.');
  }
}
