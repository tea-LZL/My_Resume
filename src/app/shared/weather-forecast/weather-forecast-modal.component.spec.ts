import { TestBed } from "@angular/core/testing";

import {
  WEATHER_ICON_FALLBACK,
  WEATHER_ICON_MAP,
  WeatherForecastModalComponent,
} from "./weather-forecast-modal.component";
import { DailyForecast } from "../../interfaces/weather";

const FORECAST_ROW_COUNT = 6;

function iconContent(name: string): string {
  const probe = document.createElement("i");
  probe.className = `bi bi-${name}`;
  document.body.appendChild(probe);
  const content = getComputedStyle(probe, "::before").content;
  probe.remove();
  return content;
}

function isoDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}T00:00:00Z`;
}

function forecastDay(overrides: Partial<DailyForecast> = {}): DailyForecast {
  return {
    date: isoDate(0),
    max_temperature: 28,
    min_temperature: 12,
    avg_temperature: 20,
    condition: "Clear",
    description: "clear sky",
    icon: "01d",
    humidity: 30,
    wind_speed: 4,
    precipitation: 0,
    chance_of_rain: 0,
    uv_index: 0,
    ...overrides,
  };
}

function dayFromToday(offsetDays: number, overrides: Partial<DailyForecast> = {}) {
  return forecastDay({ date: isoDate(offsetDays), ...overrides });
}

describe("WeatherForecastModalComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherForecastModalComponent],
    }).compileComponents();
  });

  it("sorts unsorted API days into chronological order", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const rows = fixture.componentInstance.buildRows([
      dayFromToday(2, { icon: "10d" }),
      dayFromToday(0),
      dayFromToday(1),
    ]);

    expect(rows.length).toBe(3);
    expect(rows[0].date.getTime()).toBeLessThan(rows[1].date.getTime());
    expect(rows[1].date.getTime()).toBeLessThan(rows[2].date.getTime());
    expect(rows[2].icon).toBe("cloud-rain-fill");
  });

  it("labels rows by their real date, not by row position", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const rows = fixture.componentInstance.buildRows([
      dayFromToday(1),
      dayFromToday(3),
      dayFromToday(0),
      dayFromToday(2),
    ]);

    expect(rows.length).toBe(4);
    expect(rows[0].isToday).toBeTrue();
    expect(rows[0].isTomorrow).toBeFalse();
    expect(rows[1].isTomorrow).toBeTrue();
    expect(rows[2].isToday).toBeFalse();
    expect(rows[2].isTomorrow).toBeFalse();
  });

  it("does not call the first returned day today when the API starts at tomorrow", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const rows = fixture.componentInstance.buildRows([
      dayFromToday(1),
      dayFromToday(2),
      dayFromToday(3),
    ]);

    expect(rows.every((row) => row.isToday)).toBeFalse();
    expect(rows[0].isTomorrow).toBeTrue();
  });

  it("drops days already past and keeps today plus the next five", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const days = Array.from({ length: 10 }, (_, index) => dayFromToday(index - 3));
    const rows = fixture.componentInstance.buildRows(days);

    expect(rows.length).toBe(FORECAST_ROW_COUNT);
    expect(rows[0].isToday).toBeTrue();
    expect(rows[1].isTomorrow).toBeTrue();
    expect(rows[5].date.getTime()).toBeGreaterThan(rows[0].date.getTime());
  });

  it("returns no rows for empty input and falls back to a drawn icon", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);

    expect(fixture.componentInstance.buildRows(null)).toEqual([]);
    expect(fixture.componentInstance.buildRows([])).toEqual([]);
    expect(
      fixture.componentInstance.buildRows([forecastDay({ icon: "99z" })])[0].icon,
    ).toBe(WEATHER_ICON_FALLBACK);
  });

  it("only uses icons the bootstrap-icons subset font actually draws", () => {
    const names = [
      ...new Set([...Object.values(WEATHER_ICON_MAP), WEATHER_ICON_FALLBACK]),
    ];

    const undrawn = names.filter((name) => {
      const content = iconContent(name);
      return content === "normal" || content === "none" || content === "";
    });

    expect(undrawn).toEqual([]);
  });

  it("renders six days, the location, and temperatures when opened", async () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const days = Array.from({ length: 7 }, (_, index) =>
      dayFromToday(index, {
        max_temperature: 20 + index,
        min_temperature: 10 + index,
      }),
    );
    const modalRef = component.open({
      locationName: "Pretoria",
      rows: component.buildRows(days),
      isLoading: false,
      error: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const dayRows = document.querySelectorAll(".forecast-day");
    expect(dayRows.length).toBe(FORECAST_ROW_COUNT);
    expect(dayRows[0].textContent).toContain("Today");
    expect(dayRows[1].textContent).toContain("Tomorrow");
    expect(dayRows[0].textContent).toContain("clear sky");
    expect(dayRows[0].textContent).toContain("10°");
    expect(dayRows[0].textContent).toContain("20°");
    expect(document.body.textContent).toContain("Today and the next 5 days");
    expect(document.body.textContent).toContain("Pretoria");

    modalRef.dismiss("test-close");
    await modalRef.result.catch(() => undefined);
  });

  it("shows the loading state and swaps to rows once the state updates", async () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const modalRef = component.open({
      locationName: "Pretoria",
      rows: [],
      isLoading: true,
      error: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.textContent).toContain("Loading the forecast");

    component.setState({
      locationName: "Pretoria",
      rows: component.buildRows([dayFromToday(0)]),
      isLoading: false,
      error: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll(".forecast-day").length).toBe(1);

    modalRef.dismiss("test-close");
    await modalRef.result.catch(() => undefined);
  });

  it("surfaces an error with a retry control", async () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const modalRef = component.open({
      locationName: "Pretoria",
      rows: [],
      isLoading: false,
      error: "The forecast is unavailable right now.",
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.body.textContent).toContain("The forecast is unavailable right now.");
    const retry = document.querySelector(".forecast-retry") as HTMLButtonElement;
    expect(retry).toBeTruthy();

    let retried = false;
    component.retry.subscribe(() => (retried = true));
    retry.click();
    expect(retried).toBeTrue();

    modalRef.dismiss("test-close");
    await modalRef.result.catch(() => undefined);
  });
});
