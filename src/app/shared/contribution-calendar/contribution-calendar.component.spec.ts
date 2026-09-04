import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ContributionCalendarComponent } from "./contribution-calendar.component";
import { buildContributionWeeks } from "./contribution-heatmap";

describe("ContributionCalendarComponent", () => {
  let fixture: ComponentFixture<ContributionCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributionCalendarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContributionCalendarComponent);
    fixture.componentRef.setInput(
      "weeks",
      buildContributionWeeks({ "2026-06-13": 34 }),
    );
    fixture.componentRef.setInput("variant", "github");
    fixture.componentRef.setInput("summary", "244 contributions in 2026");
    fixture.detectChanges();
  });

  it("renders a GitHub-style calendar with weekdays and legend", () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain("244 contributions in 2026");
    expect(compiled.textContent).toContain("Mon");
    expect(compiled.textContent).toContain("Wed");
    expect(compiled.textContent).toContain("Fri");
    expect(compiled.textContent).toContain("Less");
    expect(compiled.textContent).toContain("More");
    expect(compiled.querySelectorAll(".contrib__week").length).toBe(53);
    expect(compiled.querySelector(".contrib--github")).toBeTruthy();
  });

  it("renders GitLab legend copy without weekday labels", () => {
    fixture.componentRef.setInput("variant", "gitlab");
    fixture.componentRef.setInput("summary", null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      "Issues, merge requests, pushes, and comments.",
    );
    expect(compiled.textContent).not.toContain("Less");
    expect(compiled.querySelector(".contrib__weekdays")).toBeNull();
    expect(compiled.querySelector(".contrib--gitlab")).toBeTruthy();
  });

  it("selects a day on click", () => {
    const day = fixture.nativeElement.querySelector(
      "button.contrib__day",
    ) as HTMLButtonElement;
    day.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("contribution");
    expect(day.classList.contains("is-selected") || fixture.componentInstance.selected()).toBeTruthy();
  });
});
