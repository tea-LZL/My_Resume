import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { WeatherResponse } from "../interfaces/weather";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private apiUrl = ""; // To be set by user

  constructor(private http: HttpClient) {}

  getWeather(params?: Record<string, string>): Observable<WeatherResponse> {
    return this.http
      .get<WeatherResponse>(
        "https://weathering-with-go-api-324269546067.europe-west1.run.app/api/v1/weather/current",
        { params },
      )
      .pipe(
        catchError((error) => {
          console.error("Weather API Error:", error);
          return throwError(() => new Error("Failed to fetch weather data"));
        }),
      );
  }
}
