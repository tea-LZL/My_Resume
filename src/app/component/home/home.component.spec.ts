import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { WeatherService } from '../../services/weather.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let getForecast: jasmine.Spy;

  const httpClientStub = {
    get: (url: string) =>
      url.startsWith("/github-calendar")
        ? of({ total: { lastYear: 0 }, contributions: [] })
        : of({}),
  };
  const weatherServiceStub = {
    getWeather: () => of({ success: false, data: {} }),
    getForecast: (params: Record<string, string>) => getForecast(params),
  };

  beforeEach(async () => {
    getForecast = jasmine
      .createSpy('getForecast')
      .and.returnValue(
        of({
          success: true,
          data: { location: { name: 'Pretoria' }, forecast: [] },
        }),
      );

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

  it('reuses the cached forecast when the modal is reopened', () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    fixture.componentInstance.openForecast();
    fixture.componentInstance.openForecast();

    expect(getForecast).toHaveBeenCalledTimes(1);

    fixture.componentInstance.forecastModal?.close();
  });
});
