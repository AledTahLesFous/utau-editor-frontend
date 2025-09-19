import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent} from '../../shared/components/app-header.component'

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent],
  templateUrl: './project-list.component.html',

})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  message = '';
  isLoggedIn = false;
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.loadProjects();
  }

  loadProjects() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    this.http.get(`http://127.0.0.1:8055/items/projects?filter[user_created][_eq]=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => this.projects = res.data || [],
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la récupération des projets';
      }
    });
  }

  viewProject(projectName: string) {
    this.router.navigate(['/project', projectName]);
  }

  deleteProject(projectId: string) {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    this.http.delete(`http://127.0.0.1:8055/items/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.message = 'Projet supprimé avec succès !';
        this.loadProjects(); // recharge la liste
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la suppression du projet';
      }
    });
  }
}
