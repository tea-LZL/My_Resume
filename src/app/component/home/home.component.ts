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
import { catchError } from "rxjs";
import { ModalComponent } from "../../shared/modal/modal.component";
import {
  FORECAST_TRIGGER_ICON,
  WeatherForecastModalComponent,
} from "../../shared/weather-forecast/weather-forecast-modal.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { ContributionCalendarComponent } from "../../shared/contribution-calendar/contribution-calendar.component";
import {
  ContributionDay,
  buildContributionWeeks,
  gitlabLevel,
} from "../../shared/contribution-calendar/contribution-heatmap";
import { WeatherService } from "../../services/weather.service";
import { DailyForecast, WeatherData } from "../../interfaces/weather";
import { Project } from "../../interfaces/project";
import {
  additionalSkills as portfolioAdditionalSkills,
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

interface GithubCalendarResponse {
  total?: Record<string, number>;
  contributions?: {
    date: string;
    count: number;
    level: number;
  }[];
}

const GITHUB_CALENDAR_URLS = [
  "/github-calendar?y=last",
  "https://github-contributions-api.jogruber.de/v4/tea-LZL?y=last",
] as const;

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

const WEATHER_LOCATION = "pretoria";

@Component({
  selector: "app-home",
  imports: [
    CommonModule,
    RouterLink,
    ModalComponent,
    WeatherForecastModalComponent,
    ScrollRevealDirective,
    ContributionCalendarComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild("modalComp") modalComp?: ModalComponent;
  @ViewChild("forecastModal") forecastModal?: WeatherForecastModalComponent;

  private readonly weatherService = inject(WeatherService);
  private readonly http = inject(HttpClient);

  readonly profile = portfolioProfile;
  readonly featuredProjects = portfolioFeaturedProjects;
  readonly skills = portfolioSkills;
  readonly additionalSkills = portfolioAdditionalSkills;
  readonly education = portfolioEducation;
  readonly certifications = portfolioCertifications;
  readonly workExperience = portfolioWorkExperience;
  readonly certificateLinks = certificateLinks;
  readonly forecastTriggerIcon = FORECAST_TRIGGER_ICON;
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

  forecastDays: DailyForecast[] | null = null;
  isForecastLoading = false;
  forecastError: string | null = null;

  gitlabWeeks: ContributionDay[][] = [];
  isGitlabLoading = false;
  gitlabError: string | null = null;

  githubWeeks: ContributionDay[][] = [];
  githubSummary: string | null = null;
  isGithubLoading = false;
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
    this.isGithubLoading = true;
    this.githubChartError = null;

    this.http.get<GithubCalendarResponse>(GITHUB_CALENDAR_URLS[0]).pipe(
      catchError(() => this.http.get<GithubCalendarResponse>(GITHUB_CALENDAR_URLS[1])),
    ).subscribe({
      next: (data) => {
        const contributions = data.contributions ?? [];
        const counts: Record<string, number> = {};
        const levels: Record<string, number> = {};
        for (const day of contributions) {
          counts[day.date] = day.count;
          levels[day.date] = day.level;
        }
        this.githubWeeks = buildContributionWeeks(counts, { levels });
        const year = String(new Date().getFullYear());
        const yearTotal = contributions
          .filter((day) => day.date.startsWith(`${year}-`))
          .reduce((sum, day) => sum + day.count, 0);
        this.githubSummary = `${yearTotal} contributions in ${year}`;
        this.isGithubLoading = false;
      },
      error: () => {
        this.githubWeeks = [];
        this.githubSummary = null;
        this.isGithubLoading = false;
        this.githubChartError =
          "GitHub contribution activity is unavailable right now.";
      },
    });
  }

  private fetchGitlabContributions(): void {
    this.isGitlabLoading = true;
    this.gitlabError = null;

    this.http.get<Record<string, number>>("/gitlab-calendar").subscribe({
      next: (data) => {
        this.gitlabWeeks = this.buildHeatmap(data, gitlabLevel);
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

  private buildHeatmap(
    data: Record<string, number>,
    levelForCount = gitlabLevel,
  ): ContributionDay[][] {
    return buildContributionWeeks(data, { levelForCount });
  }

  private fetchWeather(): void {
    this.isWeatherLoading = true;
    this.weatherError = null;

    this.weatherService
      .getWeather({
        location: WEATHER_LOCATION,
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

  openForecast(): void {
    const cached = this.forecastDays !== null;
    this.forecastModal?.open({
      locationName: this.forecastLocationName(),
      rows: this.forecastModal?.buildRows(this.forecastDays) ?? [],
      isLoading: !cached,
      error: this.forecastError,
    });

    if (!cached) {
      this.loadForecast();
    }
  }

  loadForecast(): void {
    this.isForecastLoading = true;
    this.forecastError = null;

    this.weatherService
      .getForecast({
        location: WEATHER_LOCATION,
        units: "metric",
        days: "5",
      })
      .subscribe({
        next: (response) => {
          this.forecastDays = response.success
            ? (response.data?.forecast ?? null)
            : null;
          this.forecastError = response.success
            ? null
            : "The forecast is unavailable right now.";
          this.isForecastLoading = false;
          this.syncForecastModal();
        },
        error: () => {
          this.forecastDays = null;
          this.forecastError = "The forecast is unavailable right now.";
          this.isForecastLoading = false;
          this.syncForecastModal();
        },
      });
  }

  private syncForecastModal(): void {
    this.forecastModal?.setState({
      locationName: this.forecastLocationName(),
      rows: this.forecastModal.buildRows(this.forecastDays),
      isLoading: this.isForecastLoading,
      error: this.forecastError,
    });
  }

  private forecastLocationName(): string {
    const name = this.weatherData?.location.name;
    return name ? name : "Pretoria";
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

  async openResume(): Promise<void> {
    const { createResumePdf, resolveResumePdfTheme } = await import(
      "../../shared/modal/download-resume/resume-pdf"
    );
    const pdfUrl = createResumePdf(resolveResumePdfTheme())
      .output("bloburl")
      .toString();
    this.modalComp?.openPdfResource(pdfUrl, () =>
      URL.revokeObjectURL(pdfUrl),
    );
  }

  getCertificateLink(id: string): CertificateLink | undefined {
    return certificateLinks[id];
  }
}
