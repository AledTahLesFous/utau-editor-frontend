import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
import { AuthService } from '../../shared/services/auth.service';
import { ProjectService } from '../../shared/services/project.service';

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
  avatarUrl: string | null = null;
  newAvatarFile: File | null = null;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
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

        // Charger l'avatar si présent
        if (this.user.avatar) {
          this.loadAvatar(this.user.avatar);
        }
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

  loadAvatar(fileId: string): void {
    this.projectService.getCoverImage(fileId).subscribe({
      next: (res: any) => {
        const fileData = res.data;
        this.avatarUrl = `http://localhost:8055/assets/${fileData.id}`;
      },
      error: (err) => {
        console.error('Erreur chargement avatar:', err);
        this.avatarUrl = null;
      }
    });
  }

  onAvatarSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.newAvatarFile = event.target.files[0];
    }
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    this.successMessage = null;
    this.error = null;
  }

  async saveProfile(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    let avatarId = this.user.avatar;

    // Upload avatar si nouveau fichier
    if (this.newAvatarFile) {
      try {
        const uploadRes: any = await this.projectService.uploadFile(this.newAvatarFile, token).toPromise();
        avatarId = uploadRes.data.id;
      } catch (err) {
        console.error('Erreur upload avatar:', err);
        this.error = 'Erreur lors de l\'upload de l\'avatar';
        return;
      }
    }

    const updatedData = {
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      email: this.user.email,
      location: this.user.location,
      title: this.user.title,
      description: this.user.description,
      avatar: avatarId
    };

    this.loading = true;
    this.authService.updateMe(updatedData, token).subscribe({
      next: (response) => {
        this.user = response.data || response;
        this.loading = false;
        this.editing = false;
        this.newAvatarFile = null;
        this.successMessage = 'Profil mis à jour avec succès ✅';

        // Recharger l'avatar si mis à jour
        if (avatarId) {
          this.loadAvatar(avatarId);
        }
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
