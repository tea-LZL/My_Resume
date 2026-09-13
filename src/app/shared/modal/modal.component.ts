
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
  private revokeOnClose: (() => void) | null = null;

  openPdfModal(pdfFile: string): void {
    this.openPdfResource(`./assets/credentials/${pdfFile}`);
  }

  openPdfResource(url: string, revokeOnClose?: () => void): NgbModalRef {
    this.releasePdfResource();
    this.revokeOnClose = revokeOnClose ?? null;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    const modalRef = this.modalService.open(this.pdfModal, {
      size: 'fullscreen',
      windowClass: 'pdf-viewer-window',
      ariaLabelledBy: 'modal-pdf-title',
      keyboard: true,
    });

    modalRef.result.then(
      () => this.releasePdfResource(),
      () => this.releasePdfResource(),
    );

    return modalRef;
  }

  private releasePdfResource(): void {
    this.pdfUrl = null;
    this.revokeOnClose?.();
    this.revokeOnClose = null;
  }
}
