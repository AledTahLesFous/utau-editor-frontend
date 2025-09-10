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
      background-color: #4caf50;
      border: 1px solid #388e3c;
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
  `]
})
export class NoteComponent {
  @Input() note: any;
  @Input() left: number = 0;
  @Input() top: number = 0;
  @Input() width: number = 50;
  @Input() height: number = 20;
  @Input() zoomFactor: number = 1;
  @Input() highestPitch: number = 71;
  @Input() moveMode: boolean = true; // par défaut vrai


  @Output() noteMoved = new EventEmitter<{ note: any, newStart: number, newPitch: number }>();

  private dragging = false;
  private startX = 0;
  private startY = 0;

  onMouseDown(event: MouseEvent) {
    if (!this.moveMode) return;
    event.preventDefault();
    this.dragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;

    const mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
    const mouseUpHandler = (e: MouseEvent) => this.onMouseUp(e, mouseMoveHandler, mouseUpHandler);

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.dragging) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const newLeft = this.left + deltaX;
    const newTop = this.top + deltaY;

    // Snap to grid
    const snappedStart = Math.round(newLeft / 10) * 10;
    const snappedPitch = Math.round(newTop / this.height);

    // Update visual position
    this.left = newLeft;
    this.top = newTop;
    this.startX = event.clientX;
    this.startY = event.clientY;

    this.noteMoved.emit({
      note: this.note,
      newStart: snappedStart * this.zoomFactor,
      newPitch: this.highestPitch - snappedPitch
    });
  }

  onMouseUp(event: MouseEvent, moveHandler: any, upHandler: any) {
    this.dragging = false;
    window.removeEventListener('mousemove', moveHandler);
    window.removeEventListener('mouseup', upHandler);
  }
}
