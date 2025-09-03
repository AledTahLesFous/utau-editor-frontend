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

  constructor(private http: HttpClient) {}

  createProject() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.post('http://127.0.0.1:8055/items/projects', 
      { title: this.projectName,
        status: "draft"
       },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => this.message = 'Projet créé avec succès !',
      error: () => this.message = 'Erreur lors de la création du projet'
    });
  }
}
