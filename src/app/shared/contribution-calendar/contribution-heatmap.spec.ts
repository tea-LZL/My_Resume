import {
  buildContributionWeeks,
  formatContributionTitle,
  gitlabLevel,
  githubLevel,
  monthLabelsForWeeks,
  toLocalDateString,
} from "./contribution-heatmap";

describe("contribution heatmap", () => {
  it("builds 53 Sunday-aligned weeks of 7 days", () => {
    const weeks = buildContributionWeeks({ "2026-06-13": 34 }, { levelForCount: githubLevel });

    expect(weeks.length).toBe(53);
    expect(weeks.every((week) => week.length === 7)).toBeTrue();
    const [year, month, day] = weeks[0][0].date.split("-").map(Number);
    expect(new Date(year, month - 1, day).getDay()).toBe(0);
  });

  it("uses GitLab contribution thresholds", () => {
    expect(gitlabLevel(0)).toBe(0);
    expect(gitlabLevel(9)).toBe(1);
    expect(gitlabLevel(10)).toBe(2);
    expect(gitlabLevel(29)).toBe(3);
    expect(gitlabLevel(30)).toBe(4);
  });

  it("places month labels with room to read", () => {
    const weeks = buildContributionWeeks({});
    const labels = monthLabelsForWeeks(weeks);
    const named = labels.filter((label) => label !== "");

    expect(named.length).toBeGreaterThan(8);
  });

  it("formats contribution titles", () => {
    expect(
      formatContributionTitle({ date: "2026-07-30", count: 1, level: 1 }),
    ).toBe("1 contribution on Jul 30, 2026");
  });

  it("formats local dates without UTC shift", () => {
    const date = new Date(2026, 8, 4);
    expect(toLocalDateString(date)).toBe("2026-09-04");
  });
});
