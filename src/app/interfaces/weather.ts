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
