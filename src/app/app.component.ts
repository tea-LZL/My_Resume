import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { Subscription } from 'rxjs';
import { StateService } from './services/state.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, NgClass, NgIf],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'project_personal';

  loading = false;
  subLoading: Subscription;
  theme = 'auto';
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public state: StateService,
  ){
    this.subLoading = new Subscription();
  }

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme') ?? 'auto';
    this.setTheme(this.theme);
    localStorage.setItem('theme', this.theme);
    this.state.loading.subscribe(value => {
      this.loading = value;
      this.cdr.detectChanges();
    });
  }

  setTheme(theme:string) {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    if (theme === 'auto') {
      document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  ngOnDestroy():void {
    if (this.subLoading) this.subLoading.unsubscribe();
  }
}
