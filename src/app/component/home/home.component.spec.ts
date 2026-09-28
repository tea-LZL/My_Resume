import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { WeatherService } from '../../services/weather.service';
import { WeatherData } from '../../interfaces/weather';
import { WEATHER_ICON_FALLBACK } from '../../shared/weather-forecast/weather-forecast-modal.component';

function currentWeather(icon = '02d'): WeatherData {
  return {
    location: { name: 'Pretoria', country: 'ZA', latitude: -25.7, longitude: 28.2 },
    current: {
      temperature: 25.4,
      feels_like: 24.1,
      humidity: 42,
      pressure: 1014,
      visibility: 10000,
      wind_speed: 5,
      wind_direction: 180,
      wind_gust: 8,
      condition: 'Clouds',
      description: 'Scattered Clouds',
      icon,
      cloud_cover: 40,
      max_temperature: 27.2,
      min_temperature: 18.1,
      last_updated: '2026-09-27T18:00:00Z',
    },
    request_time: '2026-09-27T18:00:00Z',
  };
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let getWeather: jasmine.Spy;
  let getForecast: jasmine.Spy;

  const httpClientStub = {
    get: (url: string) =>
      url.startsWith('/github-calendar')
        ? of({ total: { lastYear: 0 }, contributions: [] })
        : of({}),
  };
  const forecastPayload = {
    success: true,
    data: { location: { name: 'Pretoria' }, forecast: [] },
  };
  const weatherServiceStub = {
    getWeather: (params: Record<string, string>) => getWeather(params),
    getForecast: (params: Record<string, string>) => getForecast(params),
  };

  beforeEach(async () => {
    getWeather = jasmine
      .createSpy('getWeather')
      .and.returnValue(of({ success: true, data: currentWeather() }));
    getForecast = jasmine
      .createSpy('getForecast')
      .and.returnValue(of(forecastPayload));
    getForecast = jasmine
      .createSpy('getForecast')
      .and.returnValue(of(forecastPayload));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientStub },
        { provide: WeatherService, useValue: weatherServiceStub },
        provideRouter([]),
      ],
    })
    .compileComponents();
  });

  it('initializes without Bootstrap or a carousel element', () => {
    const windowWithBootstrap = window as Window & { bootstrap?: unknown };
    const originalBootstrap = windowWithBootstrap.bootstrap;
    delete windowWithBootstrap.bootstrap;

    try {
      fixture = TestBed.createComponent(HomeComponent);
      spyOn(document, 'querySelector').and.returnValue(null);

      expect(() => fixture.componentInstance.ngOnInit()).not.toThrow();
      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      if (originalBootstrap === undefined) {
        delete windowWithBootstrap.bootstrap;
      } else {
        windowWithBootstrap.bootstrap = originalBootstrap;
      }
    }
  });

  it('opens the generated resume in the PDF viewer', async () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    await fixture.componentInstance.openResume();
    fixture.detectChanges();

    expect(fixture.componentInstance.modalComp?.pdfUrl).toBeTruthy();
  });

  it('fetches the forecast lazily the first time the modal is opened', () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    expect(getForecast).not.toHaveBeenCalled();

    fixture.componentInstance.openForecast();

    expect(getForecast).toHaveBeenCalledTimes(1);
    expect(getForecast).toHaveBeenCalledWith({
      location: 'pretoria',
      units: 'metric',
      days: '5',
    });

    fixture.componentInstance.forecastModal?.close();
  });

  it('no longer exposes a seven day forecast endpoint', () => {
    expect('getSevenDayForecast' in WeatherService.prototype).toBeFalse();
    expect('getForecast' in WeatherService.prototype).toBeTrue();
  });

  it('reuses the cached forecast when the modal is reopened', () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    fixture.componentInstance.openForecast();
    fixture.componentInstance.openForecast();

    expect(getForecast).toHaveBeenCalledTimes(1);

    fixture.componentInstance.forecastModal?.close();
  });

  it('renders the reading, the extra stats, and the live status in the weather card', () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const card = (fixture.nativeElement as HTMLElement).querySelector(
      '.signal-card--weather',
    ) as HTMLElement;

    expect(card.querySelector('.signal-value')?.textContent).toContain('25');
    expect(card.querySelector('.signal-detail')?.textContent?.trim()).toBe(
      'Scattered Clouds',
    );
    expect(card.querySelector('.signal-icon')?.classList.contains('bi-cloud-sun-fill')).toBeTrue();

    const stats = card.querySelectorAll('.signal-stats > div');
    expect(stats.length).toBe(3);
    expect(stats[0].textContent).toContain('24');
    expect(stats[1].textContent).toContain('42');
    expect(stats[2].textContent).toContain('5 m/s');

    const footer = card.querySelector('.signal-footer') as HTMLElement;
    expect(footer.querySelector('.signal-status')?.textContent?.trim()).toBe('Live');
  });

  it('keeps the status in the footer and hides the stats when the card is offline', () => {
    getWeather.and.returnValue(of({ success: false, data: {} }));

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const card = (fixture.nativeElement as HTMLElement).querySelector(
      '.signal-card--weather',
    ) as HTMLElement;

    expect(card.querySelectorAll('.signal-stats > div').length).toBe(0);
    expect(
      card.querySelector('.signal-footer .signal-status')?.textContent?.trim(),
    ).toBe('Offline');
    expect(card.querySelector('.signal-footer .signal-status--error')).toBeTruthy();
  });

  it('maps the current condition icon and falls back for unknown codes', () => {
    fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.weatherData = currentWeather('01d');
    expect(component.currentWeatherIcon).toBe('sun-fill');

    component.weatherData = currentWeather('10n');
    expect(component.currentWeatherIcon).toBe('cloud-rain');

    component.weatherData = currentWeather('nope');
    expect(component.currentWeatherIcon).toBe(WEATHER_ICON_FALLBACK);

    component.weatherData = null;
    expect(component.currentWeatherIcon).toBe(WEATHER_ICON_FALLBACK);
  });
});
