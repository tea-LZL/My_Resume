import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavModalComponent } from './nav-modal/nav-modal.component';

@Component({
  selector: "app-navbar",
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit {
  bNav: boolean = false;
  theme = 'auto';

  constructor(private modal: NgbModal) {
  }

  ngOnInit(): void {
    this.theme = localStorage.getItem("theme") ?? "auto";
    this.setTheme(this.theme);
    localStorage.setItem("theme", this.theme);
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
