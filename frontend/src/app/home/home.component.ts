import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- important pour *ngIf
import { AppHeaderComponent } from '../shared/app-header.component'; // <-- important pour *ngIf
import { ProjectService } from '../services/project.service'; // adapte le chemin
import { Projet } from '../models/project.model'; // adapte aussi
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true, // si tu veux que ce component soit standalone
  imports: [CommonModule, AppHeaderComponent], // <-- ngIf et autres directives Angular
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  isLoggedIn = !!localStorage.getItem('token');
  projets: Projet[] = [];
  loading = true;
  error: string | null = null;

  constructor(private router: Router, private projectService: ProjectService) {}


    ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: (response) => {
        this.projets = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des projets';
        this.loading = false;
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    this.isLoggedIn = false;
    this.router.navigate(['/auth']);
  }

goToCreateProjet() {
  const token = localStorage.getItem('token');
  if (!token) {
    // pas connecté → redirige vers /auth
    this.router.navigate(['/auth']);
    return;
  }
  // connecté → va sur la page de création
  this.router.navigate(['/project']);
}

  goToProject(title: string) {
    this.router.navigate(['/project-view', title]);
  }


  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}

