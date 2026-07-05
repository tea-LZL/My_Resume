import { Component, HostListener, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = "Zhilong's Resume";

  loading = true;
  subLoading: Subscription;
  theme = 'auto';

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
  }

  ngAfterViewInit(): void {
    // Turn off loading screen
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
      const loadingEl = document.getElementById('app-loading');
      if (loadingEl) {
        loadingEl.classList.add('fade-out');
        setTimeout(() => loadingEl.remove(), 500);
      }
    }, 275);
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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const glow = document.getElementById('mouseGlow');
    if (glow) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    }
  }

  @HostListener('document:mouseleave')
  onMouseLeave(): void {
    const glow = document.getElementById('mouseGlow');
    if (glow) {
      glow.style.opacity = '0';
    }
  }

  ngOnDestroy():void {
    if (this.subLoading) this.subLoading.unsubscribe();
  }
}
