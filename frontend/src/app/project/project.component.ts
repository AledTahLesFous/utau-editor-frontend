import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent {
  projectName = '';
  projectDescription = '';
  projectTempo = '';
  message = '';
  currentUserId: string | null = null;
  showAdvanced = false;

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
      title: this.projectName,
      user_created: this.currentUserId,
      status: 'draft'
    };

    if (this.projectDescription) projectData.description = this.projectDescription;
    if (this.projectTempo) projectData.tempo = this.projectTempo;



    this.http.post('http://127.0.0.1:8055/items/projects', projectData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => this.message = 'Projet créé avec succès !',
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la création du projet';
      }
    });
  }

  back() {
    this.router.navigate(['/home']);
  }
}
  