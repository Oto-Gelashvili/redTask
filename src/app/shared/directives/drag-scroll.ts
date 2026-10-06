import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appDragScroll]',
  host: {
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'onUp($event)',
    '(pointercancel)': 'onUp($event)',
    '(click)': 'onClick($event)',
    '[class.dragging]': 'isDragging',
  },
})
export class DragScroll {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected isDragging = false;
  private isDown = false;
  private startX = 0;
  private startScroll = 0;
  private moved = false;

  protected onDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    this.isDown = true;
    this.moved = false;
    this.startX = e.clientX;
    this.startScroll = this.el.scrollLeft;
  }

  protected onMove(e: PointerEvent) {
    if (!this.isDown) return;
    const dx = e.clientX - this.startX;
    if (!this.moved && Math.abs(dx) > 5) {
      this.moved = true;
      this.isDragging = true;
      this.el.setPointerCapture(e.pointerId);
    }
    if (this.moved) this.el.scrollLeft = this.startScroll - dx;
  }

  protected onUp(e: PointerEvent) {
    if (!this.isDown) return;
    this.isDown = false;
    this.isDragging = false;
    if (this.el.hasPointerCapture(e.pointerId)) this.el.releasePointerCapture(e.pointerId);
  }

  protected onClick(e: MouseEvent) {
    if (this.moved) {
      e.stopPropagation();
      e.preventDefault();
      this.moved = false;
    }
  }
}
