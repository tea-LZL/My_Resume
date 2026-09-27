export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  condition: string;
  description: string;
  icon: string;
  uv_index: number;
  cloud_cover: number;
  last_updated: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  request_time: string;
}

export interface WeatherResponse {
  success: boolean;
  data: WeatherData;
}

export interface DailyForecast {
  date: string;
  max_temperature: number;
  min_temperature: number;
  avg_temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  chance_of_rain: number;
  uv_index: number;
}

export interface WeatherForecastData {
  location: WeatherLocation;
  forecast: DailyForecast[];
  request_time: string;
}

export interface WeatherForecastResponse {
  success: boolean;
  data: WeatherForecastData;
}
