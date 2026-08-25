import { Component } from "@angular/core";

import {
  certifications,
  education,
  workExperience,
} from "../../data/portfolio.data";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-timeline",
  imports: [ScrollRevealDirective],
  templateUrl: "./timeline.component.html",
  styleUrl: "./timeline.component.scss",
})
export class TimelineComponent {
  readonly workExperience = workExperience;
  readonly timelineWorkExperience = workExperience;
  readonly education = education;
  readonly timelineEducation = [...education].reverse();
  readonly certifications = certifications;
}