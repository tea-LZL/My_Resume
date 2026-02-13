import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { WeatherResponse } from "../interfaces/weather";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private apiUrl = environment.OPENWEATHER_API_URL; // To be set by user
  private key: string = environment.OPENWEATHER_API_KEY;

  constructor(private http: HttpClient) {}

  getWeather(params?: Record<string, string>): Observable<WeatherResponse> {
    return this.http
      .get<WeatherResponse>(this.apiUrl, {
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
