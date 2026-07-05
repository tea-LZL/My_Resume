import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { Subscription } from 'rxjs';
import { StateService } from './services/state.service';
import { FooterComponent } from "./shared/footer/footer.component";
import { routeAnimation } from './animations/route-animations';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    animations: [routeAnimation],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "Zhilong's Resume";

  loading = true;
  subLoading: Subscription;
  theme = 'auto';
  private morphRaf: number | null = null;
  private morphStart = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public state: StateService,
  ){
    this.subLoading = new Subscription();
  }

  prepareRoute(outlet: RouterOutlet) {
    if (outlet && outlet.isActivated) {
      return outlet.activatedRouteData?.['animation'] ?? outlet.activatedRoute?.routeConfig?.path ?? '';
    }
    return '';
  }

  ngOnInit(): void {
    this.state.loading.subscribe(value => {
      this.loading = value;
      this.cdr.detectChanges();
    });
    this.startMorphBlob();
  }

  /** Organic morphing blob — Catmull-Rom spline animation */
  private startMorphBlob(): void {
    const N = 8;
    const cx = 300, cy = 300, baseR = 200;

    const catmullRom = (pts: number[][]): string => {
      const n = pts.length;
      let d = '';
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        if (i === 0) d += `M ${p1[0].toFixed(1)},${p1[1].toFixed(1)} `;
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} `;
      }
      return d + 'Z';
    };

    const animate = (ts: number) => {
      if (!this.morphStart) this.morphStart = ts;
      const t = (ts - this.morphStart) / 1000;
      const path = document.getElementById('morphPath');
      if (!path) {
        this.morphRaf = requestAnimationFrame(animate);
        return;
      }

      const pts: number[][] = [];
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2;
        const r = baseR
          + Math.sin(t * 0.4 + i * 1.1) * 45
          + Math.cos(t * 0.3 + i * 2.3) * 30
          + Math.sin(t * 0.6 + i * 0.5) * 20;
        pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
      }
      path.setAttribute('d', catmullRom(pts));
      this.morphRaf = requestAnimationFrame(animate);
    };

    this.morphRaf = requestAnimationFrame(animate);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  ngOnDestroy():void {
    if (this.subLoading) this.subLoading.unsubscribe();
    if (this.morphRaf) cancelAnimationFrame(this.morphRaf);
  }
}
