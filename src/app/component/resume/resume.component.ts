import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('transGrow') transGrowElems!: QueryList<ElementRef>;
  @ViewChild('modalComp') modalComp!: ModalComponent;
  @ViewChild('downloadBtn') downloadBtn!: ElementRef;

  private lastMouseY = 0;
  private isMouseTracked = false;
  private mouseListener!: () => void;
  private scrollListener!: () => void;

  constructor(private renderer: Renderer2,
    private modal: NgbModal,
    private state: StateService
  ) {
  }

  ngAfterViewInit(): void {
    this.state.LoadingOff(this.renderer, this.transGrowElems);

    this.mouseListener = this.renderer.listen('window', 'mousemove', (e: MouseEvent) => {
      this.isMouseTracked = true;
      this.lastMouseY = e.clientY;
      this.updateButtonPosition();
    });

    this.scrollListener = this.renderer.listen('window', 'scroll', () => {
      if (this.isMouseTracked) {
        this.updateButtonPosition();
      }
    });
  }

  private updateButtonPosition(): void {
    if (window.innerWidth <= 1250) return; // Disable on mobile where it's fixed

    const wrapper = document.querySelector('.resume-wrapper');
    if (wrapper && this.downloadBtn) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const relY = this.lastMouseY - wrapperRect.top;

      // Center the button on the mouse cursor
      // Button is 60px height => -30px offset
      const targetY = relY - 30;

      this.renderer.setStyle(this.downloadBtn.nativeElement, 'top', `${targetY}px`);
    }
  }

  async downloadPDFModal() {
    const { DownloadResumeComponent } = await import('../../shared/modal/download-resume/download-resume.component');
    const modalRef = this.modal.open(DownloadResumeComponent, { centered: true, size: 'md' });
    modalRef.result.then(() => {
      this.state.LoadingOff(this.renderer, this.transGrowElems);
    });
  }

  ngOnDestroy(): void {
    if (this.mouseListener) this.mouseListener();
    if (this.scrollListener) this.scrollListener();
  }
}
