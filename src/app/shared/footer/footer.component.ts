import { Component, VERSION, ViewEncapsulation } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-footer",
  imports: [RouterLink],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  encapsulation: ViewEncapsulation.None,
  host: {
    style: "display: block; flex-shrink: 0; position: relative; z-index: 10;",
  },
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  angularVersion = VERSION.major;
}
