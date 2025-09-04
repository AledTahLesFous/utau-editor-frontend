import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="text-align:center; margin-top:50px;">
      <h2>Créer un nouveau projet</h2>
      <form (ngSubmit)="createProject()">
        <input type="text" [(ngModel)]="projectName" name="projectName" placeholder="Nom du projet" required />
        <button type="submit">Créer</button>
      </form>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `
})
export class ProjetComponent {
  projectName = '';
  message = '';
  currentUserId: string | null = null; // pour stocker l'id de l'utilisateur connecté

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Récupérer l'utilisateur connecté
    this.http.get('http://127.0.0.1:8055/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (user: any) => {
        this.currentUserId = user.data.id; // stocke l'id pour créer le projet
      },
      error: (err) => {
        console.error('Erreur récupération utilisateur:', err);
      }
    });
  }

  createProject() {
    const token = localStorage.getItem('token');
    if (!token || !this.currentUserId) {
      this.message = 'Impossible de créer le projet : utilisateur non identifié.';
      return;
    }

    this.http.post('http://127.0.0.1:8055/items/projects', 
      { 
        title: this.projectName,
        user_created: this.currentUserId,
        status: "draft"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => this.message = 'Projet créé avec succès !',
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la création du projet';
      }
    });
  }
}
