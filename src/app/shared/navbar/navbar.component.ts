import { NgClass } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavModalComponent } from './nav-modal/nav-modal.component';
import { MagneticHoverDirective } from '../directives/magnetic-hover.directive';

@Component({
  selector: "app-navbar",
  imports: [NgClass, RouterLink, RouterLinkActive, MagneticHoverDirective],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit {
  bNav: boolean = false;
  theme = 'auto';
  isScrolled = false;

  constructor(private modal: NgbModal) {
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  ngOnInit(): void {
    this.theme = localStorage.getItem("theme") ?? "auto";
    this.setTheme(this.theme);
    localStorage.setItem("theme", this.theme);
    this.isScrolled = window.scrollY > 0;
  }

  setTheme(theme: string) {
    this.theme = theme;
    localStorage.setItem("theme", theme);
    if (theme === "auto") {
      document.documentElement.setAttribute(
        "data-bs-theme",
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }

  openNavModal() {
    const modalRef = this.modal.open(NavModalComponent, { centered: true });
    modalRef.result.then(
      (result) => {
        this.bNav = false;
      },
      (dismissed) => {
        this.bNav = false;
      }
    );
    
  }
}
