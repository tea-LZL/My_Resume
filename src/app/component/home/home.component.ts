import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from "../../shared/modal/modal.component";

@Component({
    selector: 'app-home',
    imports: [NgClass, ModalComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit{
  @ViewChildren('transGrow') transGrowElems!: QueryList<ElementRef>;
  @ViewChild('modalComp') modalComp!: ModalComponent;
  constructor(private renderer: Renderer2,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.transGrowElems.forEach(elem => {
        this.renderer.addClass(elem.nativeElement, 'grow');
      });
    }, 275);
  }
  arrCarouselImg = [
    'assets/Kobo_help_dance1.GIF',
    'assets/Kobo_help_dance2.GIF',
    'assets/Kobo_help_down.GIF',
    'assets/Kobo_help_jump.GIF',
    'assets/Kobo_help_walk.GIF',
  ]
    isImgLoaded = false;
  ngOnInit(){
    const myCarouselElement = document.querySelector('#carousel')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const carousel = new (window as any).bootstrap.Carousel(myCarouselElement, {
      interval: 2000,
      touch: false
    })
  }

  viewFile(string: string) {
    this.modalComp.openPdfModal(string);
  }
}
