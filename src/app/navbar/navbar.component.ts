import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: "app-navbar",
  imports: [NgClass],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit {

  theme = 'auto';

  constructor(private router: Router) {}
  navTo(path: string) {
    this.router.navigate([path]);
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
}
