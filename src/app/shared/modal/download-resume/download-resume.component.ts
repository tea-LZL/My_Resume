import {
  Component,
  ElementRef,
  QueryList,
  Renderer2,
  ViewChildren,
} from "@angular/core";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PDFDocument } from "pdf-lib";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { StateService } from "../../../services/state.service";

@Component({
  selector: "app-download-resume",
  imports: [FormsModule],
  templateUrl: "./download-resume.component.html",
  styleUrl: "./download-resume.component.scss",
})
export class DownloadResumeComponent {
  @ViewChildren("transGrow") transGrowElems!: QueryList<ElementRef>;
  constructor(
    private activeModal: NgbActiveModal,
    private state: StateService,
    private renderer: Renderer2,
  ) {}
  bIncludeCredential: boolean = false;
  sTheme = "default";

  private getThemeColors() {
    if (this.sTheme === "alternate") {
      return {
        // Light/White theme
        background: [255, 255, 255] as [number, number, number],
        bgLight: [248, 249, 250] as [number, number, number],
        headerBg: [255, 255, 255] as [number, number, number],
        sidebarBg: [248, 249, 250] as [number, number, number],
        text: [33, 37, 41] as [number, number, number],
        textLight: [108, 117, 125] as [number, number, number],
        name: [13, 110, 253] as [number, number, number], // Blue
        title: [108, 117, 125] as [number, number, number],
        contact: [13, 110, 253] as [number, number, number],
        sectionTitle: [13, 110, 253] as [number, number, number],
        accent: [13, 110, 253] as [number, number, number],
        skillBg: [233, 236, 239] as [number, number, number],
        divider: [222, 226, 230] as [number, number, number],
        projectBg: [248, 249, 250] as [number, number, number],
        border: [222, 226, 230] as [number, number, number],
      };
    } else {
      return {
        // Everforest dark theme
        background: [45, 53, 59] as [number, number, number], // $everforest-bg
        bgLight: [52, 63, 68] as [number, number, number], // $everforest-bg-light
        headerBg: [35, 42, 46] as [number, number, number], // $everforest-bg-dim
        sidebarBg: [52, 63, 68] as [number, number, number], // $everforest-bg-light
        text: [211, 198, 170] as [number, number, number], // $everforest-fg
        textLight: [157, 169, 160] as [number, number, number], // $everforest-grey2
        name: [167, 192, 128] as [number, number, number], // $everforest-green
        title: [131, 192, 146] as [number, number, number], // $everforest-aqua
        contact: [127, 187, 179] as [number, number, number], // $everforest-blue
        sectionTitle: [219, 188, 127] as [number, number, number], // $everforest-yellow
        accent: [167, 192, 128] as [number, number, number], // $everforest-green
        skillBg: [35, 42, 46] as [number, number, number], // $everforest-bg-dim
        divider: [122, 132, 120] as [number, number, number], // $everforest-grey0
        projectBg: [52, 63, 68] as [number, number, number], // $everforest-bg-light
        border: [122, 132, 120] as [number, number, number], // $everforest-grey0
      };
    }
  }

  public async downloadPDF(): Promise<void> {
    this.state.LoadingOn();

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const colors = this.getThemeColors();
      const pageWidth = 210;
      const pageHeight = 297;
      const sidebarWidth = 63.5; // ~300px of 1000px = 30% of page
      let currentPage = 1;

      // Helper function to check and add new page
      const checkNewPage = (yPos: number, requiredSpace: number = 15) => {
        if (yPos + requiredSpace > pageHeight - 15) {
          pdf.addPage();
          currentPage++;
          // Redraw backgrounds for new page
          pdf.setFillColor(...colors.background);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");

          // Redraw sidebar background
          pdf.setFillColor(...colors.sidebarBg);
          pdf.rect(0, 0, sidebarWidth, pageHeight, "F");

          // Redraw sidebar border
          pdf.setDrawColor(...colors.border);
          pdf.setLineWidth(0.3);
          pdf.line(sidebarWidth, 0, sidebarWidth, pageHeight);

          return 15; // Reset to top margin
        }
        return yPos;
      };

      // PAGE BACKGROUND
      pdf.setFillColor(...colors.background);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // HEADER SECTION
      const headerHeight = 55;
      pdf.setFillColor(...colors.headerBg);
      pdf.rect(0, 0, pageWidth, headerHeight, "F");

      let yPos = 15;

      // Name
      pdf.setFontSize(32);
      pdf.setTextColor(...colors.name);
      pdf.setFont("helvetica", "bold");
      pdf.text("Zhilong Liang", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      // Title
      pdf.setFontSize(12);
      pdf.setTextColor(...colors.title);
      pdf.setFont("helvetica", "normal");
      pdf.text("SOFTWARE ENGINEER", pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      // Summary
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text);
      const summary =
        "Innovative and detail-oriented Software Engineer with 3+ years of experience in building scalable web applications, backend API integrations and Database Management. Proficient in modern JavaScript frameworks and cloud-native architectures.";
      const summaryLines = pdf.splitTextToSize(summary, 150);
      summaryLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, yPos, { align: "center" });
        yPos += 4;
      });
      yPos += 2;

      // Contact info
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.contact);
      const contacts =
        "zhilong.k.liang@gmail.com  •  +27 82-732-6878  •  Pretoria, ZA";
      pdf.text(contacts, pageWidth / 2, yPos, { align: "center" });
      yPos += 3.5;
      const contacts2 =
        "linkedin.com/in/zhilong-liang  •  https://zhilong-liang-resume.vercel.app";
      pdf.text(contacts2, pageWidth / 2, yPos, { align: "center" });
      yPos += 1;

      // Header border
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.3);
      pdf.line(0, headerHeight, pageWidth, headerHeight);

      // BODY LAYOUT - Two columns
      const bodyStartY = headerHeight + 10;

      // SIDEBAR BACKGROUND (left column)
      pdf.setFillColor(...colors.sidebarBg);
      pdf.rect(0, headerHeight, sidebarWidth, pageHeight - headerHeight, "F");

      // Sidebar border
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.3);
      pdf.line(sidebarWidth, headerHeight, sidebarWidth, pageHeight);

      let sidebarY = bodyStartY;
      const sidebarX = 8;
      const sidebarContentWidth = sidebarWidth - 16;

      // SIDEBAR CONTENT

      // Skills Section
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.sectionTitle);
      pdf.setFont("helvetica", "bold");
      pdf.text("SKILLS", sidebarX, sidebarY);

      // Section underline
      pdf.setDrawColor(...colors.divider);
      pdf.setLineWidth(0.5);
      pdf.line(
        sidebarX,
        sidebarY + 1,
        sidebarX + sidebarContentWidth,
        sidebarY + 1,
      );
      sidebarY += 7;

      pdf.setFontSize(7.5);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "normal");
      const skills = [
        "JavaScript (ES6+)",
        "TypeScript",
        "Angular",
        "Laravel",
        "Node.js",
        "HTML5 & SCSS",
        "Azure",
        "Docker",
        "Git",
        "SQL Server",
        "SQLite",
        "C#",
        ".NET",
        "Golang",
      ];

      // Draw skill tags in a grid-like layout
      let skillX = sidebarX;
      let skillY = sidebarY;
      const rowHeight = 8;
      const tagGap = 2;
      const tagHPadding = 3.2; // Horizontal padding on each side
      const tagVPadding = 1; // Vertical padding top/bottom (increased by ~0.7mm)
      const tagHeight = 4;

      skills.forEach((skill) => {
        const textWidth = pdf.getTextWidth(skill);
        const tagWidth = textWidth + tagHPadding * 2;

        // Check if we need to wrap to next line
        if (skillX + tagWidth > sidebarX + sidebarContentWidth) {
          skillX = sidebarX;
          skillY += rowHeight;
        }

        // Draw skill tag background
        pdf.setFillColor(...colors.skillBg);
        pdf.roundedRect(
          skillX,
          skillY - tagHeight / 2 - tagVPadding,
          tagWidth,
          tagHeight + tagVPadding * 2,
          1,
          1,
          "F",
        );

        // Draw skill tag border
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(0.1);
        pdf.roundedRect(
          skillX,
          skillY - tagHeight / 2 - tagVPadding,
          tagWidth,
          tagHeight + tagVPadding * 2,
          1,
          1,
          "S",
        );

        // Draw skill text (centered horizontally and vertically in the tag)
        pdf.setTextColor(...colors.text);
        pdf.text(skill, skillX + tagHPadding, skillY + 1);

        skillX += tagWidth + tagGap;
      });
      sidebarY = skillY + 9;

      // Education Section
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.sectionTitle);
      pdf.setFont("helvetica", "bold");
      pdf.text("EDUCATION", sidebarX, sidebarY);
      pdf.setDrawColor(...colors.divider);
      pdf.setLineWidth(0.5);
      pdf.line(
        sidebarX,
        sidebarY + 1,
        sidebarX + sidebarContentWidth,
        sidebarY + 1,
      );
      sidebarY += 7;

      pdf.setFontSize(8.5);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      const eduLines = pdf.splitTextToSize(
        "Information Technology: System Development",
        sidebarContentWidth,
      );
      eduLines.forEach((line: string) => {
        pdf.text(line, sidebarX, sidebarY);
        sidebarY += 3.5;
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.text("CTU Training Solution", sidebarX, sidebarY);
      sidebarY += 3.5;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7.5);
      pdf.text("2019 - 2023", sidebarX, sidebarY);
      sidebarY += 9;

      // Certificates Section
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.sectionTitle);
      pdf.setFont("helvetica", "bold");
      pdf.text("CERTIFICATES", sidebarX, sidebarY);
      pdf.setDrawColor(...colors.divider);
      pdf.setLineWidth(0.5);
      pdf.line(
        sidebarX,
        sidebarY + 1,
        sidebarX + sidebarContentWidth,
        sidebarY + 1,
      );
      sidebarY += 7;

      const certs = [
        {
          name: "Microsoft Certified: Azure Developer Associate",
          year: "2021",
        },
        {
          name: "Microsoft Certified: Azure Database Administrator Associate",
          year: "2022",
        },
        { name: "Microsoft Certified: DevOps Engineer Expert", year: "2021" },
      ];

      pdf.setFontSize(8);
      certs.forEach((cert) => {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        const certLines = pdf.splitTextToSize(cert.name, sidebarContentWidth);
        certLines.forEach((line: string) => {
          pdf.text(line, sidebarX, sidebarY);
          sidebarY += 3.2;
        });
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(7.5);
        pdf.setTextColor(...colors.textLight);
        pdf.text(cert.year, sidebarX, sidebarY);
        sidebarY += 7;
        pdf.setFontSize(8);
      });

      // Languages Section
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.sectionTitle);
      pdf.setFont("helvetica", "bold");
      pdf.text("LANGUAGES", sidebarX, sidebarY);
      pdf.setDrawColor(...colors.divider);
      pdf.setLineWidth(0.5);
      pdf.line(
        sidebarX,
        sidebarY + 1,
        sidebarX + sidebarContentWidth,
        sidebarY + 1,
      );
      sidebarY += 7;

      pdf.setFontSize(8.5);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "normal");
      const languages = [
        { name: "English", dots: 5 },
        { name: "Mandarin", dots: 5 },
        { name: "Afrikaans", dots: 2 },
      ];

      languages.forEach((lang) => {
        pdf.text(lang.name, sidebarX, sidebarY);

        // Draw dots (stars)
        let dotX = sidebarX + sidebarContentWidth - 20;
        const dotY = sidebarY - 1.5;
        const dotRadius = 0.8;
        const dotGap = 2;

        for (let i = 0; i < 5; i++) {
          if (i < lang.dots) {
            // Filled dot
            pdf.setFillColor(...colors.accent);
            pdf.setDrawColor(...colors.accent);
            pdf.circle(dotX, dotY, dotRadius, "FD");
          } else {
            // Empty dot
            pdf.setFillColor(...colors.skillBg);
            pdf.setDrawColor(...colors.border);
            pdf.circle(dotX, dotY, dotRadius, "FD");
          }
          dotX += dotGap + dotRadius;
        }

        sidebarY += 5;
      });

      // MAIN CONTENT (right column)
      const mainX = sidebarWidth + 10;
      const mainWidth = pageWidth - sidebarWidth - 15;
      let mainY = bodyStartY;

      // Experience Section
      pdf.setFontSize(13);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("EXPERIENCE", mainX, mainY);

      // Accent underline
      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(0.8);
      pdf.line(mainX, mainY + 1.5, mainX + 13, mainY + 1.5);
      mainY += 9;

      // Job 1
      pdf.setFontSize(11);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("Software Engineer", mainX + 3, mainY);
      mainY += 5;

      pdf.setFontSize(9);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      pdf.text("Automate - Volaris group", mainX + 3, mainY);

      // Job date badge
      pdf.setFillColor(...colors.accent);
      pdf.roundedRect(mainX + mainWidth - 25, mainY - 3.5, 25, 4.5, 1, 1, "F");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...colors.background);
      pdf.setFont("helvetica", "bold");
      pdf.text("2024 - Present", mainX + mainWidth - 12.5, mainY - 0.5, {
        align: "center",
      });
      mainY += 5;

      // Left border accent
      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(0.8);
      pdf.line(mainX, mainY - 10, mainX, mainY + 25);

      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      const job1Achievements = [
        "Spearheaded 4 rewrite projects for legacy customer portal from AngularJS to Angular 19, resulting in a more responsive design and closing security vulnerabilities.",
        "Architected and deployed a full stack application using Angular 20, .NET 8 backend API with SQL Server database.",
        "Participated in rewrite of a MVC legacy membership system to Angular 20 based, .NET Core API. Implementing Indexing techniques and caching strategies to improve performance and reduced load times up to 70%.",
        "Mentored junior developers, conducting code reviews and managed CI/CD pipelines and IIS Server configuration.",
      ];

      job1Achievements.forEach((achievement) => {
        const lines = pdf.splitTextToSize(`• ${achievement}`, mainWidth - 5);
        lines.forEach((line: string) => {
          mainY = checkNewPage(mainY, 4);
          pdf.text(line, mainX + 3, mainY);
          mainY += 3.5;
        });
        mainY += 1;
      });
      mainY += 5;

      // Job 2
      mainY = checkNewPage(mainY, 30);

      pdf.setFontSize(11);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      const job2TitleLines = pdf.splitTextToSize(
        "Associate Software Application Development Engineer",
        mainWidth - 30,
      );
      job2TitleLines.forEach((line: string) => {
        pdf.text(line, mainX + 3, mainY);
        mainY += 4.5;
      });
      mainY += 1;

      pdf.setFontSize(9);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      pdf.text("Britehouse Automotive - Dimension Data", mainX + 3, mainY);

      // Job date badge
      pdf.setFillColor(...colors.accent);
      pdf.roundedRect(mainX + mainWidth - 25, mainY - 3.5, 25, 4.5, 1, 1, "F");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...colors.background);
      pdf.setFont("helvetica", "bold");
      pdf.text("2022 - 2024", mainX + mainWidth - 12.5, mainY - 0.5, {
        align: "center",
      });
      mainY += 5;

      // Left border accent
      const job2StartY = mainY;
      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(0.8);

      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      const job2Achievements = [
        "Developed high-performance, feature-rich internal management websites for South Africa's largest Automotive Manufacturer's dealerships using HTML, SCSS, Angular and .NET Core API.",
        "Collaborated closely with Quality Assurance team to ensure robust and reliable implementation of features.",
        "Optimized database queries and API response times for high-traffic campaigns.",
      ];

      const job2ContentStartY = mainY;
      job2Achievements.forEach((achievement) => {
        const lines = pdf.splitTextToSize(`• ${achievement}`, mainWidth - 5);
        lines.forEach((line: string) => {
          mainY = checkNewPage(mainY, 4);
          pdf.text(line, mainX + 3, mainY);
          mainY += 3.5;
        });
        mainY += 1;
      });

      // Draw left border for job 2
      pdf.line(mainX, job2StartY - 10, mainX, mainY - 2);
      mainY += 7;

      // Projects Section
      mainY = checkNewPage(mainY, 30);

      pdf.setFontSize(13);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text("PERSONAL PROJECTS", mainX, mainY);

      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(0.8);
      pdf.line(mainX, mainY + 1.5, mainX + 13, mainY + 1.5);
      mainY += 9;

      // Project 1
      mainY = checkNewPage(mainY, 25);

      const proj1TopPadding = 6;
      const proj1BottomPadding = 4.6; // Reduced by ~1.4mm (4px)
      const proj1ContentStart = mainY + proj1TopPadding;
      let proj1ContentY = proj1ContentStart;

      pdf.setFontSize(10);
      const projectColor =
        this.sTheme === "alternate"
          ? colors.sectionTitle
          : ([219, 188, 127] as [number, number, number]);
      pdf.setTextColor(...projectColor);
      pdf.setFont("helvetica", "bold");

      const proj1TitleY = proj1ContentY;

      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      const proj1Desc =
        "An API for weathering with Go, fetching weather of locations from around the world. Written in Go with Gin framework and using the OpenWeatherMap API.";
      const proj1Lines = pdf.splitTextToSize(proj1Desc, mainWidth - 12);
      const proj1DescHeight = proj1Lines.length * 3.5;

      // Calculate total card height
      const proj1Height =
        proj1TopPadding + 5 + proj1DescHeight + proj1BottomPadding;

      // Draw project card background
      pdf.setFillColor(...colors.projectBg);
      pdf.roundedRect(mainX, mainY, mainWidth, proj1Height, 2, 2, "F");

      // Draw project card border
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(mainX, mainY, mainWidth, proj1Height, 2, 2, "S");

      // Draw title
      pdf.setFontSize(10);
      pdf.setTextColor(...projectColor);
      pdf.setFont("helvetica", "bold");
      pdf.text("Weathering with Go API", mainX + 6, proj1TitleY);
      proj1ContentY += 5;

      // Draw description
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      proj1Lines.forEach((line: string) => {
        pdf.text(line, mainX + 6, proj1ContentY);
        proj1ContentY += 3.5;
      });

      mainY += proj1Height + 6;

      // Project 2
      mainY = checkNewPage(mainY, 25);

      const proj2TopPadding = 6;
      const proj2BottomPadding = 4.6; // Reduced by ~1.4mm (4px)
      const proj2ContentStart = mainY + proj2TopPadding;
      let proj2ContentY = proj2ContentStart;

      const proj2TitleY = proj2ContentY;

      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      const proj2Desc =
        "A web application for my resume, built with Angular to display my resume in a modern and responsive way. Option to download resume and Microsoft Certificate.";
      const proj2Lines = pdf.splitTextToSize(proj2Desc, mainWidth - 12);
      const proj2DescHeight = proj2Lines.length * 3.5;

      // Calculate total card height
      const proj2Height =
        proj2TopPadding + 5 + proj2DescHeight + proj2BottomPadding;

      // Draw project card background
      pdf.setFillColor(...colors.projectBg);
      pdf.roundedRect(mainX, mainY, mainWidth, proj2Height, 2, 2, "F");

      // Draw project card border
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(mainX, mainY, mainWidth, proj2Height, 2, 2, "S");

      // Draw title
      pdf.setFontSize(10);
      const project2Color =
        this.sTheme === "alternate"
          ? colors.sectionTitle
          : ([219, 188, 127] as [number, number, number]);
      pdf.setTextColor(...project2Color);
      pdf.setFont("helvetica", "bold");
      pdf.text("My Resume Website", mainX + 6, proj2TitleY);
      proj2ContentY += 5;

      // Draw description
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.setFont("helvetica", "normal");
      proj2Lines.forEach((line: string) => {
        pdf.text(line, mainX + 6, proj2ContentY);
        proj2ContentY += 3.5;
      });

      // Handle certificate merging
      if (this.bIncludeCredential) {
        await this.mergeCertificates(pdf);
      } else {
        pdf.save("Zhilong_Liang_Resume.pdf");
      }

      this.state.LoadingOff(this.renderer, this.transGrowElems);
      this.activeModal.close();
    } catch (error) {
      console.error("Error generating PDF:", error);
      this.state.LoadingOff(this.renderer, this.transGrowElems);
      alert("An error occurred while generating the PDF. Please try again.");
    }
  }

  private async mergeCertificates(pdf: jsPDF): Promise<void> {
    const credentialFiles = [
      "assets/credentials/Credentials_ZhilongLiang_4664_AzureDatabaseAdministratorAssociate.pdf",
      "assets/credentials/Credentials_ZhilongLiang_4664_Azure_Developer_Associate.pdf",
      "assets/credentials/Credentials_ZhilongLiang_4664_DevOps_Engineer_Expert.pdf",
    ];

    try {
      const resumePdfBytes = pdf.output("arraybuffer");
      const mergedPdf = await PDFDocument.create();
      const resumeDoc = await PDFDocument.load(resumePdfBytes);

      const copiedResumePages = await mergedPdf.copyPages(
        resumeDoc,
        resumeDoc.getPageIndices(),
      );
      copiedResumePages.forEach((page) => mergedPdf.addPage(page));

      for (const file of credentialFiles) {
        try {
          const res = await fetch(file);
          if (res.ok) {
            const fileBytes = await res.arrayBuffer();
            const credDoc = await PDFDocument.load(fileBytes);
            const copiedPages = await mergedPdf.copyPages(
              credDoc,
              credDoc.getPageIndices(),
            );
            copiedPages.forEach((page) => mergedPdf.addPage(page));
          } else {
            console.warn(`Could not load credential file: ${file}`);
          }
        } catch (e) {
          console.error(`Error processing credential file ${file}:`, e);
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "Zhilong_Liang_Resume.pdf";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Error during PDF merge:", err);
      pdf.save("Zhilong_Liang_Resume.pdf");
    }
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}
