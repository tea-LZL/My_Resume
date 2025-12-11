import { Component, ElementRef, QueryList, Renderer2, ViewChildren } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-download-resume',
  imports: [FormsModule],
  templateUrl: './download-resume.component.html',
  styleUrl: './download-resume.component.scss'
})
export class DownloadResumeComponent {
  @ViewChildren('transGrow') transGrowElems!: QueryList<ElementRef>;
  constructor(private activeModal: NgbActiveModal,
    private state: StateService,
    private renderer: Renderer2,
  ) { }
  bIncludeCredential: boolean = false;
  sTheme = "default";

  updateTheme(removeTheme: boolean = false) {
    const resumeContainer = document.querySelector('.resume-container');
    if (resumeContainer) {
      if (this.sTheme === 'alternate' && !removeTheme) {
        resumeContainer.classList.add('alternate-theme');
      } else {
        resumeContainer.classList.remove('alternate-theme');
      }
    }
  }

  public downloadPDF(): void {

    const data = document.querySelector('.resume-container') as HTMLElement;

    if (data) {
      this.state.LoadingOn();
      html2canvas(data, {
        scale: 2,
        onclone: (clonedDoc) => {
          const clonedData = clonedDoc.querySelector('.resume-container') as HTMLElement;
          if (clonedData) {
            clonedData.style.borderRadius = '0';
            clonedData.style.border = 'none';
            clonedData.style.boxShadow = 'none';
            clonedData.style.paddingBottom = '50px'

            if (this.sTheme === 'alternate') {
              clonedData.classList.add('alternate-theme');
            }

            // Allow container to expand to fit pushed content
            clonedData.style.overflow = 'visible';
            clonedData.style.height = 'auto';

            // Page Break Logic:
            // Push projects-section to the next page boundary using margin.
            const projectsSection = clonedData.querySelector('.projects-section') as HTMLElement;
            if (projectsSection) {
              const a4Ratio = 297 / 210;
              // Calculate effective page height in DOM pixels
              const pageHeight = clonedData.offsetWidth * a4Ratio;

              const containerRect = clonedData.getBoundingClientRect();
              const sectionRect = projectsSection.getBoundingClientRect();

              // Current distance from top of container
              const currentTop = sectionRect.top - containerRect.top;

              // Calculate which page we are on (0-indexed)
              // We want to start exactly on the NEXT page relative to where it naturally falls?
              // Or just ensure it starts at a page boundary.
              // If we want a forced break, we find the next boundary.

              const nextPageStart = (Math.floor(currentTop / pageHeight) + 1) * pageHeight;

              // How much to push down
              // Note: Use padding-top or margin-top. Margin is good but watch out for existing margins.
              // We add to the existing space.

              // Safe way: just set a large margin-top that bridges the gap.
              const neededShift = nextPageStart - currentTop;

              // Apply the shift. We assume existing margin is already accounted for in getBoundingClientRect
              const currentMarginTop = parseFloat(window.getComputedStyle(projectsSection).marginTop) || 0;
              const newMarginTop = currentMarginTop + neededShift + 30;

              // To avoid visual gltiches with margin collapse or precise pixels, we can subtracting a tiny bit or just exact.
              projectsSection.style.marginTop = `${newMarginTop}px`;
            }
            const sidebar = clonedData.querySelector('.sidebar') as HTMLElement;
            if (sidebar) {
              sidebar.style.height = '3950px';
            }
          }
        }
      }).then(async canvas => {
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Theme colors
        let bgR = 45;
        let bgG = 53;
        let bgB = 59;

        if (this.sTheme === 'alternate') {
          bgR = 255;
          bgG = 255;
          bgB = 255;
        }

        pdf.setFillColor(bgR, bgG, bgB);

        // Standard Auto-Slicing
        // Since we adjusted the layout in DOM to align with page heights,
        // we can just cut blindly at pageHeight intervals.

        let heightLeft = imgHeight;
        let position = 0;

        // Page 1
        pdf.rect(0, 0, imgWidth, pageHeight, 'F');
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.setFillColor(bgR, bgG, bgB);
          pdf.rect(0, 0, imgWidth, pageHeight, 'F');
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        if (this.bIncludeCredential) {
          const credentialFiles = [
            'assets/credentials/Credentials_ZhilongLiang_4664_AzureDatabaseAdministratorAssociate.pdf',
            'assets/credentials/Credentials_ZhilongLiang_4664_Azure_Developer_Associate.pdf',
            'assets/credentials/Credentials_ZhilongLiang_4664_DevOps_Engineer_Expert.pdf'
          ];

          try {
            // 1. Load generated resume PDF
            const resumePdfBytes = pdf.output('arraybuffer');
            const mergedPdf = await PDFDocument.create();
            const resumeDoc = await PDFDocument.load(resumePdfBytes);

            // Copy resume pages
            const copiedResumePages = await mergedPdf.copyPages(resumeDoc, resumeDoc.getPageIndices());
            copiedResumePages.forEach((page) => mergedPdf.addPage(page));

            // 2. Load and append credentials
            for (const file of credentialFiles) {
              try {
                const res = await fetch(file);
                if (res.ok) {
                  const fileBytes = await res.arrayBuffer();
                  const credDoc = await PDFDocument.load(fileBytes);
                  const copiedPages = await mergedPdf.copyPages(credDoc, credDoc.getPageIndices());
                  copiedPages.forEach((page) => mergedPdf.addPage(page));
                } else {
                  console.warn(`Could not load credential file: ${file}`);
                }
              } catch (e) {
                console.error(`Error processing credential file ${file}:`, e);
              }
            }

            // 3. Save and download
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Zhilong_Liang_Resume.pdf';
            link.click();
            window.URL.revokeObjectURL(link.href);

          } catch (err) {
            console.error('Error during PDF merge:', err);
            // Fallback to just saving the resume if merge fails
            pdf.save('Zhilong_Liang_Resume.pdf');
          }
          this.updateTheme(true);
          this.activeModal.close();
        } else {
          pdf.save('Zhilong_Liang_Resume.pdf');
          this.updateTheme(true);
          this.activeModal.close();
        }
      });
    }
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}
