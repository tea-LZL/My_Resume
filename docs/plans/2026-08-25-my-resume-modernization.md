# My_Resume Modernization and Portfolio Refresh Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Modernize the Angular resume site into a fast, responsive, editorial portfolio that presents Zhilong Liang’s current work clearly, adds verified recent projects, and keeps the HTML resume, PDF export, PWA shell, and mobile navigation consistent.

**Architecture:** Keep the existing Angular 21 standalone-component application, lazy routes, Bootstrap 5/ng-bootstrap integrations, SCSS styling, contribution/weather integrations, and PDF export. Move portfolio/resume copy into one typed data module, then make the home, projects, timeline, resume, and PDF surfaces consume that source. Replace the current Everforest/glass-heavy bento presentation with a tokenized, system-first editorial layout inspired by `/home/tea/repos/tealzl-website/public/styles.css`, without copying that site’s Node/Cloudflare runtime.

**Tech Stack:** Angular 21, TypeScript, standalone components, Angular Router, Bootstrap 5.3, ng-bootstrap, SCSS/CSS custom properties, Jasmine/Karma, Bun, jsPDF, pdf-lib, Angular Service Worker.

**Target:** A shippable visual/content refresh of `My_Resume` with all existing routes either polished or intentionally removed, no unverified project claims, and passing project quality gates.

**Starting state:** The production build passes, but the test runner points at a nonexistent stylesheet, lint crashes because Angular 21 is paired with `angular-eslint` 18, project copy is duplicated across three surfaces, `/files` is a placeholder route, and the current UI relies on dense bento cards, glass effects, cursor effects, and large global SCSS blocks.

**Invariant:** Every phase ends with the relevant `bun run test -- --watch=false`, `bun run lint`, and `bun run build` gates clean, or the executor stops and fixes the regression before continuing.

---

## Investigated baseline

### Repository and stack

- Repository: `/home/tea/repos/My_Resume`
- Branch/status at planning time: `master...github/master`, working tree clean, `git diff --check` clean.
- No `AGENTS.md`, `CLAUDE.md`, or `.cursorrules` exists in the target repository.
- Angular packages are `21.2.x`; Bun is the project package manager.
- `@ng-bootstrap/ng-bootstrap` is installed at `19.0.1`, whose package metadata declares Angular `^20.0.0` peers; this dependency drift must be resolved or explicitly validated before treating the Angular 21 quality gate as trustworthy.
- CI currently maps `develop` to `prelive` and `uat` to `uat`, but `angular.json` only defines `production` and `development`; branch-specific build configuration must be reconciled before CI gates can be reliable.
- Existing route paths are `/`, `/projects`, `/timeline`, `/files`, and `/resume` in `src/app/app.routes.ts:4-29`.
- Existing source/test inventory: 37 TypeScript files, 13 HTML files, 15 SCSS files, 12 `*.spec.ts` files, and 17 asset files under the inspected target scopes.

### Baseline commands and actual results

| Command | Result | Evidence/diagnostic |
|---|---|---|
| `bun run build` | **PASS with warnings** | Angular build completed and wrote `dist/project_personal`. Initial raw chunk total was 736.24 kB; the 500 kB warning budget was exceeded. The output also reported Sass deprecations, CommonJS dependencies from PDF tooling, and an unused `RouterLink` import in `footer.component.ts`. |
| `bun run test -- --watch=false` | **FAIL before tests run** | `angular.json:110` references `src/styles.scss`, but the real global stylesheet is `src/styles/styles.scss`; the bundle failed with `Could not resolve "src/styles.scss"`. |
| `bun run lint` | **FAIL before source findings** | `angular-eslint`/builder is 18.4.0 while Angular CLI/build is 21.x. Lint aborts while loading `@typescript-eslint/no-unused-expressions` with `Cannot read properties of undefined (reading 'allowShortCircuit')`. |

Do not describe the baseline test or lint failures as caused by the redesign. They are pre-existing configuration/tooling failures and must be cleared first.

### Current architectural evidence

- `src/app/app.component.html:14-27` contains the fixed navbar, nested `<main>` elements, a scrollable wrapper, route animation host, and footer. This is the shell to simplify rather than adding another layout wrapper.
- `src/app/component/home/home.component.html:1-466` is a large bento dashboard containing the hero, carousel, weather widget, skills marquee, education, certifications, work experience, GitHub SVG, and GitLab heatmap.
- `src/app/component/home/home.component.ts:49-105` adds timed reveal classes, kinetic typography, palette pointer tracking, and a document-level visual effect. `:root`/Everforest/glass tokens and many effects live in `src/styles/styles.scss:315-440` and later blocks.
- `src/app/component/projects/projects.component.ts:23-104` owns both the Weathering case-study steps and the project data. `projects.component.html:3-67` renders cards and an inline-styled case study.
- `src/app/component/resume/resume.component.html:173-211` hardcodes four personal-project descriptions. `src/app/shared/modal/download-resume/download-resume.component.ts:526-743` separately hardcodes four PDF project cards, while `projects.component.ts` has a third copy.
- `src/app/component/file/file.component.html:1` is only `<p>file works!</p>` and its stylesheet is empty. It is reachable only through the unadvertised `/files` route.
- `src/app/shared/directives/scroll-reveal.directive.ts:18-55` always starts elements hidden and assumes `IntersectionObserver` exists. `src/app/shared/directives/magnetic-hover.directive.ts:14-61` adds pointer transforms without reduced-motion/pointer-capability gating and does not retain all listener disposers.
- `src/app/component/home/home.component.ts:127-145` fetches a remote SVG and injects it with `DomSanitizer.bypassSecurityTrustHtml`; the redesign must not expand this trust boundary.
- `src/app/shared/navbar/navbar.component.html:1-79` and `src/app/shared/navbar/nav-modal/nav-modal.component.html:1-30` duplicate navigation labels and external links. The mobile toggler has a hard-coded `aria-expanded="false"` instead of binding to `bNav`.
- `src/app/shared/footer/footer.component.html:1-170` uses large inline-style blocks. `footer.component.ts:6` imports `RouterLink` without using it.

### Reference and research evidence

- `/home/tea/repos/tealzl-website/public/styles.css:1-10` uses a small token set (`background`, `foreground`, `muted`, `line`, `accent`) and system body/display/mono stacks.
- `/home/tea/repos/tealzl-website/public/styles.css:41-72` uses a centered `1120px` shell, thin rules, and compact mono metadata rather than a full-screen glass dashboard.
- `/home/tea/repos/tealzl-website/public/styles.css:116-175` uses `clamp()` typography and a two-column hero footer; lines 190-237 collapse it at `640px` and disable motion under `prefers-reduced-motion`.
- Web research confirmed the platform guidance for honoring `prefers-reduced-motion`: [web.dev — prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) and [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- The reference website is a static/Cloudflare Worker-style site. Do not copy its WebFinger handlers, server, deployment model, or runtime dependencies into this Angular project.

---

## Verified project inventory and default content set

Use the following verified local repositories as the source for new project copy and visual assets. Do not claim metrics, users, releases, or production status unless the source repository explicitly supports the claim.

| Project | Verified source/evidence | Portfolio angle and repository link |
|---|---|---|
| **Convo** | `/home/tea/repos/Convo/README.md:3-5,44-57`; Tauri v2 + Rust + React/TypeScript/Tailwind; multi-provider local-first AI workspace with chat, compare, documents, memory, notes/tasks, diagnostics, themes, and responsive UI. | “A local-first AI workspace for chat, documents, memory, tasks, and model workflows.” `https://github.com/tea-LZL/Convo` |
| **Asterisk** | `/home/tea/Projects/Astrisk - Vault/README.md:1-18,37-109`; Rust KDBX 4 password manager with CLI, TUI, native iced GUI, secure clipboard/TOTP, and a Chrome MV3 native-messaging integration. | “A native Rust password manager that shares one encrypted KDBX core across CLI, TUI, GUI, and browser integration.” `https://gitlab.com/tea-LZL/asterisk-vault` |
| **Origami** | `/home/tea/Projects/Origami/README.md:1-42`; offline-first desktop email client for Arch Linux/Wayland with Rust workspace, Tauri shell, Svelte 5 UI, local store, and sync engine. | “An offline-first desktop email client designed around a native Linux workflow.” `https://gitlab.com/tea-LZL/origami` |
| **CR Quality Force** | `/home/tea/repos/Crunchyroll_Static_Vilos_LocalStorage_Cleaner/README.md:1-20,22-30`; Manifest V3 extension that patches Crunchyroll Vilos MPD responses and removes selected `cr-` localStorage keys. | “A focused browser extension that intercepts streaming manifests and gives users a deliberate local reset action.” `https://github.com/tea-LZL/Crunchyroll_Static_Vilos_LocalStorage_Cleaner` |
| **Weathering With Go API** | Existing target content in `src/app/component/projects/projects.component.ts:61-72`, including Go/Gin/OpenWeatherMap/GCP/CI/CD claims. | Keep as the API/deployment case study, but rewrite grammar and remove claims that cannot be demonstrated. `https://github.com/tea-steeping-studio/weathering-with-go-api` |
| **GenPass** | Existing target content in `src/app/component/projects/projects.component.ts:73-82` and resume copy. | Keep as a smaller Rust/TUI archive item unless the final card count needs to be reduced. `https://github.com/tea-LZL/GenPass` |

Default presentation: feature **Convo**, **Asterisk**, and **Origami** first; show Weathering, CR Quality Force, and GenPass as supporting work. Keep the existing Weathering step-by-step case study but do not force every project into a long case study. Treat `tealzl-website` as visual/reference material, not as a portfolio entry in this plan.

For target assets, create `src/assets/projects/` and copy only public project artwork after verifying it is safe to redistribute:

```text
/home/tea/repos/Convo/src-tauri/icons/512x512.png
/home/tea/Projects/Astrisk - Vault/assets/icons/hicolor/512x512/apps/asterisk.png
/home/tea/Projects/Origami/assets/origami-dark-bg.png
/home/tea/repos/Crunchyroll_Static_Vilos_LocalStorage_Cleaner/icons/icon.png
```

Use target names such as `convo.png`, `asterisk.png`, `origami.png`, and `cr-quality-force.png`. Never copy credential PDFs, keyfiles, `.env` files, databases, or private screenshots into the portfolio.

---

## Scope

### In scope

- Repair the test/lint configuration so the project has a trustworthy quality gate.
- Create one typed portfolio/resume content source and migrate all project copy to it.
- Add verified current projects and public project artwork.
- Redesign the shell, navigation, home page, projects page, timeline, resume, and footer with an editorial/system-first visual language.
- Make layouts usable at narrow mobile widths, tablet widths, and wide desktop widths without horizontal overflow.
- Preserve working theme switching, weather/contribution sections, credential viewing, PDF download, and lazy routes unless a phase explicitly replaces their presentation.
- Improve focus semantics, reduced-motion behavior, external-link labeling, lightbox interaction, and non-blocking async states.
- Keep initial JavaScript from growing unnecessarily and retain the PDF generator as a lazy surface.
- Add or strengthen unit tests, CI gates, metadata, PWA manifest values, and manual visual QA documentation.

### Explicit non-goals

- Do not migrate away from Angular, replace the router, or copy the `tealzl-website` Node/Cloudflare Worker architecture.
- Do not add a backend, CMS, database, project-content API, analytics, or new runtime dependency without a separate requirement.
- Do not invent project metrics, employer details, certificate claims, dates, demos, or availability.
- Do not commit secrets or change the existing CI secret-injection mechanism. Treat `OPENWEATHER_API_KEY` as deployment configuration only.
- Do not redesign or modify the external Convo, Asterisk, Origami, Weathering, or extension repositories as part of this work.
- Do not keep the `/files` placeholder merely for route completeness; either remove the dead route/component or replace it with a concrete credentials requirement. This plan chooses removal because certificates already have dedicated controls and PDF inclusion.
- Do not add heavy animation, blur, cursor-following effects, contour SVGs, or a large design-system dependency. Prefer crisp rules, restrained motion, and CSS primitives.

---

## Phase 0: Restore the quality gate before visual work

**Goal:** Make the existing application testable and lintable without hiding failures.

### 0.1 Fix the stylesheet entry-point mismatch

- **Modify:** `angular.json:35` and `angular.json:94-112`.
- Change the build and test `styles` arrays to reference the real entry point `src/styles/styles.scss`. Do not list `src/styles.scss`, which does not exist. Do not list `src/styles/theme.scss` separately when `styles.scss` already imports it at `src/styles/styles.scss:7`.
- Keep Bootstrap’s existing script behavior for the application build; the test setup must not depend on a browser-global carousel constructor merely to instantiate `HomeComponent`.

### 0.2 Align Angular ecosystem dependencies

- **Modify:** `package.json:32-47` and generated `bun.lock`.
- Replace the `angular-eslint` 18.x dependency with the Angular-eslint major compatible with Angular CLI 21 and its builder peer range. Keep `typescript-eslint` and ESLint on mutually compatible versions; do not hand-edit `bun.lock`.
- Run the package-manager update with Bun and inspect the resulting peer warnings. Do not jump to a major that requires Angular CLI 22 unless the Angular package versions are intentionally upgraded in a separate plan.
- **Modify:** `eslint.config.js:1-43` only when required by the aligned package family. Do not disable the recommended or template-accessibility configs to make the command green.
- Update `@ng-bootstrap/ng-bootstrap` from 19.x to the release whose peer dependencies explicitly include Angular 21 (the installed 19.0.1 metadata accepts only Angular 20). Keep Bootstrap 5.3 and the existing ng-bootstrap API surface where possible; verify the installed package metadata and modal/dropdown behavior before finalizing the lockfile.
- Exercise the existing mobile navigation modal, theme dropdown, certificate modal, and image lightbox after the upgrade. If a breaking API change is required, isolate that compatibility fix in the affected component rather than replacing ng-bootstrap wholesale.

### 0.3 Make first-render setup lifecycle-safe

- **Modify:** `src/app/component/home/home.component.ts:107-125`.
- Move carousel setup to a view-safe lifecycle point or remove the imperative constructor call in favor of the existing Bootstrap data attributes. Guard optional browser globals so unit tests and non-browser rendering do not throw when `window.bootstrap` is absent.
- Preserve the carousel’s current images and loading fallback.
- **Test:** `src/app/component/home/home.component.spec.ts` should instantiate the component without a Bootstrap global and assert that it does not throw.

### 0.4 Clear baseline failures and record warnings

Run:

```bash
bun run test -- --watch=false
bun run lint
bun run build
```

Expected gate: all three commands exit `0`. Sass deprecation, CommonJS, or budget warnings may remain temporarily if they are not introduced by the phase, but they must be recorded and not converted into errors by suppressing diagnostics. Remove the unused `RouterLink` import in `src/app/shared/footer/footer.component.ts:1-9` while touching the quality gate.

---

## Phase 1: Establish the single portfolio content source

**Goal:** Make project and resume copy change in one place and make the new project set verifiable.

### 1.1 Replace the narrow project interface

- **Modify:** `src/app/interfaces/project.ts:1-8`.
- Use lower-camel-case fields and readonly-friendly types. The minimum shape is:

```ts
export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: readonly string[];
  repositoryUrl: string;
  repositoryLabel: string;
  coverImageUrl: string;
  gallery?: readonly string[];
  featured: boolean;
}
```

- Do not carry `GitHub_Link` into the new design; some verified projects are on GitLab and the UI should say “Repository” rather than incorrectly saying “GitHub”.

### 1.2 Add typed portfolio data

- **Create:** `src/app/data/portfolio.data.ts`.
- Export `portfolioProjects`, `featuredProjects`, `skills`, `education`, `certifications`, `workExperience`, and the profile/contact summary needed by the HTML resume and PDF generator.
- Keep project descriptions short enough for cards and provide a longer `description` only when it adds information. Keep the Weathering case-study steps separate from the general project-card data.
- Use the verified project table above as the default content. Keep exact external URLs. Do not embed local source-repository filesystem paths in runtime data.
- Make the source immutable (`readonly`/`satisfies`) so templates cannot accidentally mutate content.

### 1.3 Add data regression tests

- **Create:** `src/app/data/portfolio.data.spec.ts`.
- Assert that project IDs are unique, every project has a nonempty title/summary/repository URL/image path, the featured subset is nonempty, and the new projects `convo`, `asterisk`, and `origami` are present.
- Assert that no repository URL is a credential or local filesystem path.

Run:

```bash
bun run test -- --watch=false --include='src/app/data/portfolio.data.spec.ts'
```

Expected: the focused data tests pass before templates are migrated.

### 1.4 Add project artwork

- **Create:** `src/assets/projects/convo.png`, `src/assets/projects/asterisk.png`, `src/assets/projects/origami.png`, and `src/assets/projects/cr-quality-force.png` from the verified public source paths listed above.
- Add dimensions/aspect-ratio handling in the projects stylesheet rather than editing the source artwork destructively.
- If a source asset is unavailable at execution time, use `src/assets/placeholder.png` and leave the data entry truthful; do not fabricate a screenshot.

### 1.5 Migrate project consumers

- **Modify:** `src/app/component/projects/projects.component.ts:23-104` to import the shared projects and keep only the Weathering case-study steps locally.
- **Modify:** `src/app/component/home/home.component.ts` and its template to consume featured projects rather than repeating titles in HTML.
- **Modify:** `src/app/component/resume/resume.component.ts:1-72` and `src/app/component/resume/resume.component.html:173-211` to render shared project/resume data.
- **Modify:** `src/app/shared/modal/download-resume/download-resume.component.ts:526-743` so the PDF project section iterates over the shared project data instead of four hardcoded `projN` blocks.
- Add focused tests to `projects.component.spec.ts` and `resume.component.spec.ts` that assert the new project names and repository links appear after migration.

Verify no stale project copy remains outside the data module except the intentional Weathering case-study wording:

```bash
search_files 'Weathering|GenPass|Convo|Asterisk|Origami|CR Quality Force' --path src/app --file_glob '*.html'
```

Expected: matches are template bindings/labels or intentional case-study text, not a second complete project data list.

**Gate:** `bun run test -- --watch=false` and `bun run lint` pass. The PDF source compiles without hardcoded project-count assumptions.

---

## Phase 2: Replace the visual foundation with a restrained editorial system

**Goal:** Create a coherent responsive visual language that borrows the reference site’s clarity without copying its runtime.

### 2.1 Define theme tokens

- **Modify:** `src/styles/theme.scss:1-68` and the token blocks in `src/styles/styles.scss:315-372`.
- Consolidate duplicate Everforest/glass variables into a small semantic token set. The dark default should be close to the reference direction: near-black background, high-contrast paper text, muted gray text, thin charcoal rules, and a restrained periwinkle/blue accent. The light theme must define the same semantic tokens.
- Keep Bootstrap variables wired to the semantic tokens so existing controls and ng-bootstrap modals remain readable.
- Prefer system-first stacks similar to the reference (`ui-sans-serif`, `ui-serif`, `ui-monospace`) with existing Space Grotesk/JetBrains Mono fallbacks. Do not add a font dependency just for the redesign.

Suggested token shape, with final contrast values checked in the browser:

```scss
:root {
  --site-background: #101014;
  --site-foreground: #f5f5f7;
  --site-muted: #a9a9b3;
  --site-line: #30303a;
  --site-accent: #b6c2ff;
  --site-surface: #17171d;
  --site-container: 1120px;
}
```

### 2.2 Remove visual debt instead of layering more overrides

- **Modify:** `src/styles/styles.scss`, `src/app/app.component.scss`, and affected component SCSS files.
- Replace the large `.intro-glass`, backdrop blur, glow, cursor-follow, and repeated card-hover blocks with crisp borders, small surface shifts, and one consistent elevation treatment.
- Keep the skills marquee only if it remains useful; use the existing duplicated track pattern and `prefers-reduced-motion` stop behavior. Do not add another animated background.
- Add global `:focus-visible`, `forced-colors`, and reduced-motion rules. Do not use color alone for active/focus states.
- Keep layout typography fluid with `clamp()` and use `minmax()`/CSS grid rather than fixed card heights.

### 2.3 Harden existing motion directives

- **Modify:** `src/app/shared/directives/scroll-reveal.directive.ts:18-55`.
  - If reduced motion is requested, do not leave content hidden while waiting for an observer; make the element visible immediately.
  - Guard `IntersectionObserver` for test/non-browser environments.
- **Modify:** `src/app/shared/directives/magnetic-hover.directive.ts:14-61`.
  - Restrict the effect to fine-pointer/hover-capable devices and no reduced-motion preference.
  - Retain every `Renderer2.listen` disposer and clean it up in `ngOnDestroy`.
  - Preserve keyboard focus and never require the effect to understand an action.
- **Create:** focused directive specs if coverage is not already present, using a reduced-motion/observer stub rather than a real animation.

**Gate:** `bun run lint`, `bun run test -- --watch=false`, and `bun run build` pass. No new runtime package is added; the initial bundle does not grow because of decorative code.

---

## Phase 3: Rebuild the shell, navigation, and home page around the new hierarchy

**Goal:** Make the first screen communicate identity, current work, and contact paths immediately on both mobile and desktop.

### 3.1 Simplify the application shell

- **Modify:** `src/app/app.component.html:1-36` and `src/app/app.component.scss`.
- Keep one semantic `<main>` around the router outlet; remove the nested-main structure and unnecessary fixed-height/overflow wrappers.
- Build a centered `.site-shell`/`.page-container` using a capped width and fluid horizontal padding, with a footer that can reach the viewport bottom without trapping page scroll.
- Keep route animation only if it does not block clicks or create a hidden 200–300 ms navigation delay. Respect reduced motion.
- **Modify:** `src/app/app.component.ts:38-85` to avoid document-level mouse-glow work when motion is reduced or the pointer is not fine-capable. Preserve the scroll progress indicator only if it remains useful and accessible.

### 3.2 Make navigation one source of truth and keyboard-complete

- **Modify:** `src/app/shared/navbar/navbar.component.ts:14-60`, `navbar.component.html:1-79`, and `navbar.component.scss`.
- Define the primary route links once and bind the active state/`aria-current` from the router.
- Bind the mobile disclosure’s `aria-expanded` to `bNav`, give it a real button role/type, and ensure Escape closes it and focus returns to the trigger.
- Prefer a compact editorial header: wordmark/role at left, route links in the middle, social/theme actions at right. Keep the design usable below 640px without relying on hover.
- **Modify:** `src/app/shared/navbar/nav-modal/nav-modal.component.*` only if the existing ng-bootstrap mobile modal remains the chosen implementation. If the inline disclosure replaces it, remove the duplicate component and its spec rather than keeping two navigation trees.
- Keep theme persistence and `auto` behavior from `navbar.component.ts:27-47`.

### 3.3 Redesign the home route

- **Modify:** `src/app/component/home/home.component.html:1-466`, `home.component.ts:31-238`, and `home.component.scss`.
- Replace the first-screen bento dashboard with:
  1. a generous editorial hero using the identity, role, one-sentence positioning, and two clear actions (`View selected work`, `Download resume`/`View resume`);
  2. a selected-work strip/grid driven by `featuredProjects`;
  3. a concise “what I build with”/skills section;
  4. work/education/certification proof and contribution/weather widgets below the primary portfolio story.
- Keep Weathering’s case-study entry point, contribution cards, and weather data as secondary sections. Async widgets must show skeleton/error/fallback states without blocking the hero or route navigation.
- Replace remote SVG HTML injection with a safe image request or another sanitizer-preserving representation. Prefer `<img src="/github-chart" ...>` with descriptive alt text over `bypassSecurityTrustHtml`; do not trust remote SVG markup as application HTML.
- Ensure all image alt text, external links, loading states, and buttons are meaningful. Remove inline styles from the new markup.
- Update `home.component.spec.ts` with tests for hero actions, featured project rendering, and non-blocking service failure states. Stub network services rather than calling the weather/proxy endpoints.

**Gate:** Run the unit suite, lint, and production build. Manually inspect the home route at 320px, 375px, 768px, 1280px, and 1440px widths; there must be no horizontal page overflow and the primary CTA must remain visible without hover.

---

## Phase 4: Make Projects a strong, accessible portfolio surface

**Goal:** Present verified work with clear hierarchy, real links, and enough detail to be impressive without becoming a wall of text.

### 4.1 Build the project grid from shared data

- **Modify:** `src/app/component/projects/projects.component.html:1-67` and `projects.component.scss`.
- Use one featured card spanning the grid and compact supporting cards for the remaining projects. Cards should show title, concise summary, technology tags, repository/provider label, and a real project image/icon.
- Use CSS `aspect-ratio`, `object-fit`, `minmax()`, and `clamp()`; do not rely on Bootstrap columns alone or fixed card heights.
- Move the case-study inline styles from `projects.component.html:54-62` into component SCSS and keep it visually distinct from the project grid.
- Make external repository links explicit (`Repository — GitHub`, `Repository — GitLab`) and preserve `target="_blank" rel="noopener noreferrer"`.

### 4.2 Fix image/lightbox interaction semantics

- **Modify:** `projects.component.html:9-17` and `src/app/shared/image-lightbox/image-lightbox.component.*`.
- Replace clickable `<div role="button">` elements with real buttons or keyboard-equivalent controls. Add `type="button"`, accessible labels, and visible focus styles.
- Make the lightbox a labelled dialog with an Escape/close button, correct `aria-modal`, image alt text, and no focus trap regression. Keep it usable on narrow screens.
- Add/extend `projects.component.spec.ts` and lightbox specs for project count, repository links, keyboard-open/close behavior, and alt text.

### 4.3 Remove the dead files route

- **Modify:** `src/app/app.routes.ts:21-24` to remove `/files`.
- **Delete:** `src/app/component/file/file.component.ts`, `file.component.html`, `file.component.scss`, and `file.component.spec.ts`, unless the implementation discovers a real user-facing credentials requirement that justifies replacing it with a separate page.
- Verify no navigation or README links point to `/files`.

**Gate:** `bun run test -- --watch=false`, `bun run lint`, and `bun run build` pass. The projects route renders all selected projects from the data module, and every displayed repository link is a verified public URL.

---

## Phase 5: Unify timeline, HTML resume, and generated PDF

**Goal:** Keep the long-form resume readable and ensure the downloadable PDF never falls behind the web portfolio.

### 5.1 Make the timeline data-driven and responsive

- **Modify:** `src/app/component/timeline/timeline.component.ts:1-18`, `timeline.component.html:1-69`, and `timeline.component.scss`.
- Consume `workExperience`, `education`, and certification data from `portfolio.data.ts`.
- Use a CSS grid/timeline layout that collapses to a single column on narrow screens; do not encode left/right placement in duplicated markup.
- Keep dates, company names, and achievement lists factual. Add `aria-hidden="true"` only to decorative line/marker elements.
- Add tests that assert the current employment and education entries render from data.

### 5.2 Rebuild the HTML resume from shared data

- **Modify:** `src/app/component/resume/resume.component.ts:1-72`, `resume.component.html:1-218`, and `resume.component.scss`.
- Use a readable document-like layout: compact metadata/header, responsive two-column desktop layout, one-column mobile layout, clear section rules, and a persistent but non-obstructive PDF action.
- Replace hardcoded skills, education, certificates, work bullets, and project copy with data bindings. Keep credential buttons/links available and label them clearly.
- Remove the mouse-tracking download-button positioning on touch/narrow screens; prefer a normal sticky/floating action that does not cover content or move under the cursor.
- Keep contact information consistent with the user-approved source. Do not silently update personal details from unrelated repositories.

### 5.3 Refactor PDF project rendering around shared data

- **Modify:** `src/app/shared/modal/download-resume/download-resume.component.ts:1-818` and its spec/template.
- Preserve the existing dark/alternate theme option, loading state, certificate merge option, and output filename.
- Replace the four `projN` hardcoded sections at `:539-743` with a small loop/helper that wraps each shared project title and description, calculates its height, and calls the existing page-break helper.
- Keep the credential asset paths at `:761-766` unchanged unless the file locations are deliberately migrated; never expose credential contents in the plan or logs.
- Add a focused unit test around project ordering/description input and a manual smoke test that downloads both PDF themes with and without certificates. If jsPDF is difficult to unit-test, isolate the pure text/layout input builder and test that rather than mocking every PDF primitive.

**Gate:** The HTML resume and PDF show the same project names/descriptions in the same order, `bun run build` still produces the PDF code as a lazy chunk, and the full test/lint/build trio passes.

---

## Phase 6: Metadata, PWA, CI, and final quality hardening

**Goal:** Ship the redesign as a polished, discoverable, installable static site with repeatable checks.

### 6.1 Update document metadata and PWA presentation

- **Modify:** `src/index.html` and `public/manifest.webmanifest`.
- Add a concise description, canonical URL if the production domain is confirmed, Open Graph/Twitter metadata with safe absolute assets if available, and a theme color matching the new token system.
- Update manifest `name`, `short_name`, `background_color`, `theme_color`, and screenshot labels after the new home route is visually verified. Do not fabricate screenshot dimensions; regenerate them from the finished app if the project’s existing PWA workflow supports it.
- Keep `ngsw-config.json` asset matching current image/font types and verify that new project assets are included.

### 6.2 Reconcile CI build configurations and add quality gates

- **Modify:** `.github/workflows/main.yml:26-43` and `.gitlab-ci.yml:14-24`.
- Reconcile the current branch/config mismatch before adding gates: both CI files map `develop` to `prelive` and `uat` to `uat`, while `angular.json` defines only `production` and `development`. Recommended default: use the existing `production` configuration for all currently published branches unless deployment evidence proves that `develop` or `uat` needs distinct file replacements or optimization settings. If distinct behavior is required, add explicit named configurations to `angular.json` with documented replacements rather than relying on nonexistent names.
- Verify each branch configuration with the exact command used by CI (`bun run build --configuration production`, or the explicitly added named configuration) before changing the publish step.
- After `bun ci`, run the test command in non-watch/headless mode and `bun run lint` before the production build. Keep the existing branch mapping, publish repository, and secret names unchanged.
- The publish step must not run when tests/lint/build fail. Do not print or rewrite secret values.

### 6.3 Update project documentation

- **Modify:** `README.md`.
- Document the local commands (`bun install`/`bun ci`, `bun run test -- --watch=false`, `bun run lint`, `bun run build`), route surfaces, content source (`src/app/data/portfolio.data.ts`), and the rule that project claims/assets must be verified from the source repository.
- Mention the visual direction and reduced-motion/accessibility expectations so future edits do not reintroduce the current glass/motion debt.

### 6.4 Run the final verification trio and manual matrix

Automated:

```bash
bun run test -- --watch=false
bun run lint
bun run build
```

Manual viewport matrix:

| Viewport | Check |
|---|---|
| 320×800 | No horizontal overflow; header, hero CTA, cards, lightbox, and PDF action fit. |
| 375×812 | Mobile navigation disclosure opens/closes with keyboard and touch; focus returns to trigger. |
| 768×1024 | Grid/timeline transition is intentional; no clipped tags or fixed-width widget. |
| 1280×800 | Editorial hero hierarchy, selected work, and navigation remain balanced. |
| 1440×900 | Capped shell does not stretch text/cards excessively; footer is full-width and stable. |

Accessibility/manual checks:

- Tab through skip/navigation/theme/social links, project cards, lightbox, resume actions, and footer links; every interactive item has a visible `:focus-visible` state.
- Test keyboard-only navigation and Escape behavior for mobile navigation, lightbox, and ng-bootstrap modals.
- Enable `prefers-reduced-motion: reduce`; content must not remain hidden and no marquee/cursor/reveal loop should run.
- Check light/dark/auto themes and `forced-colors: active` where available.
- Simulate weather/GitHub/GitLab failures; the hero and project content must remain usable.
- Confirm external links have safe `rel` values and descriptive accessible names.
- Verify the Angular 21/ng-bootstrap peer dependency pair and run the modal, dropdown, lightbox, and mobile-navigation smoke checks after dependency updates.
- Verify the CI branch matrix does not invoke a configuration absent from `angular.json`.
- Check initial bundle size against the baseline 736.24 kB raw total; do not add a large dependency or move the PDF generator back into the initial route.
- Run `git diff --check` and inspect `git status --short`; do not claim a clean tree while leaving untracked implementation files unreviewed.

---

## Acceptance criteria

1. `bun run test -- --watch=false`, `bun run lint`, and `bun run build` exit `0` after implementation.
2. The home route has a clear responsive identity/role statement, selected work, primary actions, and secondary proof sections without requiring network data or hover.
3. Convo, Asterisk, and Origami are present in the shared project data and rendered on the portfolio; Weathering, CR Quality Force, and GenPass are either rendered as supporting projects or explicitly archived in the same data source.
4. Project descriptions, repository links, HTML resume cards, and generated PDF cards come from one data source; no stale duplicate project list remains.
5. All route surfaces are usable at 320px–1440px widths with no horizontal page overflow, clipped primary actions, or inaccessible hover-only controls.
6. Theme switching, credential viewing/PDF inclusion, contribution/weather fallback behavior, and verified external links continue to work.
7. Reduced motion, keyboard navigation, focus visibility, dialog/lightbox semantics, image alt text, and safe external links are covered by tests or the final manual matrix.
8. The initial bundle does not grow because of decorative effects or a new dependency, and the PDF generator remains lazy-loaded.
9. Angular 21, Angular-eslint, TypeScript ESLint, and ng-bootstrap have compatible peer ranges, and CI invokes only configurations defined by `angular.json`.
10. No secrets, credential contents, private database material, or unverified project claims are added to the repository.

---

## Execution notes for the implementation agent

1. Phase ordering is strict. Do not begin visual work while the stylesheet/test and lint gates are red. Do not parallelize across phases; within a phase, independent file reads or data-entry edits may be batched.
2. Read the current file before editing it. Line numbers above are anchors from the planning snapshot, not permission to apply a stale patch after another phase changes the file.
3. Keep the current Angular standalone/lazy-route architecture. Prefer existing Bootstrap/ng-bootstrap and native CSS before adding dependencies.
4. Use cavecrew only for scoped investigation or review: `cavecrew-investigator` is appropriate for locating callers/assets, and `cavecrew-reviewer` is appropriate for a changed-file audit. Do not send the cross-cutting redesign to `cavecrew-builder`; the cavecrew guide limits that preset to obvious one- or two-file edits.
5. The shared portfolio data module is load-bearing. If a project is added or removed, update the data source and its tests first, then let the home/projects/resume/PDF consumers follow it. Never patch only one surface.
6. The GitHub contribution SVG is an untrusted external response. Do not reintroduce `bypassSecurityTrustHtml` merely to recolor it. Prefer an image URL or a proven sanitizer-preserving path.
7. Preserve credential handling and existing certificate filenames. Never log or copy credential contents. Keep CI secret substitution as deployment-only configuration.
8. Respect the user’s repository policy: do not commit, push, rewrite history, or modify the external project repositories unless separately authorized. This plan file is the only artifact created during planning.
9. Record any baseline warning that remains after the phase. Do not make a warning disappear by increasing budgets blindly or disabling lint rules.
10. At completion, re-read this plan’s referenced files, run the verification trio, inspect status/diff whitespace, and report actual command results rather than assumed results.

## Phase verification summary

| Phase | Gate | Exit criteria |
|---|---|---|
| 0. Quality gate | Test + lint + build | Stylesheet path is valid, Angular-eslint/ng-bootstrap match Angular 21, and all three commands exit 0. |
| 1. Content source | Focused data tests + full test/lint | New projects/assets are typed, unique, verified, and consumed by all surfaces. |
| 2. Visual foundation | Full test/lint/build | Semantic tokens, reduced motion, and restrained effects compile without dependency growth. |
| 3. Shell/home | Full trio + viewport smoke | Primary story works at mobile/tablet/desktop widths and async widgets cannot block it. |
| 4. Projects | Full trio + keyboard smoke | Cards, links, images, lightbox, and removed `/files` route behave intentionally. |
| 5. Resume/PDF | Full trio + PDF smoke | HTML and PDF content agree; credentials and theme options remain functional. |
| 6. Ship hardening | Full trio + CI/manual matrix | Metadata/PWA/CI/docs are updated, every CI branch uses a defined build configuration, accessibility checks pass, and final status is reviewed. |

**Planning status:** This document is the implementation handoff only. No application code or repository history was changed while creating it.
