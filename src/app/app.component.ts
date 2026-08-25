import { AfterViewInit, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { NavbarComponent } from "./shared/navbar/navbar.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { routeAnimation } from "./animations/route-animations";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  animations: [routeAnimation],
})
export class AppComponent implements AfterViewInit {
  readonly title = "Zhilong's Resume";

  prepareRoute(outlet: RouterOutlet): string {
    if (outlet && outlet.isActivated) {
      return outlet.activatedRouteData?.["animation"] ?? outlet.activatedRoute?.routeConfig?.path ?? "";
    }

    return "";
  }

  ngAfterViewInit(): void {
    const loadingElement = document.getElementById("app-loading");
    loadingElement?.classList.add("fade-out");
    window.setTimeout(() => loadingElement?.remove(), 350);
  }
}