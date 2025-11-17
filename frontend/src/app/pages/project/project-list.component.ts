import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
import { ProjectService } from '../../shared/services/project.service';

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

  constructor(private router: Router, private projectService: ProjectService) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.loadProjects();
  }

  loadProjects() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    this.projectService.getUserProjects(userId, token).subscribe({
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

    this.projectService.deleteProject(projectId, token).subscribe({
      next: () => {
        this.message = 'Projet supprimé avec succès !';
        this.loadProjects();
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la suppression du projet';
      }
    });
  }
}
