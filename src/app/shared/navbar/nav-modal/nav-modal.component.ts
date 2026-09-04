import { Component, output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-nav-modal",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./nav-modal.component.html",
  styleUrl: "./nav-modal.component.scss",
})
export class NavModalComponent {
  readonly closed = output<void>();
  theme = localStorage.getItem("theme") ?? "auto";

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
}
