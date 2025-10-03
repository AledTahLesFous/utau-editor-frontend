import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-note',
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
      border: 1px solid #ffffffff;
      border-radius: 2px;
      cursor: grab;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
    }
    .note.dragging {
      opacity: 0.7;
      cursor: grabbing;
    }
    .note.resizing {
      cursor: ew-resize;
    }
  `]
})
export class NoteComponent {
  @Input() note: any;
  @Input() left: number = 0;
  @Input() top: number = 0;
  @Input() width: number = 500;
  @Input() height: number = 25;
  @Input() zoomFactor: number = 1;
  @Input() highestPitch: number = 71;
  @Input() deleteMode: boolean = false;
  @Input() moveMode: boolean = true;
  @Input() timelineWidth: number = 5000000; // en px
  @Input() timelineHeight: number = 60000; // en px


  @Output() noteMoved = new EventEmitter<{ note: any, newStart: number, newPitch: number }>();
  @Output() noteResized = new EventEmitter<{ note: any, newDuration: number }>();
  @Output() noteDeleted = new EventEmitter<any>();

  private dragging = false;
  private resizing = false;
  private startX = 0;
  private startY = 0;
  private resizeThreshold = 5; // px pour détecter le resize
  private initialTop = 0;

  private offsetX = 0;
  private offsetY = 0;

  onMouseDown(event: MouseEvent) {
  if (this.deleteMode) {
    this.noteDeleted.emit(this.note);
    return;
  }
  if (!this.moveMode) return;

  event.preventDefault();

  // Décalage entre la souris et le coin supérieur gauche de la note
  this.offsetX = event.clientX - this.left;
  this.offsetY = event.clientY - this.top;

  // Vérifie si resize (clic sur bord droit)
  this.resizing = event.offsetX >= this.width - this.resizeThreshold;
  this.dragging = !this.resizing;

  const mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
  const mouseUpHandler = (e: MouseEvent) => this.onMouseUp(e, mouseMoveHandler, mouseUpHandler);

  window.addEventListener('mousemove', mouseMoveHandler);
  window.addEventListener('mouseup', mouseUpHandler);
  }

onMouseMove(event: MouseEvent) {
  if (this.dragging) {
    const timelineEl = (event.target as HTMLElement).closest('.timeline') as HTMLElement;
    const containerRect = timelineEl?.getBoundingClientRect();

    const scrollLeft = timelineEl?.scrollLeft || 0;
    const scrollTop = timelineEl?.scrollTop || 0;

    let newLeft = event.clientX - containerRect.left + scrollLeft - this.offsetX;
    let newTop = event.clientY - containerRect.top + scrollTop - this.offsetY;

    // Snap vertical pour le pitch
    const snappedPitchIndex = Math.floor(newTop / this.height);
    newTop = snappedPitchIndex * this.height;

    this.left = newLeft;
    this.top = newTop;

    this.noteMoved.emit({
      note: this.note,
      newStart: this.left * this.zoomFactor,
      newPitch: this.highestPitch - snappedPitchIndex
    });
  }

  if (this.resizing) {
    const deltaX = event.clientX - (this.left + this.width);
    let newWidth = this.width + deltaX;
    if (newWidth < 10) newWidth = 10;
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
