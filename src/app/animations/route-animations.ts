import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

/**
 * Route transition animation — minimal fade for responsiveness.
 * Sub-100ms so navigation feels instant; clicks never queue behind animation.
 */
export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({
        opacity: 0,
      }),
    ], { optional: true }),

    group([
      query(':leave', [
        animate(
          '60ms ease-out',
          style({ opacity: 0 }),
        ),
      ], { optional: true }),

      query(':enter', [
        animate(
          '80ms ease-out',
          style({ opacity: 1 }),
        ),
      ], { optional: true }),
    ]),
  ]),
]);
