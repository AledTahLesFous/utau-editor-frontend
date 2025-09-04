import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectCreateComponent {
  name = '';
  description = '';
  tempo = '';
  
  key_signature = '';
  cover_image = '';
  status = '';
  primary_voicebank = '';
  tags = '';

  currentUserId: string | null = null;
  showAdvanced = false;

  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Récupérer l'utilisateur connecté
    this.http.get('http://127.0.0.1:8055/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (user: any) => this.currentUserId = user.data.id,
      error: (err) => console.error('Erreur récupération utilisateur:', err)
    });

    // Récupérer la liste des tags depuis Directus
 
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
    };

      /* POUR UPDATE / ADVANCED
    if (this.description) projectData.description = this.description;
    if (this.tempo) projectData.tempo = this.tempo;
    if (this.key_signature) projectData.key_signature = this.key_signature;
    if (this.cover_image) projectData.cover_image = this.cover_image;
    if (this.primary_voicebank) projectData.primary_voicebank = this.primary_voicebank;
    if (this.tags) projectData.tags = this.tags;
    */



    this.http.post('http://127.0.0.1:8055/items/projects', projectData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => this.message = 'Projet créé avec succès !',
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la création du projet';
      }
    });


    this.router.navigate(['/project', this.name]);

  }

  back() {
    this.router.navigate(['/home']);
  }
}
  