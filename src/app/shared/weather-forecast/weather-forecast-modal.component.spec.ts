import { TestBed } from "@angular/core/testing";

import { WeatherForecastModalComponent } from "./weather-forecast-modal.component";
import { DailyForecast } from "../../interfaces/weather";

function forecastDay(overrides: Partial<DailyForecast> = {}): DailyForecast {
  return {
    date: "2026-09-27T00:00:00Z",
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

describe("WeatherForecastModalComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherForecastModalComponent],
    }).compileComponents();
  });

  it("sorts unsorted API days into chronological order and marks the first as today", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const rows = fixture.componentInstance.buildRows([
      forecastDay({ date: "2026-09-29T00:00:00Z", icon: "10d" }),
      forecastDay({ date: "2026-09-27T00:00:00Z" }),
      forecastDay({ date: "2026-09-28T00:00:00Z" }),
    ]);

    expect(rows.length).toBe(3);
    expect(rows.map((row) => row.date.getUTCDate())).toEqual([27, 28, 29]);
    expect(rows[0].isToday).toBeTrue();
    expect(rows[1].isToday).toBeFalse();
    expect(rows[2].icon).toBe("cloud-rain-fill");
  });

  it("returns no rows for empty input and falls back to a cloud icon", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);

    expect(fixture.componentInstance.buildRows(null)).toEqual([]);
    expect(fixture.componentInstance.buildRows([])).toEqual([]);
    expect(fixture.componentInstance.buildRows([forecastDay({ icon: "99z" })])[0].icon).toBe(
      "cloud",
    );
  });

  it("caps the rendered rows at five days", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const days = Array.from({ length: 9 }, (_, index) =>
      forecastDay({ date: `2026-09-${String(index + 10).padStart(2, "0")}T00:00:00Z` }),
    );

    expect(fixture.componentInstance.buildRows(days).length).toBe(5);
  });

  it("renders the forecast days, location, and temperatures when opened", async () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const rows = component.buildRows([
      forecastDay({ date: "2026-09-27T00:00:00Z", max_temperature: 28, min_temperature: 12 }),
    ]);
    const modalRef = component.open({
      locationName: "Pretoria",
      rows,
      isLoading: false,
      error: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const dayRows = document.querySelectorAll(".forecast-day");
    expect(dayRows.length).toBe(1);
    expect(dayRows[0].textContent).toContain("Today");
    expect(dayRows[0].textContent).toContain("clear sky");
    expect(dayRows[0].textContent).toContain("12°");
    expect(dayRows[0].textContent).toContain("28°");
    expect(document.body.textContent).toContain("5 day forecast");
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
      rows: component.buildRows([forecastDay()]),
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
