import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  editing = false;
  successMessage: string | null = null;

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
        this.user = response.data || response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil :', err);
        this.error = 'Impossible de charger le profil utilisateur.';
        this.loading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.router.navigate(['/auth']);
      },
    });
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    this.successMessage = null;
  }

saveProfile(): void {
  const token = localStorage.getItem('token');
  if (!token) return;

  // 👇 On ne garde que les champs supportés par /users/me
  const updatedData = {
    first_name: this.user.first_name,
    last_name: this.user.last_name,
    email: this.user.email,
    location: this.user.location,
    title: this.user.title,
    description: this.user.description
  };

  this.loading = true;
  this.authService.updateMe(updatedData, token).subscribe({
    next: (response) => {
      this.user = response.data || response;
      this.loading = false;
      this.editing = false;
      this.successMessage = 'Profil mis à jour avec succès ✅';
    },
    error: (err) => {
      console.error('Erreur de mise à jour du profil :', err.error);
      this.error = err.error?.errors?.[0]?.message || 'Impossible de mettre à jour le profil.';
      this.loading = false;
    },
  });
}


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth']);
  }
}
