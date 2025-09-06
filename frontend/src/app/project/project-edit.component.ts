import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent} from '../shared/app-header.component'

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  templateUrl: './project-edit.component.html',

})
export class ProjectEditComponent implements OnInit {
  title = '';
  description = '';
  tempo = '';
  key_signature = '';
  message = '';
  editMode = false;
  isLoggedIn = false;

  projectId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    const token = localStorage.getItem('token');
    if (!token) return;

    const projectName = this.route.snapshot.paramMap.get('title');
    if (!projectName) return;

    this.title = projectName;

    // Récupérer le projet depuis Directus
    this.http.get(`http://127.0.0.1:8055/items/projects?filter[title][_eq]=${projectName}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          const project = res.data[0];
          this.projectId = project.id; // stocker l'ID pour l'update
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

  goToMyProject() {
  const title = localStorage.getItem('myProjectTitle');
  if (title) {
    this.router.navigate(['/project', title]);
  }
}


  updateProject() {
    const token = localStorage.getItem('token');
    if (!token || !this.projectId) return;

    const projectData: any = {
      description: this.description,
      tempo: this.tempo,
      key_signature: this.key_signature
    };

    this.http.patch(`http://127.0.0.1:8055/items/projects/${this.projectId}`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.message = 'Projet mis à jour avec succès !';
        this.editMode = false;
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erreur lors de la mise à jour';
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    // Optionnel : reload des infos depuis Directus pour annuler les modifications locales
    this.ngOnInit();
  }

  back() {
    this.router.navigate(['/projects']);
  }
}
