import { NgClass } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { filter } from "rxjs";

import { MagneticHoverDirective } from "../directives/magnetic-hover.directive";
import { NavModalComponent } from "./nav-modal/nav-modal.component";

@Component({
  selector: "app-navbar",
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive,
    MagneticHoverDirective,
    NavModalComponent,
  ],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  bNav = false;
  theme = "auto";
  isScrolled = false;

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.closeNavMenu();
  }

  @HostListener("window:resize")
  onResize(): void {
    if (this.bNav && window.innerWidth > 820) {
      this.closeNavMenu();
    }
  }

  // Scroll fires dozens of times per gesture; a zoned binding would run a full
  // application tick each time. Only the 0 -> non-zero transition repaints.
  private readonly onWindowScroll = (): void => {
    const scrolled = window.scrollY > 0;
    if (scrolled === this.isScrolled) {
      return;
    }
    this.isScrolled = scrolled;
    this.cdr.detectChanges();
  };

  ngOnInit(): void {
    this.theme = localStorage.getItem("theme") ?? "auto";
    this.setTheme(this.theme);
    this.isScrolled = window.scrollY > 0;
    this.zone.runOutsideAngular(() => {
      window.addEventListener("scroll", this.onWindowScroll, { passive: true });
    });
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeNavMenu());
  }

  ngOnDestroy(): void {
    window.removeEventListener("scroll", this.onWindowScroll);
    this.unlockPage();
  }

  setTheme(theme: string): void {
    this.theme = theme;
    localStorage.setItem("theme", theme);

    const resolvedTheme =
      theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.setAttribute("data-bs-theme", resolvedTheme);
  }

  toggleNavMenu(): void {
    if (this.bNav) {
      this.closeNavMenu();
      return;
    }
    this.bNav = true;
    document.body.style.overflow = "hidden";
  }

  closeNavMenu(): void {
    this.bNav = false;
    this.theme = localStorage.getItem("theme") ?? "auto";
    this.unlockPage();
  }

  private unlockPage(): void {
    document.body.style.overflow = "";
  }
}
