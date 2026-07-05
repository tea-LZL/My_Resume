import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/**
 * Makes elements subtly follow the cursor on hover, creating a "magnetic" effect.
 *
 * Usage:
 *   <button appMagneticHover>Click</button>
 *   <button appMagneticHover [magneticStrength]="0.3">Stronger</button>
 */
@Directive({
  selector: '[appMagneticHover]',
  standalone: true,
})
export class MagneticHoverDirective implements OnInit, OnDestroy {
  private mouseMoveHandler!: (e: MouseEvent) => void;
  private mouseLeaveHandler!: () => void;
  private rafId: number | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement;

    this.mouseMoveHandler = (e: MouseEvent) => {
      if (this.rafId) cancelAnimationFrame(this.rafId);

      this.rafId = requestAnimationFrame(() => {
        const rect = nativeEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        const strength = 0.25;
        const moveX = deltaX * strength * rect.width * 0.1;
        const moveY = deltaY * strength * rect.height * 0.1;

        nativeEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        nativeEl.style.transition = 'transform 0.15s ease-out';
      });
    };

    this.mouseLeaveHandler = () => {
      if (this.rafId) cancelAnimationFrame(this.rafId);

      nativeEl.style.transform = 'translate(0, 0) scale(1)';
      nativeEl.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    this.renderer.listen(nativeEl, 'mouseenter', () => {
      this.renderer.listen(nativeEl, 'mousemove', this.mouseMoveHandler);
      this.renderer.listen(nativeEl, 'mouseleave', this.mouseLeaveHandler);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
