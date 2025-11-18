import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../shared/services/project.service';
import { AuthService } from '../../shared/services/auth.service';
import { AppHeaderComponent} from '../../shared/components/app-header.component'
import { FilePreviewPipe } from '../../shared/interfaces/filePreview';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, FilePreviewPipe],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent implements OnInit {
  name = '';
  description = '';
  tempo: number = 120;
  key_signature = 'C';
  duration = 100;
  coverFile: File | null = null; // fichier sélectionné
  status = '';
tagsOptions: any[] = [];        // liste des tags disponibles depuis Directus
selectedTags: string[] = [];   

  // ✅ La liste complète des voicebanks
  voicebanks: any[] = [];

  // ✅ L'ID du voicebank choisi comme primary
  primary_voicebank: string = '';

  currentUserId: string | null = null;
  showAdvanced = false;
  message = '';

  isLoggedIn = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    if (!token) return;

    // Récupérer toutes les voicebanks
    this.projectService.getVoicebanks(token).subscribe({
      next: (response: any) => {
        this.voicebanks = response.data; // stocke toutes les voicebanks
      },
      error: (err) => {
        console.error('Erreur lors du chargement des voicebanks:', err);
      }
    });

this.projectService.getTags(token).subscribe({
  next: (res: any) => {
    this.tagsOptions = res.data || [];
  },
  error: (err) => console.error('Erreur récupération des tags :', err)
});

    // Récupérer l'utilisateur connecté
    this.authService.getMe(token).subscribe({
      next: (user: any) => this.currentUserId = user.data.id,
      error: (err) => {
        console.error('Erreur récupération utilisateur:', err);
        this.message = 'Impossible de récupérer l’utilisateur connecté.';
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.coverFile = event.target.files[0];
    }
  }
  back() {
  this.router.navigate(['']);
}


createProject() {
  const token = localStorage.getItem('token');
  if (!token || !this.currentUserId) return;

  const projectData: any = {
    title: this.name,
    user_created: this.currentUserId,
    primary_voicebank: this.primary_voicebank
  };

  if (this.description?.trim()) projectData.description = this.description;
  if (this.tempo) projectData.tempo = this.tempo;
  if (this.key_signature?.trim()) projectData.key_signature = this.key_signature;

  if (this.selectedTags.length > 0) {
    // Envoie des IDs pour la relation many-to-many
    projectData.test = this.selectedTags;
  }

  if (this.coverFile) {
    this.projectService.uploadFile(this.coverFile, token).subscribe({
      next: (res: any) => {
        projectData.cover_image = res.data.id;
        this.submitProject(projectData, token);
      },
      error: (err) => {
        console.error('Erreur upload fichier:', err);
        this.message = 'Impossible de téléverser l’image';
      }
    });
  } else {
    this.submitProject(projectData, token);
  }
}

getTagName(tagId: string): string {
  const tag = this.tagsOptions.find(t => t.id === tagId);
  return tag ? tag.name : '';
}


private submitProject(projectData: any, token: string) {
  this.projectService.createProject(projectData, token).subscribe({
    next: () => {
      this.message = 'Projet créé avec succès !';
      this.router.navigate(['/project', this.name]);
    },
    error: (err) => {
      console.error(err);
      this.message = 'Erreur lors de la création du projet';
    }
  });
}

}

