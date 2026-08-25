import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';

export type RevealAnimation = 'fade-up' | 'fade-in' | 'scale-in' | 'fade-left' | 'fade-right';

/**
 * Reusable scroll-reveal directive using IntersectionObserver.
 *
 * Usage:
 *   <div appScrollReveal>                     <!-- defaults to 'fade-up' -->
 *   <div appScrollReveal="fade-left">         <!-- explicit animation -->
 *   <div [appScrollReveal]="'scale-in'">      <!-- dynamic binding -->
 *   <div appScrollReveal [revealDelay]="200">  <!-- staggered delay -->
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('appScrollReveal') animation: RevealAnimation = 'fade-up';
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.15;

  private observer: IntersectionObserver | null = null;

  private readonly el = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement;

    nativeEl.classList.add('reveal-hidden', `reveal-${this.animation}`);
    if (this.revealDelay > 0) {
      nativeEl.style.transitionDelay = `${this.revealDelay}ms`;
    }

    const observerConstructor = this.getIntersectionObserver();
    if (this.prefersReducedMotion() || observerConstructor === null) {
      this.revealImmediately(nativeEl);
      return;
    }

    this.observer = new observerConstructor(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.revealThreshold, rootMargin: '0px 0px -40px 0px' },
    );

    this.observer.observe(nativeEl);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private getIntersectionObserver(): typeof IntersectionObserver | null {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return null;
    }

    return IntersectionObserver;
  }

  private revealImmediately(nativeEl: HTMLElement): void {
    nativeEl.classList.remove('reveal-hidden');
    nativeEl.classList.add('reveal-visible');
  }
}
