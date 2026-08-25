
import { Component, TemplateRef, ViewChild, inject } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-image-lightbox",
  imports: [],
  templateUrl: "./image-lightbox.component.html",
  styleUrl: "./image-lightbox.component.scss",
})
export class ImageLightboxComponent {
  imageUrl: string | null = null;
  imageAlt = "Project artwork";

  private readonly modalService = inject(NgbModal);
  private modalRef?: NgbModalRef;

  @ViewChild("imageModal", { static: true })
  imageModal!: TemplateRef<unknown>;

  openImageModal(imageUrl: string, imageAlt = "Project artwork"): void {
    this.imageUrl = imageUrl;
    this.imageAlt = imageAlt;
    this.modalRef = this.modalService.open(this.imageModal, {
      size: "fullscreen",
      windowClass: "image-lightbox-window",
      backdrop: true,
      keyboard: true,
      ariaLabelledBy: "lightbox-title",
    });
  }

  close(modal?: NgbModalRef): void {
    (modal ?? this.modalRef)?.dismiss("close");
  }
}
