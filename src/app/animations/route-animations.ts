import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

/**
 * Route transition animation — smooth fade + slight slide between pages.
 */
export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(12px)',
      }),
    ], { optional: true }),

    group([
      query(':leave', [
        animate(
          '250ms ease-out',
          style({
            opacity: 0,
            transform: 'translateY(-8px)',
          }),
        ),
      ], { optional: true }),

      query(':enter', [
        animate(
          '350ms 100ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ], { optional: true }),
    ]),
  ]),
]);
