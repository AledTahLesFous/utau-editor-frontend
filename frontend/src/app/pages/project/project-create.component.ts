import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../shared/services/project.service';
import { AuthService } from '../../shared/services/auth.service';
import { AppHeaderComponent} from '../../shared/components/app-header.component'


@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent implements OnInit {
  name = '';
  description = '';
  tempo: number = 120;
  key_signature = '';
  cover_image = '';
  status = '';
  tags = '';

  // ✅ La liste complète des voicebanks
  voicebanks: any[] = [];

  // ✅ L'ID du voicebank choisi comme primary
  primary_voicebank: string = '';

  currentUserId: string | null = null;
  showAdvanced = false;
  message = '';

  isLoggedIn = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    if (!token) return;

    // Récupérer toutes les voicebanks
    this.projectService.getVoicebanks(token).subscribe({
      next: (response: any) => {
        this.voicebanks = response.data; // stocke toutes les voicebanks
        console.log('Voicebanks:', this.voicebanks);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des voicebanks:', err);
      }
    });

    // Récupérer l'utilisateur connecté
    this.authService.getMe(token).subscribe({
      next: (user: any) => this.currentUserId = user.data.id,
      error: (err) => {
        console.error('Erreur récupération utilisateur:', err);
        this.message = 'Impossible de récupérer l’utilisateur connecté.';
      }
    });
  }

  createProject() {
    const token = localStorage.getItem('token');
    if (!token || !this.currentUserId) {
      this.message = 'Impossible de créer le projet : utilisateur non identifié.';
      return;
    }

    const projectData: any = {
      title: this.name,
      user_created: this.currentUserId,
      primary_voicebank: this.primary_voicebank // ✅ inclure le choix de l'utilisateur
    };

    if (this.description?.trim()) projectData.description = this.description;
    if (this.tempo) projectData.tempo = this.tempo;
    if (this.key_signature?.trim()) projectData.key_signature = this.key_signature;

    this.projectService.createProject(projectData, token).subscribe({
      next: () => {
        this.message = 'Projet créé avec succès !';
        this.router.navigate(['/project', this.name]);
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la création du projet';
      }
    });
  }

  back() {
    this.router.navigate(['']);
  }
}

