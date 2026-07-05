import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

/**
 * Route transition animation — cross-fade with slight horizontal slide.
 * Projects page slides in from the right, others fade up.
 */
export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(20px)',
      }),
    ], { optional: true }),

    group([
      query(':leave', [
        animate(
          '200ms ease-out',
          style({
            opacity: 0,
            transform: 'translateX(-16px)',
          }),
        ),
      ], { optional: true }),

      query(':enter', [
        animate(
          '400ms 80ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({
            opacity: 1,
            transform: 'translateX(0)',
          }),
        ),
      ], { optional: true }),
    ]),
  ]),
]);
