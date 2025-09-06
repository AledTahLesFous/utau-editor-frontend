import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent} from '../shared/app-header.component'

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  templateUrl: './project-view.component.html',

})
export class ProjectViewComponent implements OnInit {
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
const projectName = this.route.snapshot.paramMap.get('name'); // pas 'title'

  if (!projectName) return;

  this.http.get(`http://127.0.0.1:8055/items/projects?filter[title][_eq]=${projectName}`)
    .subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          const project = res.data[0];
          this.title = project.title;
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
    this.router.navigate(['']);
  }
}
