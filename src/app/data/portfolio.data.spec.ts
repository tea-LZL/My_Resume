import {
  featuredProjects,
  portfolioProjects,
} from "./portfolio.data";

describe("portfolio data", () => {
  it("keeps project IDs unique", () => {
    const ids = portfolioProjects.map((project) => project.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides the required fields for every project", () => {
    for (const project of portfolioProjects) {
      expect(project.id.trim()).not.toBe("");
      expect(project.title.trim()).not.toBe("");
      expect(project.summary.trim()).not.toBe("");
      expect(project.description.trim()).not.toBe("");
      expect(project.tags.length).toBeGreaterThan(0);
      expect(project.repositoryUrl.trim()).not.toBe("");
      expect(project.repositoryLabel.trim()).not.toBe("");
      expect(project.coverImageUrl.trim()).not.toBe("");
      expect(project.coverImageUrl).toMatch(/^assets\/\S+$/);
      expect(typeof project.featured).toBe("boolean");
    }
  });

  it("keeps a nonempty featured subset drawn from the portfolio", () => {
    expect(featuredProjects.length).toBeGreaterThan(0);

    const portfolioIds = new Set<string>(
      portfolioProjects.map((portfolioProject) => portfolioProject.id),
    );

    for (const project of featuredProjects) {
      expect(project.featured).toBeTrue();
      expect(portfolioIds.has(project.id)).toBeTrue();
    }
  });

  it("includes the verified featured projects and omits WIP projects", () => {
    const ids = new Set<string>(portfolioProjects.map((project) => project.id));

    expect(ids.has("convo")).toBeFalse();
    expect(ids.has("asterisk")).toBeTrue();
    expect(ids.has("origami")).toBeTrue();
    expect(ids.has("buoy")).toBeTrue();
  });

  it("rejects local and credential-bearing repository URLs", () => {
    const publicRepositoryPattern =
      /^https:\/\/(?:github|gitlab)\.com\/[^/\s]+\/[^/?#\s]+$/;

    for (const project of portfolioProjects) {
      expect(project.repositoryUrl).toMatch(publicRepositoryPattern);

      const parsedUrl = new URL(project.repositoryUrl);
      expect(parsedUrl.protocol).toBe("https:");
      expect(["github.com", "gitlab.com"]).toContain(parsedUrl.hostname);
      expect(parsedUrl.username).toBe("");
      expect(parsedUrl.password).toBe("");
      expect(parsedUrl.search).toBe("");
      expect(parsedUrl.hash).toBe("");
    }
  });
});
