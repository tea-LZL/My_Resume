import { NgClass, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor,NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  arrCarouselImg = [
    'assets/Kobo_help_dance1.GIF',
    'assets/Kobo_help_dance2.GIF',
    'assets/Kobo_help_down.GIF',
    'assets/Kobo_help_jump.GIF',
    'assets/Kobo_help_walk.GIF',
  ]

  ngOnInit(){
    const myCarouselElement = document.querySelector('#carousel')

    const carousel = new (window as any).bootstrap.Carousel(myCarouselElement, {
      interval: 2000,
      touch: false
    })
  }
}
