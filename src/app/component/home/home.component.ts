import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
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
  imgLoadStatus: boolean[] = [];
  constructor(private renderer: Renderer2
  ) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.transGrowElems.forEach(elem => {
        this.renderer.addClass(elem.nativeElement, 'grow');
      });
      const loadingEl = document.getElementById('app-loading');
      if (loadingEl) {
        loadingEl.classList.add('fade-out');
        setTimeout(() => loadingEl.remove(), 500);
      }
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
    this.imgLoadStatus = this.arrCarouselImg.map(() => false);
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
