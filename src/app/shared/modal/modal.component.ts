
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  closeResult = '';
  pdfUrl: string | null | SafeUrl = null;
  @ViewChild('pdfModal', { static: true }) pdfModal!: TemplateRef<unknown>;

  private readonly modalService = inject(NgbModal);
  private readonly sanitizer = inject(DomSanitizer);

  openPdfModal(pdfUrl: string): void {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/credentials/${pdfUrl}`);
    this.modalService.open(this.pdfModal, {
      size: 'fullscreen',
      windowClass: 'pdf-viewer-window',
      ariaLabelledBy: 'modal-pdf-title',
    }).result.then(
      () => (this.pdfUrl = null),
      () => (this.pdfUrl = null),
    );
  }
}
