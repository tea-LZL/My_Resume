import { Component, ViewChild } from "@angular/core";
import { Project } from "../../interfaces/project";
import { ImageLightboxComponent } from "../../shared/image-lightbox/image-lightbox.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { StepRevealComponent, StepItem } from "../../shared/step-reveal/step-reveal.component";

@Component({
  selector: "app-projects",
  imports: [ImageLightboxComponent, ScrollRevealDirective, StepRevealComponent],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent {
  @ViewChild("imageLightbox") imageLightbox!: ImageLightboxComponent;

  openImage(url: string) {
    this.imageLightbox.openImageModal(url);
  }

  caseStudySteps: StepItem[] = [
    {
      title: "Start with the problem — weather data for any location, fast",
      expression: "GET /weather?city=pretoria → 200 OK { temp, humidity, wind }",
      note: "The OpenWeatherMap API returns rich data, but the free tier is rate-limited. We need a caching layer that respects the 10-minute freshness window."
    },
    {
      title: "Choose the right tool — Go + Gin for zero-dependency speed",
      expression: "go mod init && go get github.com/gin-gonic/gin",
      note: "Go's standard library covers HTTP, JSON, and testing. Gin adds routing and middleware without the framework tax. Binary size: ~12 MB."
    },
    {
      title: "Design the cache — in-memory with TTL eviction",
      expression: "type Cache struct { mu sync.RWMutex; items map[string]CacheEntry }",
      note: "A simple map with read-write mutex. Each entry stores the response plus an expiration timestamp. A background goroutine sweeps stale entries every 60 seconds."
    },
    {
      title: "Containerize — single-stage Docker build, 18 MB image",
      expression: "FROM golang:alpine AS build → COPY . . → go build → FROM scratch",
      note: "Multi-stage builds keep the final image tiny. No shell, no package manager — just the Go binary and a CA cert bundle for HTTPS."
    },
    {
      title: "Deploy to Google Cloud Run — CI/CD via GitHub Actions",
      expression: "gcloud run deploy weathering-api --image gcr.io/... --region us-central1",
      note: "Cloud Run auto-scales to zero when idle (no cost) and spins up in under a second on the first request. GitHub Actions pushes on every merge to main."
    },
    {
      title: "Monitor and iterate — structured logging and health checks",
      expression: "GET /health → 200 { \"status\": \"ok\", \"uptime\": \"72h\" }",
      note: "Every request logs method, path, status, and latency. The health endpoint lets Cloud Run know the instance is ready. Alerts fire if error rate exceeds 1%.",
      final: true
    }
  ];

  arrProjects: Project[] = [
    {
      Title: "Weathering With GO API",
      Cover_Image_URLs: ["assets/weathering_with_go_api_cover_image.png"],
      GitHub_Link:
        "https://github.com/tea-steeping-studio/weathering-with-go-api",
      ShortDescription:
        "A modern, high-performance weather API built with Go and the Gin web framework. Get current weather conditions and forecasts for any location worldwide using the OpenWeatherMap API.",
      Description: `Weathering With GO API was the project I set out to understand the quirk and super power of the programing language Go when pair with Gin framework, through this journey, working with the simplesitic philosophy of the Go design and combining it with the ever so complicated web, it has thought me that working with small building block and creating something bit by bit is not a hurdle of inconvinience but a tool of precision to more so control and specify the need and want of an application. The project now hosted on Google Cloud and managed with CI/CD Dcoker, it gives me great leverage to update and modify when I get even the shortest free time with no hastle`,
      Tags: ["Go", "Gin", "REST API", "Docker", "GCP"],
      Featured: true,
    },
    {
      Title: "GenPass",
      Cover_Image_URLs: ["assets/genpass_cover_image.png"],
      GitHub_Link: "https://github.com/tea-LZL/GenPass",
      ShortDescription:
        "Password Generator built with Rust and TUI with ratatui",
      Description:
        "A Password Generator TUI that runs on local, no need to go to Password Generator website anymore.",
      Tags: ["Rust", "TUI", "ratatui"],
    },
    {
      Title: "Convo",
      Cover_Image_URLs: ["assets/convo_cover_image.png", "assets/convo_setup_model_image.png"],
      GitHub_Link: "#",
      ShortDescription:
        "A frontend UI for Ollama that lets you chat with LLMs, manage models, and browse chat history — all through a clean, responsive interface.",
      Description:
        "Convo is a frontend UI that interacts with the Ollama API, providing a user-friendly interface to chat with AI models. It supports setting up and managing models, maintaining chat history, and provides a seamless experience for interacting with locally hosted LLMs through Ollama.",
      Tags: ["Angular", "TypeScript", "Ollama", "AI"],
    },
  ];
}
