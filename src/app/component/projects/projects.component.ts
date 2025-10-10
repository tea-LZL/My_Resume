import { NgClass } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Project } from '../../interfaces/project';

@Component({
  selector: 'app-projects',
  imports: [NgClass],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements AfterViewInit, OnInit{

  constructor() {
  }
  ngOnInit(): void {
    const myCarouselElement = document.querySelector('#projectCarousel')
    // this.imgLoadStatus = this.arrCarouselImg.map(() => false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const carousel = new (window as any).bootstrap.Carousel(myCarouselElement, {
      interval: 2000,
      touch: false
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const loadingEl = document.getElementById('app-loading');
      if (loadingEl) {
        loadingEl.classList.add('fade-out');
        setTimeout(() => loadingEl.remove(), 500);
      }
    }, 275);
  }


  arrProjects: Project[] = [
    {
      Title: "Weathering With GO API",
      Cover_Image_URL: "assets/weathering_with_go_api_cover_image.png",
      GitHub_Link: "https://github.com/tea-steeping-studio/weathering-with-go-api",
      ShortDescription: "A modern, high-performance weather API built with Go and the Gin web framework. Get current weather conditions and forecasts for any location worldwide using the OpenWeatherMap API.",
      Description: "Currently WIP cleaning up the solution, implementing a CI/CD solution to releases and constructing a separate frontend UI built with Electron"
    }
    // ,{
    //   Title: "C# AutoClicker",
    //   Cover_Image_URL: "assets/weathering_with_go_api_cover_image.png",
    //   GitHub_Link: "https://github.com/tea-LZL/AutoClicker_CSharp",
    //   ShortDescription: "Console AutoClicker Written in C#",
    //   Description: "A Windows AutoClicker for the Console that I use. Written in haste and works like jank."
    // }
  ];
}
