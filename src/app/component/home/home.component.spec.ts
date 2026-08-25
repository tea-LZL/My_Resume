import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { WeatherService } from '../../services/weather.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  const httpClientStub = {
    get: (url: string) => (url === '/github-chart' ? of('') : of({})),
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
      ],
    })
    .compileComponents();
  });

  it('initializes without Bootstrap or a carousel element', () => {
    const windowWithBootstrap = window as Window & { bootstrap?: unknown };
    const originalBootstrap = windowWithBootstrap.bootstrap;
    delete windowWithBootstrap.bootstrap;
    spyOn(document, 'querySelector').and.returnValue(null);

    try {
      fixture = TestBed.createComponent(HomeComponent);

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
});
