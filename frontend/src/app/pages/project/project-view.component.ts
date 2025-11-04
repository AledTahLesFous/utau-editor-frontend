import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
import { ProjectService } from '../../shared/services/project.service';

// Assure-toi d'installer Tone.js : npm install tone
import * as Tone from 'tone';

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
  notes: any[] = [];

  likesCount = 0;
  userLikeId: string | null = null;

  midiNotes = Array.from({ length: 24 }, (_, i) => 71 - i);




  readonly lowestPitch = 48;
  readonly highestPitch = 71;
  readonly noteHeight = 20;
  zoomFactor = 5;
  projectId = '';

  // AUDIO
  phonemeBuffers: { [name: string]: AudioBuffer } = {};
  notePlayers: { name: string, startTime: number, pitch: number, velocity: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private projectService: ProjectService 
  ) {}

  ngOnInit() {
  const projectName = this.route.snapshot.paramMap.get('name');
  this.isLoggedIn = !!localStorage.getItem('token');
  if (!projectName) return;

  this.http
    .get(`http://127.0.0.1:8055/items/projects?filter[title][_eq]=${projectName}`)
    .subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          const project = res.data[0];
          this.projectId = project.id;

          const userId = localStorage.getItem('userId');
          if (userId) this.loadUserLike(userId);

          this.title = project.title;
          this.description = project.description;
          this.tempo = project.tempo;
          this.key_signature = project.key_signature;
          this.loadNotes(this.projectId);
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




  loadNotes(projectId: string) {
    this.http.get(`http://127.0.0.1:8055/items/notes?filter[project_id][_eq]=${projectId}`)
      .subscribe({
        next: (res: any) => {
          this.notes = res.data || [];
          if (!this.notes.length) return;

          const phonemeIds = Array.from(new Set(this.notes.map(n => n.phoneme_id)));
          this.http.get(`http://127.0.0.1:8055/items/phonemes?filter[id][_in]=${phonemeIds.join(',')}`)
            .subscribe((phonemesRes: any) => {
              const phonemes = phonemesRes.data || [];
              this.notes.forEach(note => {
                note.phoneme = phonemes.find((p: any) => p.id === note.phoneme_id);
              });
            });
        },
        error: (err) => console.error('Erreur récupération notes:', err)
      });
  }

  getNoteLeft(startTime: number) { return startTime / this.zoomFactor; }
  getNoteWidth(duration: number) { return duration / this.zoomFactor; }

getNoteY(pitch: number): number {
  // Inverse le Y pour que pitch haut soit en haut
  const relativePitch = this.highestPitch - pitch;
  return relativePitch * this.noteHeight;
}
  back() { this.router.navigate(['']); }

  // ----------------------------
  // AUDIO LOGIC avec Tone.js
  // ----------------------------
  async initializeAudio() {
    if (!this.notes || this.notes.length === 0) return;

    // Précharge les buffers uniques
    const phonemeNames = Array.from(new Set(this.notes.map(n => n.phoneme?.name).filter(Boolean)));

    await Promise.all(phonemeNames.map(async name => {
      const url = `http://127.0.0.1:8055/download-voicebank/${this.notes[0].voicebank_id}/sample-romaji/${name}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Échec chargement phoneme ${name}`);
      const arrayBuffer = await res.arrayBuffer();
      this.phonemeBuffers[name] = await Tone.context.decodeAudioData(arrayBuffer);
    }));

    // Préparer chaque note individuellement
    this.notePlayers = [];
    this.notes.forEach(note => {
      if (!note.phoneme?.name) return;
      this.notePlayers.push({
        name: note.phoneme.name,
        startTime: note.start_time / 1000, // ms → s
        pitch: note.pitch,
        velocity: note.velocity || 1
      });
    });

    console.log('✅ Audio initialisé avec Tone.js');
  }

  async playAudio() {
    if (!this.notePlayers.length) return;

    await Tone.start(); // nécessaire pour iOS et autoplay policy
    const now = Tone.now();

    this.notePlayers.forEach(n => {
      const buffer = this.phonemeBuffers[n.name];
      if (!buffer) return;

      // Chaque note est jouée via un player avec pitch-shift
      const player = new Tone.Player(buffer).toDestination();

      // Calcule la transposition par demi-tons (note MIDI)
      const semitoneDiff = n.pitch - 60; // 60 = pitch de référence
      player.playbackRate = Math.pow(2, semitoneDiff / 12);

      // Démarrage au temps correct
      player.start(now + n.startTime);
    });

    console.log('▶️ Lecture des notes lancée');
  }

  loadUserLike(userId: string) {
  this.projectService.getUserLikeForProject(userId, this.projectId).subscribe({
    next: (res: any) => {
      if (res.data && res.data.length > 0) {
        this.userLikeId = res.data[0].id;
      } else {
        this.userLikeId = null;
      }
      this.loadLikesCount();
    },
    error: (err) => console.error('Erreur récupération like utilisateur', err)
  });
}

loadLikesCount() {
  this.projectService.getLikesByProject(this.projectId).subscribe({
    next: (res: any) => this.likesCount = res.data.length,
    error: (err) => console.error('Erreur récupération nombre de likes', err)
  });
}

toggleLike() {
  console.log(this.projectId);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  console.log(userId);

  if (!token || !userId) return;

  if (this.userLikeId) {
    // Supprimer le like existant
    this.projectService.removeLike(this.userLikeId, token).subscribe({
      next: () => {
        this.userLikeId = null;
        this.likesCount--;
      },
      error: (err) => console.error('Erreur suppression like', err)
    });
  } else {
    // Ajouter un nouveau like
    this.projectService.addLike(this.projectId, userId, token).subscribe({
      next: (res: any) => {
        this.userLikeId = res.data.id;
        this.likesCount++;
      },
      error: (err) => console.error('Erreur ajout like', err)
    });
  }
}
}
