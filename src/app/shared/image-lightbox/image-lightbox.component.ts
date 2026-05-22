
import { Component, TemplateRef, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-image-lightbox",
  imports: [],
  templateUrl: "./image-lightbox.component.html",
  styleUrl: "./image-lightbox.component.scss",
})
export class ImageLightboxComponent {
  imageUrl: SafeUrl | null = null;

  @ViewChild("imageModal", { static: true })
  imageModal!: TemplateRef<unknown>;

  constructor(
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
  ) {}

  openImageModal(imageUrl: string) {
    this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl);
    this.modalService.open(this.imageModal, {
      size: "fullscreen",
      windowClass: "image-lightbox-window",
      backdrop: true,
      keyboard: true,
    });
  }
}
