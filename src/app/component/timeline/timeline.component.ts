import { Component } from '@angular/core';

@Component({
    selector: 'app-timeline',
    imports: [],
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
