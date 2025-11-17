import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
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
  labelsWidth = 64;
  gridSize = 50; // taille d'une case horizontale (px)
  timelineWidth = 1000;

  midiNotes = Array.from({ length: 24 }, (_, i) => 71 - i);

  readonly lowestPitch = 48;
  readonly highestPitch = 71;
  readonly noteHeight = 20;
  zoomFactor = 5;
  projectId = '';

  // AUDIO
  phonemeBuffers: { [name: string]: AudioBuffer } = {};
  notePlayers: { name: string, startTime: number, pitch: number, velocity: number }[] = [];

  // ---------------- Likes ----------------
  likesCount = 0;
  userLikeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
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
            this.title = project.title;
            this.description = project.description;
            this.tempo = project.tempo;
            this.key_signature = project.key_signature;
            this.loadNotes(this.projectId);

            // Charger likes si utilisateur connecté
            if (this.isLoggedIn) {
              const userId = localStorage.getItem('userId');
              if (userId) {
                this.loadUserLike(userId);
              } else {
                this.loadLikesCount();
              }
            }
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
  getNoteY(pitch: number): number { return (this.highestPitch - pitch) * this.noteHeight; }
  back() { this.router.navigate(['']); }

  // ---------------- Audio Logic ----------------
async initializeAudio() {
  if (!this.notes || this.notes.length === 0) return;

  const phonemeNames = Array.from(new Set(this.notes.map(n => n.phoneme?.name).filter(Boolean)));
  for (const name of phonemeNames) {
    const url = `http://127.0.0.1:8055/download-voicebank/${this.notes[0].voicebank_id}/sample-romaji/${name}`;
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    this.phonemeBuffers[name] = await Tone.context.decodeAudioData(arrayBuffer);
  }

  const tempoFactor = 120 / Number(this.tempo); // <-- déclarée ici
  this.notePlayers = this.notes.map(note => ({
    name: note.phoneme.name,
    startTime: (note.start_time / 1000) * tempoFactor,  // ajusté selon tempo
    pitch: note.pitch,
    velocity: note.velocity || 1
  }));
}



async playAudio() {
  if (!this.notePlayers.length) return;

  await Tone.start();
  const now = Tone.now();

  this.notePlayers.forEach(n => {
    const buffer = this.phonemeBuffers[n.name];
    if (!buffer) return;
    const player = new Tone.Player(buffer).toDestination();
    const semitoneDiff = n.pitch - 60;
    player.playbackRate = Math.pow(2, semitoneDiff / 12);
    player.start(now + n.startTime); // n.startTime déjà ajusté
  });
}


  // ---------------- Likes Logic ----------------
  loadUserLike(userId: string) {
    this.http.get(`http://127.0.0.1:8055/items/likes?filter[project_id][_eq]=${this.projectId}&filter[user_id][_eq]=${userId}`)
      .subscribe({
        next: (res: any) => {
          this.userLikeId = res.data?.[0]?.id || null;
          this.loadLikesCount();
        },
        error: (err) => console.error('Erreur récupération user like:', err)
      });
  }

  loadLikesCount() {
    this.http.get(`http://127.0.0.1:8055/items/likes?filter[project_id][_eq]=${this.projectId}`)
      .subscribe({
        next: (res: any) => this.likesCount = res.data.length,
        error: (err) => console.error('Erreur récupération likes count:', err)
      });
  }

  toggleLike() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    if (this.userLikeId) {
      this.http.delete(`http://127.0.0.1:8055/items/likes/${this.userLikeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => { this.userLikeId = null; this.likesCount--; },
        error: (err) => console.error('Erreur suppression like:', err)
      });
    } else {
      this.http.post(`http://127.0.0.1:8055/items/likes`, {
        project_id: this.projectId,
        user_id: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res: any) => {
          this.userLikeId = res.data.id;
          this.likesCount++;
        },
        error: (err) => console.error('Erreur ajout like:', err)
      });
    }
  }
}
