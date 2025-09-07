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
  notes: any[] = [];
  noteHeight = 20;
  midiNotes = Array.from({ length: 128 }, (_, i) => 127 - i); // de 127 à 0
  zoomFactor = 5; // 1 pixel = 5 ms


  projectId = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

 ngOnInit() {
const projectName = this.route.snapshot.paramMap.get('name'); // pas 'title'
    this.isLoggedIn = !!localStorage.getItem('token');
  if (!projectName) return;


  

  this.http.get(`http://127.0.0.1:8055/items/projects?filter[title][_eq]=${projectName}`)
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

getNoteLeft(startTime: number): number {
  return startTime / this.zoomFactor;
}

getNoteWidth(duration: number): number {
  return duration / this.zoomFactor;
}
loadNotes(projectId: string) {
  // 1️⃣ Récupère les notes du projet
  this.http.get(`http://127.0.0.1:8055/items/notes?filter[project_id][_eq]=${projectId}`)
    .subscribe({
      next: (res: any) => {
        this.notes = res.data || [];

        if (this.notes.length === 0) return;

        // 2️⃣ Récupère tous les voicebank_samples nécessaires
        const voicebankIds = Array.from(new Set(this.notes.map(n => n.voicebank_id)));

        this.http.get(`http://127.0.0.1:8055/items/voicebank_samples?filter[voicebank_id][_in]=${voicebankIds.join(',')}`)
          .subscribe((res2: any) => {
            const allSamples = res2.data || [];

            // 3️⃣ Associe le sample à chaque note
            this.notes.forEach(note => {
              const sample = allSamples.find((s: any) =>
                s.voicebank_id === note.voicebank_id &&
                s.alias_romaji.toLowerCase().startsWith(note.lyrics.toLowerCase())
              );
              if (sample) {
                note.voicebank_sample = sample;
              } else {
                console.warn('Note sans fichier:', note);
              }
            });
          });
      },
      error: (err) => console.error('Erreur récupération notes:', err)
    });
}



  back() {
    this.router.navigate(['']);
  }

  getNoteY(pitch: number): number {
  const totalNotes = 128;
  return (totalNotes - pitch) * this.noteHeight;
}

playProject() {
  if (!this.notes || this.notes.length === 0) return;

  const audioCtx = new AudioContext();

  // Précharge tous les fichiers WAV avant lecture
  const promises = this.notes.map(note => {
    if (!note.voicebank_sample || !note.voicebank_sample.filename) {
  console.warn('Note sans fichier:', note);
  return Promise.resolve(null);
}

    const url = `http://127.0.0.1:8055/assets/${note.voicebank_sample.id}`;

    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => ({
        audioBuffer,
        startTime: note.start_time / 1000 // ms -> s
      }))
      .catch(err => {
        console.error('Erreur lecture note:', err);
        return null;
      });
  });

  // Une fois tous les fichiers chargés, on joue les notes
  Promise.all(promises).then(buffers => {
    buffers.forEach(b => {
      if (!b) return;
      const source = audioCtx.createBufferSource();
      source.buffer = b.audioBuffer;
      source.connect(audioCtx.destination);
      source.start(audioCtx.currentTime + b.startTime);
    });
  });
}

}
