import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import {
  WeatherForecastResponse,
  WeatherResponse,
} from "../interfaces/weather";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private readonly http = inject(HttpClient);
  private apiUrl = environment.OPENWEATHER_API_URL; // To be set by user
  private forecastUrl = environment.OPENWEATHER_FORECAST_URL;
  private key: string = environment.OPENWEATHER_API_KEY;

  getWeather(params?: Record<string, string>): Observable<WeatherResponse> {
    return this.request<WeatherResponse>(this.apiUrl, params);
  }

  getForecast(
    params?: Record<string, string>,
  ): Observable<WeatherForecastResponse> {
    return this.request<WeatherForecastResponse>(this.forecastUrl, params);
  }

  private request<T>(
    url: string,
    params?: Record<string, string>,
  ): Observable<T> {
    return this.http
      .get<T>(url, {
        params,
        headers: { "X-API-Key": this.key },
      })
      .pipe(
        catchError((error) => {
          console.error("Weather API Error:", error);
          return throwError(() => new Error("Failed to fetch weather data"));
        }),
      );
  }
}
