import { Component, ViewChild } from "@angular/core";
import { Project } from "../../interfaces/project";
import { ImageLightboxComponent } from "../../shared/image-lightbox/image-lightbox.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-projects",
  imports: [ImageLightboxComponent, ScrollRevealDirective],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent {
  @ViewChild("imageLightbox") imageLightbox!: ImageLightboxComponent;

  openImage(url: string) {
    this.imageLightbox.openImageModal(url);
  }

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
