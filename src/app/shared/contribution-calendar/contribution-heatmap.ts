export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function githubLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

export function gitlabLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 9) return 1;
  if (count <= 19) return 2;
  if (count <= 29) return 3;
  return 4;
}

export function buildContributionWeeks(
  counts: Record<string, number>,
  options?: {
    levels?: Record<string, number>;
    levelForCount?: (count: number) => number;
    weekCount?: number;
  },
): ContributionDay[][] {
  const weekCount = options?.weekCount ?? 53;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  cursor.setDate(today.getDate() - 364);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const weeks: ContributionDay[][] = [];
  while (weeks.length < weekCount) {
    const week: ContributionDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = toLocalDateString(cursor);
      const count = counts[date] ?? 0;
      const mappedLevel = options?.levels?.[date];
      const level = Math.max(
        0,
        Math.min(
          4,
          mappedLevel ?? options?.levelForCount?.(count) ?? githubLevel(count),
        ),
      );
      week.push({ date, count, level });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function monthLabelsForWeeks(weeks: ContributionDay[][]): string[] {
  const labels = weeks.map(() => "");
  let lastMonth = -1;
  let lastLabelAt = -2;

  weeks.forEach((week, index) => {
    const firstOfMonth = week.find((day) => day.date.slice(8, 10) === "01");
    const source = firstOfMonth ?? week[0];
    if (!source) {
      return;
    }

    const month = Number(source.date.slice(5, 7)) - 1;
    if (month < 0 || month === lastMonth) {
      return;
    }

    lastMonth = month;
    if (index === 0 || index - lastLabelAt >= 2) {
      labels[index] = MONTH_ABBR[month];
      lastLabelAt = index;
    }
  });

  return labels;
}

export function formatContributionDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatContributionTitle(day: ContributionDay): string {
  const noun = day.count === 1 ? "contribution" : "contributions";
  return `${day.count} ${noun} on ${formatContributionDate(day.date)}`;
}
