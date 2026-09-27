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
  icon: string;
  description: string;
  minTemperature: number;
  maxTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherForecastState {
  locationName: string;
  rows: ForecastRow[];
  isLoading: boolean;
  error: string | null;
}

const FORECAST_DAY_COUNT = 5;

const WEATHER_ICON_MAP: Record<string, string> = {
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

@Component({
  selector: "app-weather-forecast-modal",
  imports: [DatePipe, DecimalPipe],
  templateUrl: "./weather-forecast-modal.component.html",
  styleUrl: "./weather-forecast-modal.component.scss",
})
export class WeatherForecastModalComponent {
  readonly retry = output<void>();

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

    return [...days]
      .sort((a, b) => this.toDate(a.date).getTime() - this.toDate(b.date).getTime())
      .slice(0, FORECAST_DAY_COUNT)
      .map((day, index) => ({
        date: this.toDate(day.date),
        isToday: index === 0,
        icon: WEATHER_ICON_MAP[day.icon] ?? "cloud",
        description: day.description,
        minTemperature: day.min_temperature,
        maxTemperature: day.max_temperature,
        humidity: day.humidity,
        windSpeed: day.wind_speed,
        precipitation: day.precipitation,
      }));
  }

  close(modal?: NgbModalRef): void {
    (modal ?? this.modalRef)?.dismiss("close");
  }

  private toDate(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
  }
}
