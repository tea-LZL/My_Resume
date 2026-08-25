import { ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MagneticHoverDirective } from './magnetic-hover.directive';

interface ListenerRecord {
  eventName: string;
  handler: (event: MouseEvent) => void;
  dispose: jasmine.Spy;
}

describe('MagneticHoverDirective', () => {
  let frameCallbacks: Map<number, FrameRequestCallback>;
  let cancelledFrameIds: number[];
  let nextFrameId: number;

  beforeEach(() => {
    frameCallbacks = new Map<number, FrameRequestCallback>();
    cancelledFrameIds = [];
    nextFrameId = 0;

    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      const frameId = nextFrameId++;
      frameCallbacks.set(frameId, callback);
      return frameId;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake((frameId: number) => {
      cancelledFrameIds.push(frameId);
      frameCallbacks.delete(frameId);
    });
  });

  function stubDevice(options: { hover?: boolean; finePointer?: boolean; reducedMotion?: boolean } = {}): void {
    const { hover = true, finePointer = true, reducedMotion = false } = options;

    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      const matches =
        query === '(hover: hover)'
          ? hover
          : query === '(pointer: fine)'
            ? finePointer
            : query === '(prefers-reduced-motion: reduce)'
              ? reducedMotion
              : false;

      return { matches, media: query } as MediaQueryList;
    });
  }

  function createRenderer(records: ListenerRecord[]): Renderer2 {
    const listen = jasmine
      .createSpy('listen')
      .and.callFake(
        (
          _target: unknown,
          eventName: string,
          handler: (event: MouseEvent) => void,
        ): (() => void) => {
          const dispose = jasmine.createSpy(`dispose-${eventName}`);
          records.push({ eventName, handler, dispose });
          return dispose;
        },
      );

    return { listen } as unknown as Renderer2;
  }

  function createDirective(element: HTMLElement, renderer: Renderer2): MagneticHoverDirective {
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(element) },
        { provide: Renderer2, useValue: renderer },
      ],
    });

    return TestBed.runInInjectionContext(() => new MagneticHoverDirective());
  }

  it('does not attach pointer listeners when reduced motion is requested', () => {
    stubDevice({ reducedMotion: true });
    const records: ListenerRecord[] = [];
    const renderer = createRenderer(records);
    const directive = createDirective(document.createElement('button'), renderer);

    directive.ngOnInit();

    expect(records).toHaveSize(0);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('does not attach listeners for coarse or non-hovering devices', () => {
    stubDevice({ finePointer: false });
    const coarseRecords: ListenerRecord[] = [];
    const coarseDirective = createDirective(
      document.createElement('button'),
      createRenderer(coarseRecords),
    );
    coarseDirective.ngOnInit();

    stubDevice({ hover: false });
    const nonHoverRecords: ListenerRecord[] = [];
    const nonHoverDirective = createDirective(
      document.createElement('button'),
      createRenderer(nonHoverRecords),
    );
    nonHoverDirective.ngOnInit();

    expect(coarseRecords).toHaveSize(0);
    expect(nonHoverRecords).toHaveSize(0);
  });

  it('retains listener disposers, cancels pending frames, and leaves focus/action events untouched', () => {
    stubDevice();
    const element = document.createElement('button');
    const records: ListenerRecord[] = [];
    const directive = createDirective(element, createRenderer(records));

    directive.ngOnInit();

    expect(records.map(({ eventName }) => eventName)).toEqual(['mousemove', 'mouseleave']);

    records[0].handler(new MouseEvent('mousemove', { clientX: 75, clientY: 30 }));
    records[0].handler(new MouseEvent('mousemove', { clientX: 80, clientY: 35 }));

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(cancelledFrameIds).toEqual([0]);

    directive.ngOnDestroy();

    expect(cancelledFrameIds).toEqual([0, 1]);
    records.forEach(({ dispose }) => expect(dispose).toHaveBeenCalledTimes(1));
    expect(records.some(({ eventName }) => eventName === 'click' || eventName === 'focus')).toBeFalse();
    expect(frameCallbacks.size).toBe(0);
  });
});
