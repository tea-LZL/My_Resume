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
    "Innovative and detail-oriented Software Engineer with 3+ years of experience in building scalable web applications, backend API integrations and Database Management. Proficient in modern JavaScript frameworks and cloud-native architectures. Dedicated to effective workflow and user experience.",
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
    id: "weathering-with-go-api",
    title: "Weathering With Go API",
    summary:
      "A Go and Gin weather API that uses OpenWeatherMap for current conditions and forecasts.",
    description:
      "A project for exploring Go with the Gin framework while building a small API around OpenWeatherMap weather data for locations around the world.",
    tags: ["Go", "Gin", "REST API", "OpenWeatherMap"],
    repositoryUrl: "https://github.com/tea-steeping-studio/weathering-with-go-api",
    repositoryLabel: "GitHub",
    coverImageUrl: "assets/weathering_with_go_api_cover_image.png",
    featured: false,
  },
  {
    id: "genpass",
    title: "GenPass",
    summary: "A password generator built with Rust and a Ratatui terminal interface.",
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
  "JavaScript (ES6+)",
  "TypeScript",
  "Angular",
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
  "Rust",
  "Tauri",
  "React",
  "Tailwind CSS",
  "Svelte",
  "Go",
  "Gin",
  "REST API",
  "OpenWeatherMap",
  "Ratatui",
  "GCP",
  "CI/CD",
  "Linux",
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
    id: "azure-developer-associate",
    name: "Microsoft Certified: Azure Developer Associate",
    year: "2021",
  },
  {
    id: "azure-database-administrator-associate",
    name: "Microsoft Certified: Azure Database Administrator Associate",
    year: "2022",
  },
  {
    id: "devops-engineer-expert",
    name: "Microsoft Certified: DevOps Engineer Expert",
    year: "2021",
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
    employer: "Automate - Volaris group",
    dates: "2024 - Present",
    achievements: [
      "Led rewrites of legacy customer portals from AngularJS to Angular 19, improving responsiveness and closing security vulnerabilities in outdated libraries and legacy code.",
      "Architected and deployed a full-stack application using Angular 20, a .NET 8 backend API, and SQL Server for a review and approval workflow that onboards customers into the client's system.",
      "Participated in the rewrite of a legacy MVC membership system to Angular 20 with a .NET Core API and SQL Server database, investigating indexing and caching strategies to improve query performance.",
      "Mentored junior developers, conducted code reviews, and managed CI/CD pipelines and IIS Server configuration.",
    ],
  },
  {
    id: "britehouse-associate-engineer",
    title: "Associate Software Application Development Engineer",
    employer: "Britehouse Automotive - Dimension Data",
    dates: "2022 - 2024",
    achievements: [
      "Developed internal management websites for automotive dealerships using HTML, SCSS, Angular, and a .NET Core API backend.",
      "Collaborated closely with the Quality Assurance team to ensure robust and reliable implementation of features.",
      "Optimized database queries and API response times for high-traffic campaigns.",
    ],
  },
] as const satisfies readonly WorkExperienceEntry[];
