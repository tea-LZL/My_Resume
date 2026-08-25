import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RouterLink } from "@angular/router";
import { ModalComponent } from "../../shared/modal/modal.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { WeatherService } from "../../services/weather.service";
import { WeatherData } from "../../interfaces/weather";
import { Project } from "../../interfaces/project";
import {
  CertificateLink,
  certificateLinks,
  certifications as portfolioCertifications,
  education as portfolioEducation,
  featuredProjects as portfolioFeaturedProjects,
  portfolioProjects,
  profile as portfolioProfile,
  skills as portfolioSkills,
  workExperience as portfolioWorkExperience,
} from "../../data/portfolio.data";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface BootstrapWindow extends Window {
  bootstrap?: {
    Carousel?: new (
      element: Element,
      options: {
        interval: number;
        touch: boolean;
      },
    ) => unknown;
  };
}

@Component({
  selector: "app-home",
  imports: [CommonModule, RouterLink, ModalComponent, ScrollRevealDirective],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild("modalComp") modalComp?: ModalComponent;

  private readonly weatherService = inject(WeatherService);
  private readonly http = inject(HttpClient);

  readonly profile = portfolioProfile;
  readonly featuredProjects = portfolioFeaturedProjects;
  readonly skills = portfolioSkills;
  readonly education = portfolioEducation;
  readonly certifications = portfolioCertifications;
  readonly workExperience = portfolioWorkExperience;
  readonly certificateLinks = certificateLinks;
  readonly weatheringProject: Project | undefined = portfolioProjects.find(
    (project) => project.id === "weathering-with-go-api",
  );

  readonly arrCarouselImg = [
    "assets/Cat1.JPEG",
    "assets/Cat2.JPEG",
    "assets/Cat3.JPEG",
    "assets/Cat4.JPEG",
  ];

  imgLoadStatus: boolean[] = [];
  isImgLoaded = false;
  private readonly carouselImageErrors = new Set<number>();
  private readonly projectImageErrors = new Set<string>();

  weatherData: WeatherData | null = null;
  isWeatherLoading = false;
  weatherError: string | null = null;

  gitlabWeeks: ContributionDay[][] = [];
  isGitlabLoading = false;
  gitlabError: string | null = null;

  githubChartUrl = "/github-chart";
  isGithubChartLoaded = false;
  githubChartError: string | null = null;

  ngOnInit(): void {
    this.imgLoadStatus = this.arrCarouselImg.map(() => false);
    this.fetchWeather();
    this.fetchGitlabContributions();
    this.fetchGithubContributions();
  }

  ngAfterViewInit(): void {
    this.initializeCarousel();
  }

  private initializeCarousel(): void {
    const carouselElement =
      typeof document === "undefined"
        ? null
        : document.querySelector("#carousel");
    const Carousel =
      typeof window === "undefined"
        ? undefined
        : (window as BootstrapWindow).bootstrap?.Carousel;

    if (carouselElement && Carousel) {
      new Carousel(carouselElement, {
        interval: 5000,
        touch: true,
      });
    }
  }

  private fetchGithubContributions(): void {
    // The chart is requested as an image so its SVG never enters the HTML trust boundary.
    this.githubChartUrl = "/github-chart";
    this.isGithubChartLoaded = false;
    this.githubChartError = null;
  }

  private fetchGitlabContributions(): void {
    this.isGitlabLoading = true;
    this.gitlabError = null;

    this.http.get<Record<string, number>>("/gitlab-calendar").subscribe({
      next: (data) => {
        this.gitlabWeeks = this.buildHeatmap(data);
        this.isGitlabLoading = false;
      },
      error: () => {
        this.gitlabWeeks = [];
        this.isGitlabLoading = false;
        this.gitlabError =
          "GitLab activity is unavailable right now, but the rest of the portfolio is still available.";
      },
    });
  }

  private buildHeatmap(data: Record<string, number>): ContributionDay[][] {
    const today = new Date();
    const weeks: ContributionDay[][] = [];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    const cursor = new Date(startDate);
    cursor.setDate(cursor.getDate() - cursor.getDay());

    let currentWeek: ContributionDay[] = [];
    let weekCount = 0;

    while (weekCount < 53) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const count = data[dateStr] || 0;
      currentWeek.push({
        date: dateStr,
        count,
        level:
          count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekCount++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return weeks;
  }

  private fetchWeather(): void {
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
            this.weatherData = null;
            this.weatherError = "Weather data is unavailable right now.";
          }
          this.isWeatherLoading = false;
        },
        error: () => {
          this.weatherData = null;
          this.weatherError = "Weather data is unavailable right now.";
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

  onGithubChartLoad(): void {
    this.isGithubChartLoaded = true;
    this.githubChartError = null;
  }

  onGithubChartError(): void {
    this.isGithubChartLoaded = false;
    this.githubChartError =
      "GitHub contribution activity is unavailable right now.";
  }

  onCarouselImageLoad(index: number): void {
    this.imgLoadStatus[index] = true;
    this.isImgLoaded = true;
  }

  onCarouselImageError(index: number): void {
    this.carouselImageErrors.add(index);
  }

  isCarouselImageFailed(index: number): boolean {
    return this.carouselImageErrors.has(index);
  }

  get carouselUnavailable(): boolean {
    return this.carouselImageErrors.size >= this.arrCarouselImg.length;
  }

  onProjectImageError(projectId: string): void {
    this.projectImageErrors.add(projectId);
  }

  isProjectImageFailed(projectId: string): boolean {
    return this.projectImageErrors.has(projectId);
  }

  viewFile(pdfFile: string): void {
    this.modalComp?.openPdfModal(pdfFile);
  }

  openResume(): void {
    this.viewFile("Credentials_ZhilongLiang_4664_Azure_Developer_Associate.pdf");
  }

  getCertificateLink(id: string): CertificateLink | undefined {
    return certificateLinks[id];
  }
}
