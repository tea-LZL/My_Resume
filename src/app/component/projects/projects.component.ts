import { NgClass } from "@angular/common";
import { AfterViewInit, Component, OnInit } from "@angular/core";
import { Project } from "../../interfaces/project";

@Component({
  selector: "app-projects",
  imports: [NgClass],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent implements AfterViewInit, OnInit {
  constructor() {}
  ngOnInit(): void {
    const myCarouselElement = document.querySelector("#projectCarousel");
    // this.imgLoadStatus = this.arrCarouselImg.map(() => false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const carousel = new (window as any).bootstrap.Carousel(myCarouselElement, {
      interval: 2000,
      touch: false,
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const loadingEl = document.getElementById("app-loading");
      if (loadingEl) {
        loadingEl.classList.add("fade-out");
        setTimeout(() => loadingEl.remove(), 500);
      }
    }, 275);
  }

  arrProjects: Project[] = [
    {
      Title: "Weathering With GO API",
      Cover_Image_URL: "assets/weathering_with_go_api_cover_image.png",
      GitHub_Link:
        "https://github.com/tea-steeping-studio/weathering-with-go-api",
      ShortDescription:
        "A modern, high-performance weather API built with Go and the Gin web framework. Get current weather conditions and forecasts for any location worldwide using the OpenWeatherMap API.",
      Description: `Weathering With GO API was the project I set out to understand the quirk and super power of the programing language Go when pair with Gin framework, through this journey, working with the simplesitic philosophy of the Go design and combining it with the ever so complicated web, it has thought me that working with small building block and creating something bit by bit is not a hurdle of inconvinience but a tool of precision to more so control and specify the need and want of an application. The project now hosted on Google Cloud and managed with CI/CD Dcoker, it gives me great leverage to update and modify when I get even the shortest free time with no hastle`,
    },
    // ,{
    //   Title: "C# AutoClicker",
    //   Cover_Image_URL: "assets/weathering_with_go_api_cover_image.png",
    //   GitHub_Link: "https://github.com/tea-LZL/AutoClicker_CSharp",
    //   ShortDescription: "Console AutoClicker Written in C#",
    //   Description: "A Windows AutoClicker for the Console that I use. Written in haste and works like jank."
    // }
  ];
}
