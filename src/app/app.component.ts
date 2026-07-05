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
    // this.theme = localStorage.getItem('theme') ?? 'auto';
    // this.setTheme(this.theme);
    // localStorage.setItem('theme', this.theme);
    this.state.loading.subscribe(value => {
      this.loading = value;
      this.cdr.detectChanges();
    });
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

  // setTheme(theme:string) {
  //   this.theme = theme;
  //   localStorage.setItem('theme', theme);
  //   if (theme === 'auto') {
  //     document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  //   } else {
  //     document.documentElement.setAttribute('data-bs-theme', theme)
  //   }
  // }

  ngOnDestroy():void {
    if (this.subLoading) this.subLoading.unsubscribe();
  }
}
