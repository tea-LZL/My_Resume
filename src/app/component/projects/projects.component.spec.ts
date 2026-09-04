import { TestBed } from "@angular/core/testing";

import { portfolioProjects } from "../../data/portfolio.data";
import { ProjectsComponent } from "./projects.component";

describe("ProjectsComponent", () => {
  let component: ProjectsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
    }).compileComponents();
    component = TestBed.createComponent(ProjectsComponent).componentInstance;
  });

  it("exposes every shared project in portfolio order", () => {
    expect(component.projects).toEqual(portfolioProjects);
    expect(component.projects.map((project) => project.title)).toEqual([
      "Asterisk",
      "Origami",
      "Buoy",
      "Weathering With Go API",
      "GenPass",
    ]);
  });

  it("keeps repository links public and uses the right provider label", () => {
    for (const project of component.projects) {
      expect(project.repositoryUrl).toMatch(/^https:\/\/(github|gitlab)\.com\//);
      expect(["GitHub", "GitLab"]).toContain(project.repositoryLabel);
    }
  });

  it("falls back to the cover image when a gallery is absent", () => {
    const asterisk = component.projects.find((project) => project.id === "asterisk");

    expect(asterisk).toBeDefined();
    expect(component.imagesFor(asterisk!)).toEqual([asterisk!.coverImageUrl]);
  });

  it("shows the cover before extra gallery images", () => {
    const buoy = component.projects.find((project) => project.id === "buoy");

    expect(buoy).toBeDefined();
    expect(buoy!.gallery?.length).toBeGreaterThan(0);
    expect(component.imagesFor(buoy!)).toEqual([
      buoy!.coverImageUrl,
      ...(buoy!.gallery ?? []),
    ]);
  });
});