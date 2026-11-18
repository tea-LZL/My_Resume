import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from "@angular/core";

/**
 * A circular spotlight that follows the pointer while it is inside a heading
 * (h1/h2) and inverts everything underneath it via `mix-blend-mode: difference`.
 * Activation is enter/leave on the heading, not a per-move hit test; the disc
 * grows in on enter and shrinks away on leave. Decorative: pointer-only, never
 * interactive, hidden from assistive tech.
 */
@Component({
  selector: "app-hover-invert",
  template: `<div #spot class="hover-spot" aria-hidden="true"></div>`,
  styleUrl: "./hover-invert.component.scss",
})
export class HoverInvertComponent implements AfterViewInit, OnDestroy {
  @ViewChild("spot", { static: true }) private spot!: ElementRef<HTMLDivElement>;

  private readonly zone = inject(NgZone);
  private x = -999;
  private y = -999;
  private active = false;
  private listening = false;
  private scrollFrame: number | null = null;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      // No `(hover: hover)` gate: a touch-only device reports `hover: none` even
      // when a mouse is later attached, and the pointerType check already
      // ignores touch input without any DOM work.
      document.addEventListener("pointerover", this.handlePointerOver, { passive: true });
      document.addEventListener("pointerout", this.handlePointerOut, { passive: true });
      document.addEventListener("pointermove", this.handlePointerMove, { passive: true });
      document.addEventListener("scroll", this.handleScroll, { passive: true, capture: true });
      this.listening = true;
    });
  }

  ngOnDestroy(): void {
    if (!this.listening) {
      return;
    }
    document.removeEventListener("pointerover", this.handlePointerOver);
    document.removeEventListener("pointerout", this.handlePointerOut);
    document.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("scroll", this.handleScroll, { capture: true });
    if (this.scrollFrame !== null) {
      cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = null;
    }
    this.listening = false;
  }

  private readonly handlePointerOver = (event: PointerEvent): void => {
    if (event.pointerType === "touch") {
      return;
    }
    if (event.target instanceof Element && event.target.closest("h1, h2")) {
      // The enter event carries the pointer position; without it the disc
      // would animate in at wherever the pointer last left the page.
      this.x = event.clientX;
      this.y = event.clientY;
      this.setActive(true);
    }
  };

  private readonly handlePointerOut = (event: PointerEvent): void => {
    if (event.pointerType === "touch") {
      return;
    }
    const heading = event.target instanceof Element ? event.target.closest("h1, h2") : null;
    if (!heading) {
      return;
    }
    // Moving between children of the same heading is not a leave.
    if (event.relatedTarget instanceof Element && heading.contains(event.relatedTarget)) {
      return;
    }
    this.setActive(false);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerType === "touch") {
      return;
    }
    this.x = event.clientX;
    this.y = event.clientY;
    this.applyTransform();
  };

  // A stationary cursor over a scrolling heading would otherwise keep the disc
  // pinned to a spot that the heading has already left.
  private readonly handleScroll = (): void => {
    if (this.scrollFrame !== null) {
      return;
    }
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      if (this.x === -999) {
        return;
      }
      // Content moves under a stationary cursor: re-test what is there instead
      // of hiding until the pointer happens to leave and re-enter the heading.
      const element = document.elementFromPoint(this.x, this.y);
      const heading = element instanceof Element ? element.closest("h1, h2") : null;
      this.setActive(heading !== null);
    });
  };

  private setActive(active: boolean): void {
    const spot = this.spot?.nativeElement;
    if (!spot || this.active === active) {
      return;
    }
    this.active = active;
    spot.classList.toggle("is-active", active);
    this.applyTransform();
  }

  private applyTransform(): void {
    const spot = this.spot?.nativeElement;
    if (!spot) {
      return;
    }
    spot.style.translate = `${this.x}px ${this.y}px`;
    spot.style.scale = this.active ? "1" : "0.3";
  }
}
