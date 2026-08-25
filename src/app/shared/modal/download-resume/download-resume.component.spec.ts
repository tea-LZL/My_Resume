import { portfolioProjects } from "../../../data/portfolio.data";
import { buildResumeProjectInputs } from "./download-resume.component";

describe("DownloadResumeComponent project inputs", () => {
  it("keeps PDF project title and description input in portfolio order", () => {
    const projectInputs = buildResumeProjectInputs();

    expect(projectInputs).toHaveSize(portfolioProjects.length);
    expect(projectInputs.map(({ title }) => title)).toEqual(
      portfolioProjects.map(({ title }) => title),
    );
    expect(projectInputs.map(({ description }) => description)).toEqual(
      portfolioProjects.map(({ description }) => description),
    );
  });
});
