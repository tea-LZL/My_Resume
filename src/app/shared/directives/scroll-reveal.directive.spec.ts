import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ScrollRevealDirective } from './scroll-reveal.directive';

interface GlobalWithIntersectionObserver {
  IntersectionObserver?: typeof IntersectionObserver;
}

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];

  readonly observe = jasmine.createSpy('observe');
  readonly unobserve = jasmine.createSpy('unobserve');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    IntersectionObserverStub.instances.push(this);
  }
}

describe('ScrollRevealDirective', () => {
  const globalWithIntersectionObserver = globalThis as GlobalWithIntersectionObserver;
  let hadIntersectionObserver = false;
  let originalIntersectionObserver: typeof IntersectionObserver | undefined;
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement('div');
    IntersectionObserverStub.instances.length = 0;
    hadIntersectionObserver = Object.prototype.hasOwnProperty.call(
      globalWithIntersectionObserver,
      'IntersectionObserver',
    );
    originalIntersectionObserver = globalWithIntersectionObserver.IntersectionObserver;
  });

  afterEach(() => {
    if (hadIntersectionObserver) {
      globalWithIntersectionObserver.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete globalWithIntersectionObserver.IntersectionObserver;
    }
  });

  function stubReducedMotion(matches: boolean): void {
    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      return {
        matches: query === '(prefers-reduced-motion: reduce)' && matches,
        media: query,
      } as MediaQueryList;
    });
  }

  function installIntersectionObserverStub(): void {
    globalWithIntersectionObserver.IntersectionObserver =
      IntersectionObserverStub as unknown as typeof IntersectionObserver;
  }

  function createDirective(): ScrollRevealDirective {
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useValue: new ElementRef(element) }],
    });

    return TestBed.runInInjectionContext(() => new ScrollRevealDirective());
  }

  it('reveals immediately without creating an observer when reduced motion is requested', () => {
    stubReducedMotion(true);
    installIntersectionObserverStub();

    const directive = createDirective();
    directive.animation = 'fade-left';
    directive.revealDelay = 200;
    directive.ngOnInit();

    expect(element.classList.contains('reveal-hidden')).toBeFalse();
    expect(element.classList.contains('reveal-visible')).toBeTrue();
    expect(element.classList.contains('reveal-fade-left')).toBeTrue();
    expect(element.style.transitionDelay).toBe('200ms');
    expect(IntersectionObserverStub.instances).toHaveSize(0);
  });

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    stubReducedMotion(false);
    globalWithIntersectionObserver.IntersectionObserver = undefined;

    const directive = createDirective();
    directive.ngOnInit();

    expect(element.classList.contains('reveal-hidden')).toBeFalse();
    expect(element.classList.contains('reveal-visible')).toBeTrue();
  });

  it('observes the element and disconnects cleanly on destroy', () => {
    stubReducedMotion(false);
    installIntersectionObserverStub();

    const directive = createDirective();
    directive.revealThreshold = 0.4;
    directive.ngOnInit();

    const observer = IntersectionObserverStub.instances[0];
    expect(observer.options).toEqual({
      threshold: 0.4,
      rootMargin: '0px 0px -40px 0px',
    });
    expect(observer.observe).toHaveBeenCalledWith(element);
    expect(element.classList.contains('reveal-hidden')).toBeTrue();

    observer.callback(
      [
        {
          isIntersecting: true,
          target: element,
        } as unknown as IntersectionObserverEntry,
      ],
      observer as unknown as IntersectionObserver,
    );

    expect(element.classList.contains('reveal-visible')).toBeTrue();
    expect(observer.unobserve).toHaveBeenCalledWith(element);

    directive.ngOnDestroy();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
