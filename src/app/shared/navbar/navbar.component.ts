import { NgClass } from "@angular/common";
import { Component, HostListener, inject, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { MagneticHoverDirective } from "../directives/magnetic-hover.directive";
import { NavModalComponent } from "./nav-modal/nav-modal.component";

@Component({
  selector: "app-navbar",
  imports: [NgClass, RouterLink, RouterLinkActive, MagneticHoverDirective],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit {
  private readonly modal = inject(NgbModal);

  bNav = false;
  theme = "auto";
  isScrolled = false;

  @HostListener("window:scroll")
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  ngOnInit(): void {
    this.theme = localStorage.getItem("theme") ?? "auto";
    this.setTheme(this.theme);
    this.isScrolled = window.scrollY > 0;
  }

  setTheme(theme: string): void {
    this.theme = theme;
    localStorage.setItem("theme", theme);

    const resolvedTheme = theme === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.setAttribute("data-bs-theme", resolvedTheme);
  }

  openNavModal(): void {
    this.bNav = true;
    const modalRef = this.modal.open(NavModalComponent, { centered: true });
    modalRef.result.then(
      () => (this.bNav = false),
      () => (this.bNav = false),
    );
  }
}