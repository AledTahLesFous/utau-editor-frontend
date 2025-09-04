import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-view.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectViewComponent implements OnInit {
  name = '';
  description = '';
  tempo = '';
  key_signature = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const projectName = this.route.snapshot.paramMap.get('name');
    if (!projectName) return;

    this.name = projectName;

    // Récupérer les infos du projet depuis Directus
    this.http.get(`http://127.0.0.1:8055/items/projects?filter[title][_eq]=${projectName}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          const project = res.data[0];
          this.description = project.description;
          this.tempo = project.tempo;
          this.key_signature = project.key_signature;
        } else {
          this.message = 'Projet introuvable';
        }
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la récupération du projet';
      }
    });
  }

  back() {
    this.router.navigate(['/projet']); // retour à la création d’un projet
  }
}
