import { Project } from "../interfaces/project";

export interface ContactSummary {
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly linkedinUrl: string;
  readonly websiteUrl: string;
  readonly githubUrl: string;
  readonly sourceUrl: string;
}

export interface ProfileSummary {
  readonly name: string;
  readonly title: string;
  readonly summary: string;
  readonly pdfSummary: string;
  readonly contact: ContactSummary;
}

export interface EducationEntry {
  readonly id: string;
  readonly qualification: string;
  readonly institution: string;
  readonly dates: string;
}

export interface CertificationEntry {
  readonly id: string;
  readonly name: string;
  readonly year: string;
}

export interface CertificateLink {
  readonly pdfFile: string;
  readonly verificationUrl: string;
}

export interface WorkExperienceEntry {
  readonly id: string;
  readonly title: string;
  readonly employer: string;
  readonly dates: string;
  readonly achievements: readonly string[];
}

export const contact = {
  email: "zhilongliang@tealzl.com",
  phone: "+27 82-732-6878",
  location: "Pretoria, ZA",
  linkedinUrl: "https://www.linkedin.com/in/zhilong-liang-748b641a1",
  websiteUrl: "https://zhilong-liang-resume.vercel.app",
  githubUrl: "https://github.com/tea-LZL",
  sourceUrl: "https://github.com/tea-LZL/My_Resume",
} as const satisfies ContactSummary;

export const profile = {
  name: "Zhilong Liang",
  title: "Software Engineer",
  summary:
    "Software Engineer with 4 years’ experience building and modernising production web systems in Angular and .NET. Led AngularJS-to-Angular migrations, shipped full-stack Angular / .NET 8 / SQL Server applications, and own CI/CD, code reviews, and junior mentoring.",
  pdfSummary:
    "Mid-level Software Engineer with 4 years delivering Angular and .NET systems for enterprise clients. Led legacy portal rewrites from AngularJS to Angular 19/20, designed .NET 8 APIs and SQL Server data layers, and improved query performance through indexing and caching. Comfortable owning a feature from API to UI, reviewing code, mentoring juniors, and running CI/CD on Github, IIS and Azure.",
  contact,
} as const satisfies ProfileSummary;

export const portfolioProjects = [
  {
    id: "asterisk",
    title: "Asterisk",
    summary:
      "A native Rust password manager that shares one encrypted KDBX core across CLI, TUI, GUI, and browser integration.",
    description:
      "A KDBX 4.0 password manager in Rust with CLI, TUI, and native iced GUI frontends. It also provides secure clipboard and TOTP actions plus a Chrome Manifest V3 integration through a native-messaging host.",
    tags: ["Rust", "KDBX", "CLI", "TUI", "iced", "Chrome MV3"],
    repositoryUrl: "https://gitlab.com/tea-LZL/asterisk-vault",
    repositoryLabel: "GitLab",
    coverImageUrl: "assets/projects/asterisk.png",
    featured: true,
  },
  {
    id: "origami",
    title: "Origami",
    summary:
      "An offline-first desktop email client designed around a native Linux workflow.",
    description:
      "An offline-first desktop email client for Arch Linux with a Wayland and Hyprland-first workflow. Its Rust workspace includes a Tauri shell, local store, sync engine, and a Svelte 5, Vite, and TypeScript UI.",
    tags: ["Rust", "Tauri", "Svelte 5", "TypeScript", "Arch Linux", "Wayland"],
    repositoryUrl: "https://gitlab.com/tea-LZL/origami",
    repositoryLabel: "GitLab",
    coverImageUrl: "assets/projects/origami.png",
    featured: true,
  },
  {
    id: "buoy",
    title: "Buoy",
    summary:
      "A private, minimal Firefox RSS reader that keeps RSS, Atom, and OPML feeds local.",
    description:
      "A Firefox desktop extension that reads RSS, Atom, and OPML locally with no account, analytics, or cloud sync. Feeds are stored in IndexedDB, with OPML import and export for migration and a full reader available from the toolbar or Firefox sidebar.",
    tags: ["Firefox", "TypeScript", "RSS", "IndexedDB"],
    repositoryUrl: "https://github.com/tea-LZL/buoy",
    repositoryLabel: "GitHub",
    coverImageUrl: "assets/projects/buoy-icon.png",
    gallery: ["assets/projects/buoy.png"],
    featured: false,
  },
  {
    id: "weathering-with-go-api",
    title: "Weathering With Go API",
    summary:
      "A Go and Gin weather API that uses OpenWeatherMap for current conditions and forecasts.",
    description:
      "A project for exploring Go with the Gin framework while building a small API around OpenWeatherMap weather data for locations around the world.",
    tags: ["Go", "Gin", "REST API", "OpenWeatherMap"],
    repositoryUrl:
      "https://github.com/tea-steeping-studio/weathering-with-go-api",
    repositoryLabel: "GitHub",
    coverImageUrl: "assets/weathering_with_go_api_cover_image.png",
    featured: false,
  },
  {
    id: "genpass",
    title: "GenPass",
    summary:
      "A password generator built with Rust and a Ratatui terminal interface.",
    description:
      "A local password generator TUI built with Rust and Ratatui, providing a terminal-based alternative to using a password-generator website.",
    tags: ["Rust", "TUI", "Ratatui"],
    repositoryUrl: "https://github.com/tea-LZL/GenPass",
    repositoryLabel: "GitHub",
    coverImageUrl: "assets/genpass_cover_image.png",
    featured: false,
  },
] as const satisfies readonly Project[];

export const featuredProjects: readonly Project[] = Object.freeze(
  portfolioProjects.filter((project) => project.featured),
);

export const skills = [
  "Angular",
  "TypeScript",
  "C#",
  ".NET",
  "SQL Server",
  "Azure",
  "CI/CD",
  "IIS",
] as const satisfies readonly string[];

export const additionalSkills = [
  "React",
  "Rust",
  "Go",
  "Svelte",
  "JavaScript (ES6+)",
  "HTML5 & SCSS",
  "Node.js",
  "REST API",
  "Docker",
  "Git",
] as const satisfies readonly string[];

export const education = [
  {
    id: "willowridge-high-school",
    qualification: "Matric Certificate",
    institution: "Willowridge High School",
    dates: "2014 – 2018",
  },
  {
    id: "ctu-system-development",
    qualification: "Information Technology: System Development",
    institution: "CTU Training Solution",
    dates: "2019 – 2023",
  },
] as const satisfies readonly EducationEntry[];

export const certifications = [
  {
    id: "devops-engineer-expert",
    name: "Microsoft Certified: DevOps Engineer Expert",
    year: "2021",
  },
  {
    id: "azure-developer-associate",
    name: "Microsoft Certified: Azure Developer Associate",
    year: "2021",
  },
  {
    id: "azure-database-administrator-associate",
    name: "Microsoft Certified: Azure Database Administrator Associate",
    year: "2022",
  },
] as const satisfies readonly CertificationEntry[];

export const certificateLinks: Readonly<Record<string, CertificateLink>> = {
  "azure-developer-associate": {
    pdfFile: "Credentials_ZhilongLiang_4664_Azure_Developer_Associate.pdf",
    verificationUrl:
      "https://learn.microsoft.com/en-gb/users/zhilongliang-4664/credentials/ad9659f137b6be27",
  },
  "azure-database-administrator-associate": {
    pdfFile:
      "Credentials_ZhilongLiang_4664_AzureDatabaseAdministratorAssociate.pdf",
    verificationUrl:
      "https://learn.microsoft.com/en-gb/users/zhilongliang-4664/credentials/a479ba66473c157",
  },
  "devops-engineer-expert": {
    pdfFile: "Credentials_ZhilongLiang_4664_DevOps_Engineer_Expert.pdf",
    verificationUrl:
      "https://learn.microsoft.com/en-gb/users/zhilongliang-4664/credentials/bd2700599055f76f",
  },
} as const;

export const workExperience = [
  {
    id: "automate-software-engineer",
    title: "Software Engineer",
    employer: "Automate — Volaris Group",
    dates: "2024 – Present",
    achievements: [
      "Led the rewrite of legacy customer portals from AngularJS to Angular 19, replacing outdated libraries and closing known security gaps in the old stack.",
      "Designed and shipped a full-stack onboarding workflow in Angular 20, .NET 8, and SQL Server, covering review, approval, and customer intake into the client system.",
      "Migrated a legacy MVC membership system to Angular 20 with a .NET Core API and SQL Server; improved query performance through indexing and caching.",
      "Mentored junior developers, ran code reviews, and maintained CI/CD pipelines plus IIS configuration for releases.",
    ],
  },
  {
    id: "britehouse-associate-engineer",
    title: "Associate Software Application Development Engineer",
    employer: "Britehouse Automotive — Dimension Data",
    dates: "2022 – 2024",
    achievements: [
      "Built internal dealership management sites in Angular, HTML/SCSS, and .NET Core APIs used by automotive operations teams.",
      "Tightened API and SQL Server performance for high-traffic campaign periods, reducing slow queries and improving response times.",
      "Worked with QA to take features from implementation through test and release with fewer production defects.",
    ],
  },
] as const satisfies readonly WorkExperienceEntry[];
