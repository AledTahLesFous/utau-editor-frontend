import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-note',
  standalone: true,
  template: `
    <div
      class="note"
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
  @Input() deleteMode = false;
  @Input() moveMode = true;
  @Input() timelineWidth = 5000;
  @Input() timelineHeight = 6000;
  @Input() gridSize = 50;
  

  @Output() noteMoved = new EventEmitter<{ note: any, newStart: number, newPitch: number }>();
  @Output() noteResized = new EventEmitter<{ note: any, newDuration: number }>();
  @Output() noteDeleted = new EventEmitter<any>();

  private dragging = false;
  private resizing = false;
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
    if (!this.moveMode) return;

    event.preventDefault();

    this.offsetX = event.clientX - this.left;
    this.offsetY = event.clientY - this.top;

    this.resizing = event.offsetX >= this.width - this.resizeThreshold;
    this.dragging = !this.resizing;

    const moveHandler = (e: MouseEvent) => this.onMouseMove(e);
    const upHandler = (e: MouseEvent) => this.onMouseUp(e, moveHandler, upHandler);

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }

  onMouseMove(event: MouseEvent) {
    const timelineEl = (event.target as HTMLElement).closest('.timeline') as HTMLElement;
    const rect = timelineEl?.getBoundingClientRect();
    const scrollLeft = timelineEl?.scrollLeft || 0;
    const scrollTop = timelineEl?.scrollTop || 0;

    if (this.dragging && rect) {
      let newLeft = event.clientX - rect.left + scrollLeft - this.offsetX;
      let newTop = event.clientY - rect.top + scrollTop - this.offsetY;

      // Snapping
      newLeft = Math.round(newLeft / this.gridSize) * this.gridSize;
      newTop = Math.round(newTop / this.height) * this.height;

      this.left = newLeft;
      this.top = newTop;

      const snappedPitchIndex = Math.floor(newTop / this.height);
      this.noteMoved.emit({
        note: this.note,
        newStart: this.left * this.zoomFactor,
        newPitch: this.highestPitch - snappedPitchIndex
      });
    }

    if (this.resizing) {
      const deltaX = event.clientX - (this.left + this.width);
      let newWidth = this.width + deltaX;
      newWidth = Math.round(newWidth / this.gridSize) * this.gridSize;
      if (newWidth < this.gridSize) newWidth = this.gridSize;
      this.width = newWidth;

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
