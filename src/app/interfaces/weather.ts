export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherCoords {
  lon: number;
  lat: number;
}

export interface WeatherCity {
  id: number;
  name: string;
  coord: WeatherCoords;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  wind_gust: number | null;
  condition: string;
  description: string;
  icon: string;
  cloud_cover: number;
  max_temperature: number | null;
  min_temperature: number | null;
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

export interface DailyTemps {
  day: number | null;
  min: number;
  max: number;
  night: number | null;
  morn: number | null;
  eve: number | null;
}

export interface DailyFeelsLike {
  day: number | null;
  night: number | null;
  morn: number | null;
  eve: number | null;
}

export interface PrecipitationVolume {
  "3h": number | null;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface HourlyForecast {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
    temp_kf: number;
  };
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust: number | null };
  visibility: number;
  pop: number;
  rain: PrecipitationVolume | null;
  snow: PrecipitationVolume | null;
  sys: { pod: string };
  dt_txt: string;
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
  precipitation: number | null;
  chance_of_rain: number;
  uv_index: number | null;
  pop: number;
  pop_min: number;
  pop_mean: number;
  temp: DailyTemps;
  feels_like: DailyFeelsLike;
  wind_deg: number;
  wind_gust: number;
  clouds: number;
  visibility: number;
  pressure: number;
  rain: PrecipitationVolume | null;
  snow: PrecipitationVolume | null;
  uvi: number | null;
  weather: WeatherCondition[];
  hourly: HourlyForecast[];
}

export interface WeatherForecastData {
  cod: string;
  message: number;
  cnt: number;
  city: WeatherCity;
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: DailyForecast[];
  request_time: string;
}

export interface WeatherForecastResponse {
  success: boolean;
  data: WeatherForecastData;
}
