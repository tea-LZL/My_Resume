import {
  buildResumeProjectInputs,
  createResumePdf,
  getResumeCredentialFiles,
  resumePdfThemes,
} from "./resume-pdf";
import {
  certificateLinks,
  certifications,
  portfolioProjects,
} from "../../../data/portfolio.data";

describe("Resume PDF renderer", () => {
  it("keeps PDF project content in portfolio order", () => {
    const projectInputs = buildResumeProjectInputs();

    expect(projectInputs).toHaveSize(portfolioProjects.length);
    expect(projectInputs.map(({ title }) => title)).toEqual(
      portfolioProjects.map(({ title }) => title),
    );
    expect(projectInputs.map(({ summary }) => summary)).toEqual(
      portfolioProjects.map(({ summary }) => summary),
    );
    expect(projectInputs.map(({ repositoryUrl }) => repositoryUrl)).toEqual(
      portfolioProjects.map(({ repositoryUrl }) => repositoryUrl),
    );
  });

  it("uses the shared credential order when appending verification documents", () => {
    expect(getResumeCredentialFiles()).toEqual(
      certifications.map(({ id }) => certificateLinks[id].pdfFile),
    );
  });

  it("creates a multi-page editorial PDF for both site palettes", () => {
    const darkPdf = createResumePdf("dark");
    const lightPdf = createResumePdf("light");

    expect(darkPdf.getNumberOfPages()).toBeGreaterThanOrEqual(2);
    expect(lightPdf.getNumberOfPages()).toBeGreaterThanOrEqual(2);
    expect(darkPdf.output("arraybuffer").byteLength).toBeGreaterThan(1_000);
    expect(lightPdf.output("arraybuffer").byteLength).toBeGreaterThan(1_000);
    expect(resumePdfThemes.dark.accent).toEqual([181, 204, 138]);
    expect(resumePdfThemes.light.accent).toEqual([82, 115, 63]);
  });
});
