import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
    selector: 'app-timeline',
    imports: [ScrollRevealDirective],
    templateUrl: './timeline.component.html',
    styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
    constructor() {
        const loadingEl = document.getElementById('app-loading');
        if (loadingEl) {
            loadingEl.classList.add('fade-out');
            setTimeout(() => loadingEl.remove(), 500);
        }
    }
}
