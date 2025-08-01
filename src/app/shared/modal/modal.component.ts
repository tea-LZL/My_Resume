import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  closeResult = '';
  pdfUrl: string | null | SafeUrl = null;
  @ViewChild('pdfModal', { static: true }) pdfModal!: TemplateRef<unknown>;

  constructor(private modalService: NgbModal,
    private sanitizer: DomSanitizer
  ) { }

  openPdfModal(pdfUrl: string) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('./assets/credentials/'+pdfUrl);
    this.modalService.open(this.pdfModal, { size: 'fullscreen' }).result.finally(() => {
      this.pdfUrl = null;
    });
  }
}
