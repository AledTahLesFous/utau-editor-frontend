import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-note',
  standalone: true,
  template: `
    <div
      class="note"
      [class.dragging]="dragging"
      [class.resizing]="resizing"
      [style.left.px]="left"
      [style.top.px]="top"
      [style.width.px]="width"
      [style.height.px]="height"
      (mousedown)="onMouseDown($event)"
    >
      {{ note.lyrics }}
    </div>
  `,
  styles: [`
    .note {
      position: absolute;
      background-color: #662a58a1;
      border: 1px solid #fff;
      border-radius: 2px;
      cursor: grab;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
    }
    .note.dragging { opacity: 0.7; cursor: grabbing; }
    .note.resizing { cursor: ew-resize; }
  `]
})
export class NoteComponent {
  @Input() note: any;
  @Input() left = 0;
  @Input() top = 0;
  @Input() width = 100;
  @Input() height = 25;
  @Input() zoomFactor = 1;
  @Input() highestPitch = 71;
  @Input() lowestPitch = 0; // Ajouté pour éviter une erreur
  @Input() deleteMode = false;
  @Input() moveMode = true;
  @Input() timelineWidth = 5000;
  @Input() timelineHeight = 6000;
  @Input() gridSize = 50;
  @Input() labelsWidth = 0;

  @Output() noteMoved = new EventEmitter<{ note: any, newStart: number, newPitch: number }>();
  @Output() noteResized = new EventEmitter<{ note: any, newDuration: number }>();
  @Output() noteDeleted = new EventEmitter<any>();

  dragging = false;
  resizing = false;
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private resizeThreshold = 5;

  onMouseDown(event: MouseEvent) {
    if (this.deleteMode) {
      this.noteDeleted.emit(this.note);
      return;
    }
      if (event.button === 2) {
    this.noteDeleted.emit(this.note);
    return;
  }
    if (!this.moveMode) return;

    event.preventDefault();

    const timelineEl = (event.target as HTMLElement).closest('.timeline') as HTMLElement;
    if (!timelineEl) return;

    const rect = timelineEl.getBoundingClientRect();

    this.offsetX = event.clientX - rect.left - this.left;
    this.offsetY = event.clientY - rect.top - this.top;

    this.resizing = event.offsetX >= this.width - this.resizeThreshold;
    this.dragging = !this.resizing;

    const moveHandler = (e: MouseEvent) => this.onMouseMove(e, timelineEl);
    const upHandler = (e: MouseEvent) => this.onMouseUp(e, moveHandler, upHandler);

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }

  onMouseMove(event: MouseEvent, timelineEl: HTMLElement) {
    const rect = timelineEl.getBoundingClientRect();
    
    if (this.dragging) {
      // Horizontal snapping
      let rawLeft = event.clientX - rect.left + timelineEl.scrollLeft - this.offsetX - this.labelsWidth;
      const snappedLeftPx = Math.round(rawLeft / this.gridSize) * this.gridSize;
      this.left = Math.max(0, Math.min(snappedLeftPx, this.timelineWidth - this.width));

      // Vertical snapping
      let pitchIndex = Math.round((event.clientY - rect.top + timelineEl.scrollTop - this.offsetY) / this.height);
      pitchIndex = Math.max(0, Math.min(pitchIndex, this.highestPitch - this.lowestPitch));
      this.top = pitchIndex * this.height;

      this.noteMoved.emit({
        note: this.note,
        newStart: this.left * this.zoomFactor,
        newPitch: this.highestPitch - pitchIndex
      });
    }

    if (this.resizing) {
      let newWidth = event.clientX - rect.left + timelineEl.scrollLeft - this.offsetX;
      newWidth = Math.round(newWidth / this.gridSize) * this.gridSize;
      this.width = Math.max(this.gridSize, newWidth);

      this.noteResized.emit({
        note: this.note,
        newDuration: this.width * this.zoomFactor
      });
    }
  }

  onMouseUp(event: MouseEvent, moveHandler: any, upHandler: any) {
    this.dragging = false;
    this.resizing = false;
    window.removeEventListener('mousemove', moveHandler);
    window.removeEventListener('mouseup', upHandler);
  }
}
