import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
import { NoteComponent } from '../note/note.component';
import { ProjectService } from '../../shared/services/project.service'; // <-- à créer/importer
import * as Tone from 'tone';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, NoteComponent],
  templateUrl: './project-edit.component.html'
})
export class ProjectEditComponent implements OnInit {
  title = '';
  description = '';
  tempo = '';
  key_signature = '';
  duration = 0;
  durationEdit = 0;
  projectId = '';
  message = '';
  editMode = false;
  isLoggedIn = false;
  moveMode = true;
  addMode = false;
  deleteMode = false;
  timelineWidth = 1000;
  zoomFactor = 5;
  readonly lowestPitch = 48;
  readonly highestPitch = 71;
  gridSize = 50; // taille d'une case horizontale (px)

  readonly noteHeight = 25;
  readonly timeStep = 50;
  midiNotes = Array.from({ length: 24 }, (_, i) => 71 - i);
  notes: any[] = [];
  phonemeBuffers: { [name: string]: AudioBuffer } = {};
  notePlayers: { name: string, startTime: number, pitch: number, velocity: number }[] = [];
  phonemes: any[] = [];
  selectedPhoneme: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    const token = localStorage.getItem('token');
    if (!token) return;

    const projectName = this.route.snapshot.paramMap.get('name');
    if (!projectName) return;

    this.title = projectName;

    this.projectService.getProjectByTitle(projectName, token).subscribe({
      next: (res) => {
        const project = res?.data?.[0];
        if (!project) {
          this.message = 'Projet introuvable';
          return;
        }

        this.projectId = project.id;
        this.description = project.description;
        this.tempo = project.tempo;
        this.key_signature = project.key_signature;
        this.duration = project.duration || 100;
        this.durationEdit = this.duration;
        this.updateTimelineWidth();

        if (project.duration) {
          this.timelineWidth = project.duration / this.zoomFactor + 200;
        } else {
          this.timelineWidth = 1000;
        }

        this.loadNotes(this.projectId);
        this.fetchPhonemes();
      },
      error: () => this.message = 'Erreur lors de la récupération du projet'
    });
  }

  updateTimelineWidth() {
    this.timelineWidth = this.duration > 0 ? this.duration * 10 : 1000;
  }

  toggleMoveMode() {
    this.moveMode = !this.moveMode;
    this.addMode = !this.moveMode;
  }

  toggleDeleteMode() {
    this.deleteMode = !this.deleteMode;
  }

  clearNotes() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const ids = this.notes.map(n => n.id);
    ids.forEach(id => {
      this.projectService.deleteNote(id, token).subscribe();
    });

    this.notes = [];
  }

  onNoteDeleted(note: any) {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.projectService.deleteNote(note.id, token).subscribe({
      next: () => this.notes = this.notes.filter(n => n.id !== note.id)
    });
  }

  onNoteResized(event: { note: any, newDuration: number }) {
    const token = localStorage.getItem('token');
    if (!token) return;

    event.note.duration = event.newDuration;
    this.projectService.updateNote(event.note.id, { duration: event.newDuration }, token).subscribe();
  }

  onNoteMoved(event: { note: any, newStart: number, newPitch: number }) {
    const token = localStorage.getItem('token');
    if (!token) return;

    event.note.start_time = event.newStart;
    event.note.pitch = event.newPitch;

    this.projectService.updateNote(event.note.id, {
      start_time: event.newStart,
      pitch: event.newPitch
    }, token).subscribe();
  }

onTimelineClick(event: MouseEvent) {
  if (!this.addMode || !this.selectedPhoneme || !this.projectId) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // ✅ Snap horizontal sur la grille (pixels)
  const snappedLeftPx = Math.round(clickX / this.gridSize) * this.gridSize;

  // ✅ Snap vertical (pitch)
  const snappedPitchIndex = Math.floor(clickY / this.noteHeight);
  const snappedPitch = this.highestPitch - snappedPitchIndex;

  const phoneme = this.phonemes.find(p => p.name === this.selectedPhoneme);
  if (!phoneme) return;

  const newNote = {
    project_id: this.projectId,
    start_time: snappedLeftPx * this.zoomFactor, // ✅ converti en temps
    duration: this.gridSize * this.zoomFactor,   // ✅ durée = 1 case
    pitch: snappedPitch,
    lyrics: this.selectedPhoneme,
    voicebank_id: 'dcf322c1-9c36-45cd-8e07-cb08f791c361',
    phoneme_id: phoneme.id,
    order_index: this.notes.length,
    left: snappedLeftPx,                        // ✅ affichage
    top: snappedPitchIndex * this.noteHeight,
    width: this.gridSize,
    height: this.noteHeight
  };

  this.addNote(newNote);
}


  addNote(newNote: any) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const exists = this.notes.find(n => n.start_time === newNote.start_time && n.pitch === newNote.pitch);
    if (exists) return;

    this.projectService.addNote(newNote, token).subscribe({
      next: (res) => {
        this.notes.push({
          ...newNote,
          id: res.data.id,
          phoneme: { name: this.selectedPhoneme }
        });
        this.updateTimelineWidth();
      }
    });
  }

  updateProject() {
    const token = localStorage.getItem('token');
    if (!token || !this.projectId) return;

    const data = {
      description: this.description,
      tempo: this.tempo,
      key_signature: this.key_signature,
      duration: this.durationEdit
    };

    this.projectService.updateProjectById(this.projectId, data, token).subscribe({
      next: () => {
        this.duration = this.durationEdit;
        this.updateTimelineWidth();
        this.editMode = false;
        this.message = 'Projet mis à jour avec succès !';
      },
      error: () => this.message = 'Erreur lors de la mise à jour'
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.durationEdit = this.duration;
  }

  back() {
    this.router.navigate(['/projects']);
  }

  fetchPhonemes() {
    this.projectService.getAllPhonemes().subscribe({
      next: (res) => {
        this.phonemes = res.data;
        if (this.phonemes.length) {
          this.selectedPhoneme = this.phonemes[0].name;
        }
      }
    });
  }

  loadNotes(projectId: string) {
    this.projectService.getNotesByProject(projectId).subscribe({
      next: (res) => {
        this.notes = res.data || [];
        this.updateTimelineWidth();

        if (!this.notes.length) return;

        const phonemeIds = [...new Set(this.notes.map(n => n.phoneme_id))];
        this.projectService.getPhonemesByIds(phonemeIds).subscribe((phonemeRes) => {
          const phonemes = phonemeRes.data || [];
          this.notes.forEach(note => {
            note.phoneme = phonemes.find((p: any) => p.id === note.phoneme_id);
          });
        });
      }
    });
  }

  snapStartTime(rawTime: number) {
    return Math.round(rawTime / this.timeStep) * this.timeStep;
  }

  snapPitch(rawPitch: number) {
    return Math.min(Math.max(rawPitch, this.lowestPitch), this.highestPitch);
  }

  getNoteY(pitch: number) {
    return (this.highestPitch - pitch) * this.noteHeight;
  }

  getNoteLeft(startTime: number) { return startTime / this.zoomFactor; }
  getNoteWidth(duration: number) { return duration / this.zoomFactor; }

  async initializeAudio() {
    if (!this.notes.length) return;

    const phonemeNames = [...new Set(this.notes.map(n => n.phoneme?.name).filter(Boolean))];
    for (const name of phonemeNames) {
      const url = `http://127.0.0.1:8055/download-voicebank/${this.notes[0].voicebank_id}/sample-romaji/${name}`;
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      this.phonemeBuffers[name] = await Tone.context.decodeAudioData(arrayBuffer);
    }

    this.notePlayers = this.notes.map(note => ({
      name: note.phoneme.name,
      startTime: note.start_time / 1000,
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
      player.start(now + n.startTime);
    });
  }
}
