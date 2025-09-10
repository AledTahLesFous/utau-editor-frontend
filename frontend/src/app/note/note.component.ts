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
  @Input() height: number = 20;
  @Input() zoomFactor: number = 1;
  @Input() highestPitch: number = 71;
  @Input() deleteMode: boolean = false;
  @Input() moveMode: boolean = true;
  @Input() timelineWidth: number = 0; // en px
  @Input() timelineHeight: number = 60000; // en px


  @Output() noteMoved = new EventEmitter<{ note: any, newStart: number, newPitch: number }>();
  @Output() noteResized = new EventEmitter<{ note: any, newDuration: number }>();
  @Output() noteDeleted = new EventEmitter<any>();

  private dragging = false;
  private resizing = false;
  private startX = 0;
  private startY = 0;
  private resizeThreshold = 5; // px pour détecter le resize

  onMouseDown(event: MouseEvent) {
    if (this.deleteMode) {
    this.noteDeleted.emit(this.note);
    return;
  }
  if (!this.moveMode) return; // drag uniquement si moveMode

    event.preventDefault();
    this.startX = event.clientX;
    this.startY = event.clientY;

    // Détecte si on clique sur le bord droit pour resize
    if (event.offsetX >= this.width - this.resizeThreshold) {
      this.resizing = true;
    } else {
      this.dragging = true;
    }

    const mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
    const mouseUpHandler = (e: MouseEvent) => this.onMouseUp(e, mouseMoveHandler, mouseUpHandler);

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  }

onMouseMove(event: MouseEvent) {
  const deltaX = event.clientX - this.startX;
  const deltaY = event.clientY - this.startY;

  if (this.dragging) {
  // Horizontal
  this.left += deltaX;
  const LEFT_PADDING = 50;
if (this.left < LEFT_PADDING) this.left = LEFT_PADDING;

  if (this.left + this.width > this.timelineWidth) this.left = this.timelineWidth - this.width;

  // Vertical (snap)
  const snappedPitchIndex = Math.round((this.top + deltaY) / this.height);
  let newTop = snappedPitchIndex * this.height;
  if (newTop < 0) newTop = 0;
  if (newTop + this.height > this.timelineHeight) newTop = this.timelineHeight - this.height;
  this.top = newTop;

  this.startX = event.clientX;
  this.startY = event.clientY;

  this.noteMoved.emit({
    note: this.note,
    newStart: this.left * this.zoomFactor,
    newPitch: this.highestPitch - snappedPitchIndex
  });

  }

  if (this.resizing) {
    let newWidth = this.width + deltaX;
    if (newWidth < 10) newWidth = 10;
    this.width = newWidth;
    this.startX = event.clientX;

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
