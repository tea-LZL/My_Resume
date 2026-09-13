import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { WeatherService } from '../../services/weather.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  const httpClientStub = {
    get: (url: string) =>
      url.startsWith("/github-calendar")
        ? of({ total: { lastYear: 0 }, contributions: [] })
        : of({}),
  };
  const weatherServiceStub = {
    getWeather: () => of({ success: false, data: {} }),
  };

  beforeEach(async () => {
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
});
