import { DatePipe, DecimalPipe } from "@angular/common";
import {
  Component,
  TemplateRef,
  ViewChild,
  inject,
  output,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DailyForecast } from "../../interfaces/weather";

export interface ForecastRow {
  date: Date;
  isToday: boolean;
  isTomorrow: boolean;
  icon: string;
  description: string;
  minTemperature: number;
  maxTemperature: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  cloudCover: number;
  rainMillimetres: number | null;
  rainChance: number;
  pressure: number;
  visibility: number;
}

export interface WeatherForecastState {
  locationName: string;
  rows: ForecastRow[];
  isLoading: boolean;
  error: string | null;
}

export const FORECAST_DAY_COUNT = 5;

export const WEATHER_ICON_MAP: Record<string, string> = {
  "01d": "sun-fill",
  "01n": "moon-stars-fill",
  "02d": "cloud-sun-fill",
  "02n": "cloud-moon",
  "03d": "clouds-fill",
  "03n": "clouds",
  "04d": "clouds-fill",
  "04n": "clouds",
  "09d": "cloud-drizzle-fill",
  "09n": "cloud-drizzle",
  "10d": "cloud-rain-fill",
  "10n": "cloud-rain",
  "11d": "cloud-lightning-rain-fill",
  "11n": "cloud-lightning-rain",
  "13d": "cloud-snow-fill",
  "13n": "cloud-snow",
  "50d": "cloud-fog2-fill",
  "50n": "cloud-fog2",
};

export const WEATHER_ICON_FALLBACK = "cloudy-fill";

@Component({
  selector: "app-weather-forecast-modal",
  imports: [DatePipe, DecimalPipe],
  templateUrl: "./weather-forecast-modal.component.html",
  styleUrl: "./weather-forecast-modal.component.scss",
})
export class WeatherForecastModalComponent {
  readonly retry = output<void>();
  readonly forecastDayCount = FORECAST_DAY_COUNT;

  locationName = "";
  rows: ForecastRow[] = [];
  isLoading = false;
  error: string | null = null;

  private readonly modalService = inject(NgbModal);
  private modalRef?: NgbModalRef;

  @ViewChild("forecastModal", { static: true })
  forecastModal!: TemplateRef<unknown>;

  open(state: WeatherForecastState): NgbModalRef {
    this.setState(state);
    this.modalRef = this.modalService.open(this.forecastModal, {
      size: "lg",
      windowClass: "weather-forecast-window",
      backdrop: true,
      keyboard: true,
      ariaLabelledBy: "weather-forecast-title",
    });

    return this.modalRef;
  }

  setState(state: WeatherForecastState): void {
    this.locationName = state.locationName;
    this.rows = state.rows;
    this.isLoading = state.isLoading;
    this.error = state.error;
  }

  buildRows(days: DailyForecast[] | null): ForecastRow[] {
    if (!days?.length) {
      return [];
    }

    const today = this.todayAnchor();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    return days
      .map((day) => ({ day, date: this.toDate(day.date) }))
      .filter(({ date }) => date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, FORECAST_DAY_COUNT)
      .map(({ day, date }) => ({
        date,
        isToday: date.getTime() === today.getTime(),
        isTomorrow: date.getTime() === tomorrow.getTime(),
        icon: WEATHER_ICON_MAP[day.icon] ?? WEATHER_ICON_FALLBACK,
        description: day.description,
        minTemperature: day.min_temperature,
        maxTemperature: day.max_temperature,
        humidity: day.humidity,
        windSpeed: day.wind_speed,
        windGust: day.wind_gust,
        cloudCover: day.clouds,
        rainMillimetres: day.precipitation,
        rainChance: day.chance_of_rain,
        pressure: day.pressure,
        visibility: day.visibility,
      }));
  }

  close(modal?: NgbModalRef): void {
    (modal ?? this.modalRef)?.dismiss("close");
  }

  private toDate(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return this.atNoon(year, month - 1, day);
  }

  private todayAnchor(): Date {
    const now = new Date();
    return this.atNoon(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private atNoon(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day, 12));
  }
}
