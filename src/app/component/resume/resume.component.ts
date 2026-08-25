import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import {
  CertificateLink,
  certificateLinks,
  certifications,
  education,
  portfolioProjects,
  profile,
  skills,
  workExperience,
} from "../../data/portfolio.data";

@Component({
  selector: "app-resume",
  imports: [RouterLink],
  templateUrl: "./resume.component.html",
  styleUrl: "./resume.component.scss",
})
export class ResumeComponent {
  private readonly modal = inject(NgbModal);

  readonly profile = profile;
  readonly skills = skills;
  readonly education = education;
  readonly certifications = certifications;
  readonly workExperience = workExperience;
  readonly projects = portfolioProjects;

  getCertificateLink(id: string): CertificateLink | undefined {
    return certificateLinks[id];
  }

  async downloadPDFModal(): Promise<void> {
    const { DownloadResumeComponent } = await import(
      "../../shared/modal/download-resume/download-resume.component"
    );
    const modalRef = this.modal.open(DownloadResumeComponent, {
      centered: true,
      size: "lg",
      windowClass: "resume-download-window",
      ariaLabelledBy: "download-resume-title",
    });

    await modalRef.result.catch(() => undefined);
  }
}