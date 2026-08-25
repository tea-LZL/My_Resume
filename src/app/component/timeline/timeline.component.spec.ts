import { certifications, education, workExperience } from "../../data/portfolio.data";
import { TimelineComponent } from "./timeline.component";

describe("TimelineComponent", () => {
  it("exposes the shared work, education, and certification entries", () => {
    const component = new TimelineComponent();

    expect(component.workExperience).toEqual(workExperience);
    expect(component.education).toEqual(education);
    expect(component.certifications).toEqual(certifications);
    expect(component.workExperience[0].employer).toContain("Automate");
    expect(component.timelineWorkExperience[0].employer).toContain("Automate");
    expect(component.timelineEducation[0].institution).toContain("CTU");
    expect(component.timelineEducation[1].qualification).toContain("Matric");
    expect(component.education[1].institution).toContain("CTU");
  });
});