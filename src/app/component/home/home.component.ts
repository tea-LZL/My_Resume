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
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-home",
  imports: [CommonModule, NgClass, ModalComponent, ScrollRevealDirective],
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

    // Kinetic typography: animate characters when the hero scrolls into view
    this.setupKineticReveal();
  }

  /** Watch for the hero entering the viewport, then stagger the character animations */
  private setupKineticReveal(): void {
    const heroEl = document.getElementById("hero-name");
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateKineticHero();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(heroEl);
  }

  /** Animate each character with staggered delays */
  private animateKineticHero(): void {
    const chars = document.querySelectorAll<HTMLElement>(".kinetic-char");
    chars.forEach((char, i) => {
      char.style.animationDelay = `${i * 0.05}s`;
    });
  }

  /** Film-strip palette scrub: move the scrub line with mouse/touch */
  onPaletteScrub(event: MouseEvent | TouchEvent): void {
    const strip = document.getElementById("paletteStrip");
    const line = document.getElementById("paletteScrubLine");
    if (!strip || !line) return;

    const rect = strip.getBoundingClientRect();
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    line.style.left = `${x}px`;
    line.style.opacity = "0.7";
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
      "01d": "sun-fill",
      "01n": "moon-stars-fill",
      "02d": "cloud-sun-fill",
      "02n": "cloud-moon",
      "03d": "cloud-sun-fill",
      "03n": "cloud-moon",
      "04d": "clouds-fill",
      "04n": "clouds",
      "09d": "cloud-drizzle-fill",
      "09n": "cloud-drizzle",
      "10d": "cloud-rain-fill",
      "10n": "cloud-rain",
      "11d": "cloud-lightning-rain-fill",
      "11n": "cloud-lightning-rain",
      "13d": "cloud-snow-fill",
      "13n": "cloud-snow",
      "50d": "cloud-fog2-fill",
      "50n": "cloud-fog2",
    };
    return iconMap[iconCode] || "cloud";
  }

  viewFile(string: string) {
    this.modalComp.openPdfModal(string);
  }
}
