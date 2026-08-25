import { Directive, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';

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
  private rafId: number | null = null;
  private readonly listenerDisposers: (() => void)[] = [];

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    if (!this.shouldEnable()) {
      return;
    }

    const nativeEl = this.el.nativeElement;

    const mouseMoveHandler = (e: MouseEvent): void => {
      this.cancelPendingFrame();

      if (typeof window.requestAnimationFrame !== 'function') {
        return;
      }

      this.rafId = window.requestAnimationFrame(() => {
        this.rafId = null;

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

    const mouseLeaveHandler = (): void => {
      this.cancelPendingFrame();

      nativeEl.style.transform = 'translate(0, 0) scale(1)';
      nativeEl.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    this.listenerDisposers.push(
      this.renderer.listen(nativeEl, 'mousemove', mouseMoveHandler),
      this.renderer.listen(nativeEl, 'mouseleave', mouseLeaveHandler),
    );
  }

  ngOnDestroy(): void {
    this.cancelPendingFrame();

    this.listenerDisposers.forEach((dispose) => dispose());
    this.listenerDisposers.length = 0;
  }

  private shouldEnable(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    const canHover = window.matchMedia('(hover: hover)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return canHover && hasFinePointer && !prefersReducedMotion;
  }

  private cancelPendingFrame(): void {
    if (this.rafId === null) {
      return;
    }

    if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(this.rafId);
    }

    this.rafId = null;
  }
}
