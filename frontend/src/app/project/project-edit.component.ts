import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent} from '../shared/app-header.component'
import { NoteComponent } from "../note/note.component"
import * as Tone from 'tone';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, NoteComponent],
  templateUrl: './project-edit.component.html',

})
export class ProjectEditComponent implements OnInit {
  title = '';
  description = '';
  tempo = '';
  key_signature = '';
  duration: number = 0; // durée du projet en ms ou unités
  message = '';
  editMode = false;
  isLoggedIn = false;

  projectId = '';
  timelineWidth: number = 1000;

  midiNotes = Array.from({ length: 24 }, (_, i) => 71 - i);
  readonly lowestPitch = 48;
  readonly highestPitch = 71;
  readonly noteHeight = 25;
  readonly timeStep = 50; // ms par bloc
  zoomFactor = 5;
  notes: any[] = [];
  moveMode: boolean = true; // déplacer les notes existantes
  addMode: boolean = false; // ajouter des notes sur la timeline
  deleteMode: boolean = false;


  phonemeBuffers: { [name: string]: AudioBuffer } = {};
  notePlayers: { name: string, startTime: number, pitch: number, velocity: number }[] = [];


  phonemes: any[] = [];
  selectedPhoneme: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

ngOnInit() {
  this.isLoggedIn = !!localStorage.getItem('token');
  const token = localStorage.getItem('token');
  if (!token) return;

  const projectName = this.route.snapshot.paramMap.get('name');
  if (!projectName) return;

  this.title = projectName;

  // Récupérer le projet depuis Directus
  this.http.get(`http://127.0.0.1:8055/items/projects?filter[title][_eq]=${projectName}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: (res: any) => {
      if (res.data && res.data.length > 0) {
        const project = res.data[0];
        this.projectId = project.id;
        this.description = project.description;
        this.tempo = project.tempo;
        this.key_signature = project.key_signature;
        this.duration = project.duration || 100; // fallback
        this.updateTimelineWidth();

        // 🔹 Utiliser la durée du projet pour la largeur de la timeline
        if (project.duration) {
          this.timelineWidth = project.duration / this.zoomFactor + 200; // marge
        } else {
          this.timelineWidth = 1000; // fallback
        }

        this.loadNotes(this.projectId);
        this.fetchPhonemes();
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


updateTimelineWidth() {
  if (!this.duration || this.duration <= 0) {
    this.timelineWidth = 1000; // fallback
    return;
  }
  this.timelineWidth = this.duration * 10; // 1 unité de duration = 10px
}



  onNoteResized(event: { note: any, newDuration: number }) {
  const { note, newDuration } = event;
  note.duration = newDuration;

  const token = localStorage.getItem('token');
  if (!token) return;

  this.http.patch(`http://127.0.0.1:8055/items/notes/${note.id}`, {
    duration: newDuration
  }, { headers: { Authorization: `Bearer ${token}` }}).subscribe({
    next: () => console.log('Note duration mise à jour'),
    error: err => console.error('Erreur mise à jour duration:', err)
  });
}



snapStartTime(rawTime: number) {
  return Math.round(rawTime / this.timeStep) * this.timeStep;
}

snapPitch(rawPitch: number) {
  if (rawPitch < this.lowestPitch) return this.lowestPitch;
  if (rawPitch > this.highestPitch) return this.highestPitch;
  return rawPitch;
}


toggleMoveMode() {
  this.moveMode = !this.moveMode;
  this.addMode = !this.moveMode; // inverse automatiquement
}

toggleDeleteMode() {
  this.deleteMode = !this.deleteMode;
}

clearNotes() {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Supprimer toutes les notes côté serveur
  const ids = this.notes.map(n => n.id);
  if (!ids.length) return;

  ids.forEach(id => {
    this.http.delete(`http://127.0.0.1:8055/items/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {},
      error: err => console.error('Erreur suppression note:', err)
    });
  });

  // Supprimer localement
  this.notes = [];
}

onNoteDeleted(note: any) {
  const token = localStorage.getItem('token');
  if (!token) return;

  this.http.delete(`http://127.0.0.1:8055/items/notes/${note.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: () => {
      this.notes = this.notes.filter(n => n.id !== note.id);
    },
    error: err => console.error('Erreur suppression note:', err)
  });
}

onTimelineClick(event: MouseEvent) {
  if (!this.addMode) return; // ne créer des notes que si on est en addMode

  if (!this.selectedPhoneme || !this.projectId) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  let clickX = event.clientX - rect.left;
  let clickY = event.clientY - rect.top;

  let rawStart = clickX * this.zoomFactor;
  let snappedStart = this.snapStartTime(rawStart);

  let clickedPitch = this.highestPitch - Math.floor(clickY / this.noteHeight);
  let snappedPitch = this.snapPitch(clickedPitch);

  const phoneme = this.phonemes.find(p => p.name === this.selectedPhoneme);
  if (!phoneme) return;

  const newNote = {
    project_id: this.projectId,
    start_time: snappedStart,
    duration: this.timeStep * 2,
    pitch: snappedPitch,
    lyrics: this.selectedPhoneme,
    voicebank_id: "e2c87d46-a184-4431-aa72-eb6b66112c52",
    phoneme_id: phoneme.id,
    order_index: this.notes.length
  };

  this.addNote(newNote);
  this.updateTimelineWidth();
}



onNoteMoved(event: { note: any, newStart: number, newPitch: number }) {
  const { note, newStart, newPitch } = event;
  note.start_time = newStart;
  note.pitch = newPitch;

  const token = localStorage.getItem('token');
  if (!token) return;

  this.http.patch(`http://127.0.0.1:8055/items/notes/${note.id}`, {
    start_time: newStart,
    pitch: newPitch
  }, { headers: { Authorization: `Bearer ${token}` }})
  .subscribe({
    next: () => console.log('Note mise à jour'),
    error: err => console.error('Erreur mise à jour note:', err)
  });
}

addNote(newNote: any) {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Vérifie si une note existe déjà au même start_time et pitch
  const exists = this.notes.find(n =>
    n.start_time === newNote.start_time && n.pitch === newNote.pitch
  );
  if (exists) return; // pas de doublon

  this.http.post(`http://127.0.0.1:8055/items/notes`, newNote, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: (res: any) => {
      this.notes.push({
        ...newNote,
        id: res.data.id,
        phoneme: { name: this.selectedPhoneme }
      });
    },
    error: err => console.error('Erreur ajout note:', err)
  });
}


  getNoteLeft(startTime: number) { return startTime / this.zoomFactor; }
  getNoteWidth(duration: number) { return duration / this.zoomFactor; }
getNoteY(pitch: number): number {
  // inverse Y pour que pitch haut soit en haut
  const index = this.highestPitch - pitch; // 71 → 0, 48 → 23
  return index * this.noteHeight;
}


fetchPhonemes() {
  this.http.get<any>('http://127.0.0.1:8055/items/phonemes')
    .subscribe(res => {
      this.phonemes = res.data;
      if (this.phonemes.length > 0) {
        this.selectedPhoneme = this.phonemes[0].name; // Choix par défaut
      }
    });
}

  loadNotes(projectId: string) {
    this.http.get(`http://127.0.0.1:8055/items/notes?filter[project_id][_eq]=${projectId}`)
      .subscribe({
        next: (res: any) => {
          this.notes = res.data || [];
          this.updateTimelineWidth();
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
}
