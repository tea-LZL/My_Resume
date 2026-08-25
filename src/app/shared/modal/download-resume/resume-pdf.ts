import jsPDF from "jspdf";

import {
  certificateLinks,
  certifications,
  education,
  portfolioProjects,
  profile,
  skills,
  workExperience,
} from "../../../data/portfolio.data";
import type { Project } from "../../../interfaces/project";

type Rgb = [number, number, number];
type WorkEntry = (typeof workExperience)[number];
type EducationEntry = (typeof education)[number];
type CertificationEntry = (typeof certifications)[number];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const PAGE_MARGIN = 14;
const PAGE_BOTTOM = 278;
const FOOTER_Y = 287;
const FIRST_PAGE_MAIN_WIDTH = 120;
const FULL_CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const SIDEBAR_X = 145;
const SIDEBAR_WIDTH = 51;

export type ResumePdfThemeName = "dark" | "light";

export interface ResumePdfTheme {
  readonly background: Rgb;
  readonly surface: Rgb;
  readonly surfaceRaised: Rgb;
  readonly foreground: Rgb;
  readonly muted: Rgb;
  readonly accent: Rgb;
  readonly accentSoft: Rgb;
  readonly line: Rgb;
}

export type ResumeProjectInput = Pick<
  Project,
  "title" | "summary" | "repositoryUrl" | "repositoryLabel"
>;

export const resumePdfThemes: Readonly<Record<ResumePdfThemeName, ResumePdfTheme>> =
  Object.freeze({
    dark: {
      background: [16, 19, 18],
      surface: [29, 37, 33],
      surfaceRaised: [38, 49, 41],
      foreground: [240, 237, 228],
      muted: [182, 192, 184],
      accent: [181, 204, 138],
      accentSoft: [143, 196, 163],
      line: [60, 72, 66],
    },
    light: {
      background: [245, 242, 233],
      surface: [235, 231, 218],
      surfaceRaised: [255, 255, 255],
      foreground: [27, 33, 30],
      muted: [95, 108, 100],
      accent: [82, 115, 63],
      accentSoft: [47, 120, 96],
      line: [190, 192, 180],
    },
  });

export const buildResumeProjectInputs = (): readonly ResumeProjectInput[] =>
  portfolioProjects.map(
    ({ title, summary, repositoryUrl, repositoryLabel }) => ({
      title,
      summary,
      repositoryUrl,
      repositoryLabel,
    }),
  );

export const getResumeCredentialFiles = (): readonly string[] =>
  certifications.flatMap(({ id }) => {
    const credential = certificateLinks[id];
    return credential ? [credential.pdfFile] : [];
  });

export function resolveResumePdfTheme(): ResumePdfThemeName {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.getAttribute("data-bs-theme") === "light"
    ? "light"
    : "dark";
}

interface FlowCursor {
  readonly x: number;
  readonly width: number;
  readonly y: number;
}

function splitText(pdf: jsPDF, text: string, width: number): string[] {
  return pdf.splitTextToSize(text, width) as string[];
}

function drawLines(
  pdf: jsPDF,
  lines: readonly string[],
  x: number,
  y: number,
  lineHeight: number,
): number {
  lines.forEach((line) => {
    pdf.text(line, x, y);
    y += lineHeight;
  });

  return y;
}

function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function drawPageBase(pdf: jsPDF, theme: ResumePdfTheme): void {
  pdf.setFillColor(...theme.background);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  pdf.setFillColor(...theme.accent);
  pdf.rect(0, 0, PAGE_WIDTH, 3, "F");

  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.25);
  pdf.line(PAGE_MARGIN, FOOTER_Y - 4, PAGE_WIDTH - PAGE_MARGIN, FOOTER_Y - 4);
}

function drawFirstPageHeader(pdf: jsPDF, theme: ResumePdfTheme): number {
  drawPageBase(pdf, theme);

  let y = 14;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...theme.accent);
  pdf.text("RESUME / SELECTED DETAILS", PAGE_MARGIN, y);

  y += 16;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(29);
  pdf.setTextColor(...theme.foreground);
  pdf.text(profile.name, PAGE_MARGIN, y);

  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11.5);
  pdf.setTextColor(...theme.muted);
  pdf.text(profile.title.toUpperCase(), PAGE_MARGIN, y);

  y += 7;
  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);

  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.2);
  pdf.setTextColor(...theme.foreground);
  y = drawLines(pdf, splitText(pdf, profile.summary, 142), PAGE_MARGIN, y, 4.5);

  y += 3;
  pdf.setFontSize(7.4);
  pdf.setTextColor(...theme.accentSoft);
  pdf.text(
    `${profile.contact.email}  /  ${profile.contact.phone}  /  ${profile.contact.location}`,
    PAGE_MARGIN,
    y,
  );

  y += 4.5;
  pdf.setTextColor(...theme.muted);
  pdf.text(
    `${shortUrl(profile.contact.linkedinUrl)}  /  ${shortUrl(profile.contact.githubUrl)}  /  ${shortUrl(profile.contact.websiteUrl)}`,
    PAGE_MARGIN,
    y,
  );

  y += 6;
  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);

  return y + 9;
}

function startContinuationPage(pdf: jsPDF, theme: ResumePdfTheme): FlowCursor {
  pdf.addPage();
  drawPageBase(pdf, theme);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...theme.accent);
  pdf.text("RESUME / CONTINUED", PAGE_MARGIN, 15);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...theme.muted);
  pdf.text(profile.name, PAGE_WIDTH - PAGE_MARGIN, 15, { align: "right" });

  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE_MARGIN, 21, PAGE_WIDTH - PAGE_MARGIN, 21);

  return { x: PAGE_MARGIN, width: FULL_CONTENT_WIDTH, y: 34 };
}

function ensureFlowSpace(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  flow: FlowCursor,
  requiredHeight: number,
): { readonly flow: FlowCursor; readonly didAddPage: boolean } {
  if (flow.y + requiredHeight <= PAGE_BOTTOM) {
    return { flow, didAddPage: false };
  }

  return { flow: startContinuationPage(pdf, theme), didAddPage: true };
}

function drawSectionHeading(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  index: string,
  label: string,
  headline: string,
  x: number,
  y: number,
  width: number,
): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.2);
  pdf.setTextColor(...theme.accent);
  pdf.text(`${index} / ${label.toUpperCase()}`, x, y);

  y += 10;
  pdf.setFontSize(18);
  pdf.setTextColor(...theme.foreground);
  y = drawLines(pdf, splitText(pdf, headline, width), x, y, 7.2);

  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.3);
  pdf.line(x, y + 1, x + width, y + 1);

  return y + 9;
}

function drawSidebarHeading(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  label: string,
  title: string,
  x: number,
  y: number,
  width: number,
): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.3);
  pdf.setTextColor(...theme.accent);
  pdf.text(label.toUpperCase(), x, y);

  y += 6.5;
  pdf.setFontSize(11.5);
  pdf.setTextColor(...theme.foreground);
  pdf.text(title, x, y);

  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.25);
  pdf.line(x, y + 3, x + width, y + 3);

  return y + 9;
}

function drawSkillTags(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  x: number,
  y: number,
  width: number,
): number {
  const tagHeight = 5.2;
  const tagGap = 1.1;
  const horizontalPadding = 2.2;
  const rightEdge = x + width;
  let cursorX = x;
  let baselineY = y + 3.3;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.1);

  skills.forEach((skill) => {
    const tagWidth = pdf.getTextWidth(skill) + horizontalPadding * 2;

    if (cursorX + tagWidth > rightEdge && cursorX !== x) {
      cursorX = x;
      baselineY += tagHeight + tagGap;
    }

    pdf.setFillColor(...theme.surfaceRaised);
    pdf.setDrawColor(...theme.line);
    pdf.setLineWidth(0.15);
    pdf.roundedRect(cursorX, baselineY - 3.8, tagWidth, tagHeight, 0.75, 0.75, "FD");

    pdf.setTextColor(...theme.muted);
    pdf.text(skill, cursorX + horizontalPadding, baselineY);
    cursorX += tagWidth + tagGap;
  });

  return baselineY + 7;
}

function drawEducationEntry(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  entry: EducationEntry,
  x: number,
  y: number,
  width: number,
): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.2);
  pdf.setTextColor(...theme.foreground);
  y = drawLines(pdf, splitText(pdf, entry.qualification, width), x, y, 3.4);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.4);
  pdf.setTextColor(...theme.muted);
  y = drawLines(pdf, splitText(pdf, entry.institution, width), x, y + 1.2, 3.1);
  pdf.text(entry.dates, x, y + 0.9);

  return y + 6;
}

function drawCertificationEntry(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  entry: CertificationEntry,
  x: number,
  y: number,
  width: number,
): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(...theme.foreground);
  y = drawLines(pdf, splitText(pdf, entry.name, width), x, y, 3.1);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.2);
  pdf.setTextColor(...theme.muted);
  pdf.text(entry.year, x, y + 0.8);

  return y + 5.4;
}

function drawSidebar(pdf: jsPDF, theme: ResumePdfTheme, startY: number): void {
  const panelY = startY - 4;
  const contentX = SIDEBAR_X + 5;
  const contentWidth = SIDEBAR_WIDTH - 10;
  let y = startY + 5;

  pdf.setFillColor(...theme.surface);
  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(
    SIDEBAR_X,
    panelY,
    SIDEBAR_WIDTH,
    PAGE_BOTTOM - panelY,
    1.5,
    1.5,
    "FD",
  );

  y = drawSidebarHeading(pdf, theme, "03 / Toolkit", "Skills.", contentX, y, contentWidth);
  y = drawSkillTags(pdf, theme, contentX, y, contentWidth) + 3;

  y = drawSidebarHeading(pdf, theme, "04 / Education", "Learning.", contentX, y, contentWidth);
  education.forEach((entry) => {
    y = drawEducationEntry(pdf, theme, entry, contentX, y, contentWidth);
  });
  y += 1;

  y = drawSidebarHeading(
    pdf,
    theme,
    "05 / Certifications",
    "Credentials.",
    contentX,
    y,
    contentWidth,
  );
  certifications.forEach((entry) => {
    y = drawCertificationEntry(pdf, theme, entry, contentX, y, contentWidth);
  });
}

function measureWorkEntry(pdf: jsPDF, entry: WorkEntry, width: number): number {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  const employerHeight = Math.max(splitText(pdf, entry.employer, width - 34).length * 3.4, 3.4);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  const titleHeight = splitText(pdf, entry.title, width).length * 4.8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.1);
  const achievementsHeight = entry.achievements.reduce(
    (total, achievement) => total + splitText(pdf, achievement, width - 7).length * 3.6 + 2.2,
    0,
  );

  return 6 + employerHeight + 4 + titleHeight + 4 + achievementsHeight + 8;
}

function drawWorkEntry(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  entry: WorkEntry,
  flow: FlowCursor,
): FlowCursor {
  const entryStartY = flow.y;
  let y = flow.y;

  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.25);
  pdf.line(flow.x, y, flow.x + flow.width, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(...theme.muted);
  y = drawLines(pdf, splitText(pdf, entry.employer, flow.width - 34), flow.x, y, 3.4);
  pdf.text(entry.dates.toUpperCase(), flow.x + flow.width, entryStartY + 6, { align: "right" });

  y += 2.2;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...theme.foreground);
  y = drawLines(pdf, splitText(pdf, entry.title, flow.width), flow.x, y, 4.8);

  y += 3.2;
  const accentStartY = y - 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.1);
  pdf.setTextColor(...theme.muted);

  entry.achievements.forEach((achievement) => {
    const lines = splitText(pdf, achievement, flow.width - 7);
    pdf.setFillColor(...theme.accent);
    pdf.circle(flow.x + 1.1, y - 1.1, 0.65, "F");
    y = drawLines(pdf, lines, flow.x + 4, y, 3.6);
    y += 2.2;
  });

  pdf.setDrawColor(...theme.accent);
  pdf.setLineWidth(0.7);
  pdf.line(flow.x, accentStartY, flow.x, y - 1.8);

  return { ...flow, y: y + 4.5 };
}

function drawExperience(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  initialFlow: FlowCursor,
): FlowCursor {
  let flow = {
    ...initialFlow,
    y: drawSectionHeading(
      pdf,
      theme,
      "01",
      "Experience",
      "Work that ships.",
      initialFlow.x,
      initialFlow.y,
      initialFlow.width,
    ),
  };

  workExperience.forEach((entry) => {
    const fit = ensureFlowSpace(pdf, theme, flow, measureWorkEntry(pdf, entry, flow.width));
    flow = fit.flow;

    if (fit.didAddPage) {
      flow = {
        ...flow,
        y: drawSectionHeading(
          pdf,
          theme,
          "01",
          "Experience",
          "Work that ships.",
          flow.x,
          flow.y,
          flow.width,
        ),
      };
    }

    flow = drawWorkEntry(pdf, theme, entry, flow);
  });

  return flow;
}

function measureProjectEntry(pdf: jsPDF, project: ResumeProjectInput, width: number): number {
  const textWidth = width - 12;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  const titleHeight = splitText(pdf, project.title, textWidth).length * 4.8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.1);
  const summaryHeight = splitText(pdf, project.summary, textWidth).length * 3.7;

  return 7 + titleHeight + 2 + summaryHeight + 7;
}

function drawProjectEntry(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  project: ResumeProjectInput,
  flow: FlowCursor,
): FlowCursor {
  const height = measureProjectEntry(pdf, project, flow.width);
  const contentX = flow.x + 6;
  const contentWidth = flow.width - 12;
  let y = flow.y + 7;

  pdf.setFillColor(...theme.surface);
  pdf.setDrawColor(...theme.line);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(flow.x, flow.y, flow.width, height, 1.5, 1.5, "FD");

  pdf.setFillColor(...theme.accent);
  pdf.rect(flow.x, flow.y, 1.4, height, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...theme.foreground);
  y = drawLines(pdf, splitText(pdf, project.title, contentWidth), contentX, y, 4.8);

  y += 1.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.1);
  pdf.setTextColor(...theme.muted);
  drawLines(pdf, splitText(pdf, project.summary, contentWidth), contentX, y, 3.7);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.4);
  pdf.setTextColor(...theme.accentSoft);
  pdf.textWithLink(
    `${project.repositoryLabel.toUpperCase()} / OPEN`,
    flow.x + flow.width - 5,
    flow.y + height - 3.5,
    { align: "right", url: project.repositoryUrl },
  );

  return { ...flow, y: flow.y + height + 5 };
}

function drawProjects(
  pdf: jsPDF,
  theme: ResumePdfTheme,
  initialFlow: FlowCursor,
): FlowCursor {
  let flow =
    initialFlow.width < FULL_CONTENT_WIDTH || initialFlow.y > 160
      ? startContinuationPage(pdf, theme)
      : initialFlow;

  flow = {
    ...flow,
    y: drawSectionHeading(
      pdf,
      theme,
      "02",
      "Projects",
      "Selected builds.",
      flow.x,
      flow.y,
      flow.width,
    ),
  };

  buildResumeProjectInputs().forEach((project) => {
    const requiredHeight = measureProjectEntry(pdf, project, flow.width) + 5;
    const fit = ensureFlowSpace(pdf, theme, flow, requiredHeight);
    flow = fit.flow;

    if (fit.didAddPage) {
      flow = {
        ...flow,
        y: drawSectionHeading(
          pdf,
          theme,
          "02",
          "Projects",
          "Selected builds.",
          flow.x,
          flow.y,
          flow.width,
        ),
      };
    }

    flow = drawProjectEntry(pdf, theme, project, flow);
  });

  return flow;
}

function drawFooters(pdf: jsPDF, theme: ResumePdfTheme): void {
  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(...theme.muted);
    pdf.text(shortUrl(profile.contact.websiteUrl), PAGE_MARGIN, FOOTER_Y);
    pdf.text(`${String(page).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`, PAGE_WIDTH - PAGE_MARGIN, FOOTER_Y, {
      align: "right",
    });
  }

  pdf.setPage(totalPages);
}

export function createResumePdf(themeName: ResumePdfThemeName): jsPDF {
  const theme = resumePdfThemes[themeName];
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.setProperties({
    title: `${profile.name} - Resume`,
    author: profile.name,
    subject: `${profile.title} resume`,
    creator: profile.contact.websiteUrl,
  });

  const bodyStartY = drawFirstPageHeader(pdf, theme);
  drawSidebar(pdf, theme, bodyStartY);

  let flow: FlowCursor = {
    x: PAGE_MARGIN,
    width: FIRST_PAGE_MAIN_WIDTH,
    y: bodyStartY,
  };

  flow = drawExperience(pdf, theme, flow);
  drawProjects(pdf, theme, flow);
  drawFooters(pdf, theme);

  return pdf;
}
