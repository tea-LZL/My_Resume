import { TestBed } from "@angular/core/testing";

import { portfolioProjects, profile, workExperience } from "../../data/portfolio.data";
import { ResumeComponent } from "./resume.component";

describe("ResumeComponent", () => {
  let component: ResumeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeComponent],
    }).compileComponents();
    component = TestBed.createComponent(ResumeComponent).componentInstance;
  });

  it("exposes shared profile, current work, and project data", () => {
    expect(component.profile).toBe(profile);
    expect(component.workExperience).toEqual(workExperience);
    expect(component.projects).toEqual(portfolioProjects);
    expect(component.workExperience[0].employer).toContain("Automate");
  });

  it("resolves the verified credential link map", () => {
    const link = component.getCertificateLink("azure-developer-associate");

    expect(link?.verificationUrl).toContain("learn.microsoft.com");
    expect(link?.pdfFile).toContain("Azure_Developer_Associate.pdf");
  });
});