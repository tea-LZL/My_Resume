import { CommonModule, NgClass } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { ModalComponent } from "../../shared/modal/modal.component";
import { WeatherService } from "../../services/weather.service";
import { WeatherData } from "../../interfaces/weather";

@Component({
  selector: "app-home",
  imports: [CommonModule, NgClass, ModalComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChildren("transGrow") transGrowElems!: QueryList<ElementRef>;
  @ViewChild("modalComp") modalComp!: ModalComponent;
  imgLoadStatus: boolean[] = [];
  weatherData: WeatherData | null = null;
  isWeatherLoading = false;
  weatherError: string | null = null;

  constructor(
    private renderer: Renderer2,
    private weatherService: WeatherService,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.transGrowElems.forEach((elem) => {
        this.renderer.addClass(elem.nativeElement, "grow");
      });
      const loadingEl = document.getElementById("app-loading");
      if (loadingEl) {
        loadingEl.classList.add("fade-out");
        setTimeout(() => loadingEl.remove(), 500);
      }
    }, 275);
  }

  arrCarouselImg = [
    "assets/Kobo_help_dance1.GIF",
    "assets/Kobo_help_dance2.GIF",
    "assets/Kobo_help_down.GIF",
    "assets/Kobo_help_jump.GIF",
    "assets/Kobo_help_walk.GIF",
  ];
  isImgLoaded = false;
  ngOnInit() {
    const myCarouselElement = document.querySelector("#carousel");
    this.imgLoadStatus = this.arrCarouselImg.map(() => false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const carousel = new (window as any).bootstrap.Carousel(myCarouselElement, {
      interval: 2000,
      touch: false,
    });
    this.fetchWeather();
  }

  fetchWeather() {
    this.isWeatherLoading = true;
    this.weatherError = null;

    this.weatherService
      .getWeather({
        location: "pretoria",
        units: "metric",
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.weatherData = response.data;
          } else {
            this.weatherError = "Failed to load weather data";
          }
          this.isWeatherLoading = false;
        },
        error: (error) => {
          this.weatherError = error.message || "Failed to load weather data";
          this.isWeatherLoading = false;
        },
      });
  }

  getWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      "01d": "\uf00d", // wi-day-sunny
      "01n": "\uf02e", // wi-night-clear
      "02d": "\uf002", // wi-day-cloudy
      "02n": "\uf086", // wi-night-alt-cloudy
      "03d": "\uf013", // wi-cloudy
      "03n": "\uf013",
      "04d": "\uf041", // wi-cloud
      "04n": "\uf041",
      "09d": "\uf01a", // wi-showers
      "09n": "\uf01a",
      "10d": "\uf008", // wi-day-rain
      "10n": "\uf036", // wi-night-rain
      "11d": "\uf01e", // wi-thunderstorm
      "11n": "\uf01e",
      "13d": "\uf01b", // wi-snow
      "13n": "\uf01b",
      "50d": "\uf014", // wi-fog
      "50n": "\uf014",
    };
    return iconMap[iconCode] || "\uf07b"; // wi-na
  }

  viewFile(string: string) {
    this.modalComp.openPdfModal(string);
  }
}
