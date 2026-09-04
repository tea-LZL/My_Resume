import { Component, computed, input, signal } from "@angular/core";

import {
  ContributionDay,
  formatContributionDate,
  formatContributionTitle,
  monthLabelsForWeeks,
} from "./contribution-heatmap";

@Component({
  selector: "app-contribution-calendar",
  templateUrl: "./contribution-calendar.component.html",
  styleUrl: "./contribution-calendar.component.scss",
})
export class ContributionCalendarComponent {
  readonly weeks = input<ContributionDay[][]>([]);
  readonly variant = input<"github" | "gitlab">("github");
  readonly summary = input<string | null>(null);
  readonly ariaLabel = input("Contribution activity");

  readonly selected = signal<ContributionDay | null>(null);

  readonly monthLabels = computed(() => monthLabelsForWeeks(this.weeks()));
  readonly showWeekdays = computed(() => this.variant() === "github");
  readonly legendCaption = computed(() =>
    this.variant() === "gitlab"
      ? "Issues, merge requests, pushes, and comments."
      : null,
  );
  readonly selectedLabel = computed(() => {
    const day = this.selected();
    if (!day) {
      return "";
    }
    const dateLabel = formatContributionDate(day.date);
    if (this.variant() === "gitlab") {
      return `Contributions for ${dateLabel}`;
    }
    const noun = day.count === 1 ? "contribution" : "contributions";
    return `${day.count} ${noun} on ${dateLabel}`;
  });

  dayTitle(day: ContributionDay): string {
    return formatContributionTitle(day);
  }

  selectDay(day: ContributionDay): void {
    this.selected.update((current) =>
      current?.date === day.date ? null : day,
    );
  }
}
