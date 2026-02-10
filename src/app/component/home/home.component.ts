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
      "01d": "󰖨", // wi-day-sunny
      "01n": "", // wi-night-clear
      "02d": "", // wi-day-cloudy
      "02n": "", // wi-night-alt-cloudy
      "03d": "󰖐", // wi-cloudy
      "03n": "󰖐",
      "04d": "", // wi-cloud
      "04n": "",
      "09d": "", // wi-showers
      "09n": "",
      "10d": "", // wi-day-rain
      "10n": "", // wi-night-rain
      "11d": "", // wi-thunderstorm
      "11n": "",
      "13d": "", // wi-snow
      "13n": "",
      "50d": "", // wi-fog
      "50n": "",
    };
    return iconMap[iconCode] || "\uf07b"; // wi-na
  }

  viewFile(string: string) {
    this.modalComp.openPdfModal(string);
  }
}
