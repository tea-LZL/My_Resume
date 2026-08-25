import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import jsPDF from "jspdf";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PDFDocument } from "pdf-lib";

import {
  createResumePdf,
  getResumeCredentialFiles,
  resolveResumePdfTheme,
  type ResumePdfThemeName,
} from "./resume-pdf";

@Component({
  selector: "app-download-resume",
  imports: [FormsModule],
  templateUrl: "./download-resume.component.html",
  styleUrl: "./download-resume.component.scss",
})
export class DownloadResumeComponent {
  private readonly activeModal = inject(NgbActiveModal);

  bIncludeCredential = false;
  sTheme: ResumePdfThemeName = resolveResumePdfTheme();
  isGenerating = false;
  generationError: string | null = null;

  async downloadPDF(): Promise<void> {
    if (this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.generationError = null;

    try {
      const pdf = createResumePdf(this.sTheme);

      if (this.bIncludeCredential) {
        await this.saveWithCredentials(pdf);
      } else {
        pdf.save("Zhilong_Liang_Resume.pdf");
      }

      this.activeModal.close();
    } catch (error) {
      console.error("Error generating resume PDF:", error);
      this.generationError = "The PDF could not be generated. Please try again.";
    } finally {
      this.isGenerating = false;
    }
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  private async saveWithCredentials(pdf: jsPDF): Promise<void> {
    try {
      const resumePdfBytes = pdf.output("arraybuffer");
      const mergedPdf = await PDFDocument.create();
      const resumeDocument = await PDFDocument.load(resumePdfBytes);
      const resumePages = await mergedPdf.copyPages(
        resumeDocument,
        resumeDocument.getPageIndices(),
      );
      resumePages.forEach((page) => mergedPdf.addPage(page));

      for (const credentialFile of getResumeCredentialFiles()) {
        const response = await fetch(`assets/credentials/${credentialFile}`);

        if (!response.ok) {
          console.warn(`Could not load credential file: ${credentialFile}`);
          continue;
        }

        const credentialDocument = await PDFDocument.load(await response.arrayBuffer());
        const credentialPages = await mergedPdf.copyPages(
          credentialDocument,
          credentialDocument.getPageIndices(),
        );
        credentialPages.forEach((page) => mergedPdf.addPage(page));
      }

      const bytes = await mergedPdf.save();
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "Zhilong_Liang_Resume.pdf";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      console.warn("Unable to append credentials; downloading the resume only.", error);
      pdf.save("Zhilong_Liang_Resume.pdf");
    }
  }
}
