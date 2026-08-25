import { Component, ViewChild } from "@angular/core";

import { portfolioProjects } from "../../data/portfolio.data";
import { Project } from "../../interfaces/project";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { ImageLightboxComponent } from "../../shared/image-lightbox/image-lightbox.component";
import {
  StepItem,
  StepRevealComponent,
} from "../../shared/step-reveal/step-reveal.component";

@Component({
  selector: "app-projects",
  imports: [ImageLightboxComponent, ScrollRevealDirective, StepRevealComponent],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent {
  @ViewChild("imageLightbox") imageLightbox?: ImageLightboxComponent;

  readonly projects = portfolioProjects;
  private readonly failedImages = new Set<string>();

  readonly caseStudySteps: StepItem[] = [
    {
      title: "Start with the problem — weather data for any location, fast",
      expression: "GET /weather?city=pretoria → 200 OK { temp, humidity, wind }",
      note: "The OpenWeatherMap API returns rich data, but the free tier is rate-limited. We need a caching layer that respects the 10-minute freshness window.",
    },
    {
      title: "Choose the right tool — Go + Gin for zero-dependency speed",
      expression: "go mod init && go get github.com/gin-gonic/gin",
      note: "Go's standard library covers HTTP, JSON, and testing. Gin adds routing and middleware without the framework tax.",
    },
    {
      title: "Design the cache — in-memory with TTL eviction",
      expression: "type Cache struct { mu sync.RWMutex; items map[string]CacheEntry }",
      note: "A simple map with read-write mutex. Each entry stores the response plus an expiration timestamp.",
    },
    {
      title: "Containerize — single-stage Docker build",
      expression: "FROM golang:alpine AS build → go build → FROM scratch",
      note: "Multi-stage builds keep the final image small and focused on the Go binary and CA certificates.",
    },
    {
      title: "Deploy to Google Cloud Run — CI/CD via GitHub Actions",
      expression: "gcloud run deploy weathering-api --image gcr.io/...",
      note: "Cloud Run provides a small, independently deployable service for the weather case study.",
    },
    {
      title: "Monitor and iterate — structured logging and health checks",
      expression: 'GET /health → 200 { "status": "ok" }',
      note: "A health endpoint and structured request logs keep the deployed API observable.",
      final: true,
    },
  ];

  imagesFor(project: Project): readonly string[] {
    return project.gallery?.length
      ? project.gallery
      : [project.coverImageUrl];
  }

  openImage(url: string, projectTitle: string): void {
    this.imageLightbox?.openImageModal(`${url}`, `${projectTitle} project artwork`);
  }

  onImageError(projectId: string): void {
    this.failedImages.add(projectId);
  }

  isImageAvailable(projectId: string): boolean {
    return !this.failedImages.has(projectId);
  }
}