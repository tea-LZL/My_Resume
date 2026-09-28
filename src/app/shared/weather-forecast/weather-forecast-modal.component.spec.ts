import { TestBed } from "@angular/core/testing";

import {
  FORECAST_DAY_COUNT,
  WEATHER_ICON_FALLBACK,
  WEATHER_ICON_MAP,
  WeatherForecastModalComponent,
} from "./weather-forecast-modal.component";
import { DailyForecast, HourlyForecast } from "../../interfaces/weather";

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

function hourlyForecast(overrides: Partial<HourlyForecast> = {}): HourlyForecast {
  return {
    dt: 1790888400,
    main: {
      temp: 12.37,
      feels_like: 11.46,
      temp_min: 12.37,
      temp_max: 12.37,
      pressure: 1025,
      humidity: 69,
      sea_level: 1025,
      grnd_level: 876,
      temp_kf: 0,
    },
    weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01n" }],
    clouds: { all: 2 },
    wind: { speed: 2.84, deg: 44, gust: 3.93 },
    visibility: 10000,
    pop: 0,
    rain: null,
    snow: null,
    sys: { pod: "n" },
    dt_txt: "2026-10-01 21:00:00",
    ...overrides,
  };
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
    uv_index: null,
    pop: 0,
    pop_min: 0,
    pop_mean: 0,
    temp: { day: null, min: 12, max: 28, night: null, morn: null, eve: null },
    feels_like: { day: null, night: null, morn: null, eve: null },
    wind_deg: 180,
    wind_gust: 7,
    clouds: 5,
    visibility: 10000,
    pressure: 1020,
    rain: null,
    snow: null,
    uvi: null,
    weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
    hourly: [hourlyForecast()],
    ...overrides,
  };
}

function dayFromToday(offsetDays: number, overrides: Partial<DailyForecast> = {}) {
  return forecastDay({ date: isoDate(offsetDays), ...overrides });
}

async function renderForecast(days: DailyForecast[]): Promise<string> {
  const fixture = TestBed.createComponent(WeatherForecastModalComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const modalRef = component.open({
    locationName: "Pretoria",
    rows: component.buildRows(days),
    isLoading: false,
    error: null,
  });
  fixture.detectChanges();
  await fixture.whenStable();

  const text = document.body.textContent ?? "";

  modalRef.dismiss("test-close");
  await modalRef.result.catch(() => undefined);

  return text;
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

  it("drops days already past and keeps at most the forecast day cap", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const days = Array.from({ length: 10 }, (_, index) => dayFromToday(index - 3));
    const rows = fixture.componentInstance.buildRows(days);

    expect(rows.length).toBe(FORECAST_DAY_COUNT);
    expect(rows[0].isToday).toBeTrue();
    expect(rows[1].isTomorrow).toBeTrue();
    expect(
      rows[FORECAST_DAY_COUNT - 1].date.getTime(),
    ).toBeGreaterThan(rows[0].date.getTime());
  });

  it("carries the newly exposed daily facts onto each row", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const [row] = fixture.componentInstance.buildRows([
      forecastDay({
        wind_gust: 13,
        clouds: 95,
        chance_of_rain: 16,
        precipitation: null,
        pressure: 1025,
        visibility: 8620,
      }),
    ]);

    expect(row.windGust).toBe(13);
    expect(row.cloudCover).toBe(95);
    expect(row.rainChance).toBe(16);
    expect(row.rainMillimetres).toBeNull();
    expect(row.pressure).toBe(1025);
    expect(row.visibility).toBe(8620);
  });

  it("never carries the dead daily feels-like values onto a row", () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const [row] = fixture.componentInstance.buildRows([
      forecastDay({
        feels_like: { day: 14.2, night: 11.1, morn: null, eve: null },
      }),
    ]);

    expect("feelsLikeDay" in row).toBeFalse();
    expect("feelsLikeNight" in row).toBeFalse();
  });

  it("reports a millimetre total when the API supplies one", async () => {
    const text = await renderForecast([
      forecastDay({ precipitation: 9.57, chance_of_rain: 100 }),
    ]);

    expect(text).toContain("Rain 9.6 mm");
    expect(text).not.toContain("100%");
  });

  it("falls back to the rain chance when the API omits the precipitation total", async () => {
    const text = await renderForecast([
      forecastDay({ precipitation: null, chance_of_rain: 16 }),
    ]);

    expect(text).toContain("Rain 16%");
    expect(text).not.toContain("Dry");
  });

  it("calls a day dry only when it has neither rain nor a rain chance", async () => {
    const text = await renderForecast([
      forecastDay({ precipitation: 0, chance_of_rain: 0 }),
    ]);

    expect(text).toContain("Dry");
  });

  it("renders every daily fact on its own line, and never a dead feels-like", async () => {
    const text = await renderForecast([
      forecastDay({ precipitation: 9.57, chance_of_rain: 100 }),
    ]);

    expect(text).toContain("Humidity 30%");
    expect(text).toContain("Wind 4 m/s");
    expect(text).toContain("Gust 7 m/s");
    expect(text).toContain("Clouds 5%");
    expect(text).toContain("Rain 9.6 mm");
    expect(text).toContain("Pressure 1,020 hPa");
    expect(text).toContain("Visibility 10 km");
    expect(text).not.toContain("Feels");
  });

  it("gives the daily facts the full row width instead of squeezing them beside the temps", async () => {
    const fixture = TestBed.createComponent(WeatherForecastModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const modalRef = component.open({
      locationName: "Pretoria",
      rows: component.buildRows([forecastDay({ description: "Light Rain" })]),
      isLoading: false,
      error: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const box = (selector: string) =>
      (document.querySelector(selector) as HTMLElement).getBoundingClientRect();
    const description = box(".forecast-day__description");
    const temps = box(".forecast-day__temps");
    const facts = box(".forecast-day__facts");

    expect(description.right).toBeLessThanOrEqual(temps.left);
    expect(Math.abs(facts.left - description.left)).toBeLessThan(2);
    expect(facts.width).toBeGreaterThan(description.width);
    expect(facts.top).toBeGreaterThan(description.bottom);

    modalRef.dismiss("test-close");
    await modalRef.result.catch(() => undefined);
  });

  it("titles the modal from the row cap so the two can never disagree", async () => {
    const text = await renderForecast([forecastDay()]);

    expect(text).toContain(`${FORECAST_DAY_COUNT}-day forecast`);
    expect(text).not.toContain("Today and the next");
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

  it("renders the capped days, the location, and temperatures when opened", async () => {
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
    expect(dayRows.length).toBe(FORECAST_DAY_COUNT);
    expect(dayRows[0].textContent).toContain("Today");
    expect(dayRows[1].textContent).toContain("Tomorrow");
    expect(dayRows[0].textContent).toContain("clear sky");
    expect(dayRows[0].textContent).toContain("10°");
    expect(dayRows[0].textContent).toContain("20°");
    expect(document.body.textContent).toContain(
      `${FORECAST_DAY_COUNT}-day forecast`,
    );
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
