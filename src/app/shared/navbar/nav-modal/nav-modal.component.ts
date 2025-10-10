import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-modal',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './nav-modal.component.html',
  styleUrl: './nav-modal.component.scss'
})
export class NavModalComponent {
  themeList = ['auto','light','dark'];
  theme:string;
  constructor(public activeModal: NgbActiveModal){
    this.theme = localStorage.getItem("theme")?? 'auto';
  }
  changeTheme() {
    this.theme = localStorage.getItem("theme") ?? 'auto';
    let index = this.themeList.findIndex((x: string) => x === this.theme);
    if (index >= 2) index = -1;
    this.theme = this.themeList[index+1];
    localStorage.setItem("theme", this.theme);
    if (this.theme === "auto") {
      document.documentElement.setAttribute(
        "data-bs-theme",
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      document.documentElement.setAttribute("data-bs-theme", this.theme);
    }
  }
}
