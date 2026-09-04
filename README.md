# My Resume

A personal Angular portfolio and resume for Zhilong Liang, with selected projects, experience, and contact details.

Live site: <https://zhilong-liang-resume.vercel.app>

## Local development

This project uses [Bun](https://bun.sh/) for dependency management and scripts.

```bash
# Install dependencies for local development
bun install

# Reproduce the lockfile-based CI install
bun ci

# Run the unit tests without watch mode
bun run test -- --watch=false

# Run the CI-equivalent headless test command
bun run test -- --watch=false --browsers=ChromeHeadless

# Run Angular ESLint
bun run lint

# Build using Angular's production configuration
bun run build --configuration production
```

`bun run build` also uses the production default from `angular.json`. The development server is available with `bun run start` when a local interactive browser is useful.

CI runs `bun ci`, the non-watch/headless test suite, and lint before the production build. The `develop`, `uat`, and `master` publish branches all use the `production` configuration defined in `angular.json`. Publishing remains limited to the existing push workflows and repositories.

## Routes

The primary route surfaces are:

| Route | Purpose |
| --- | --- |
| `/` | Home and profile overview |
| `/projects` | Selected project work |
| `/timeline` | Education, work, and certification timeline |
| `/resume` | Resume view and document actions |

## Content and asset policy

`src/app/data/portfolio.data.ts` is the shared content source for the profile, contact details, projects, skills, education, certifications, and work experience used by the application and resume surfaces.

Project descriptions, technologies, links, and artwork must be verified against the relevant source repository or other public evidence before they are added. Do not invent metrics, users, release status, or production claims. Keep credentials, `.env` files, databases, private screenshots, and other non-public material out of the repository; portfolio artwork must be public and safe to redistribute.

## Visual and accessibility expectations

The interface uses a dark, editorial/system-first presentation with clear hierarchy, crisp rules, and restrained motion rather than decorative glass or cursor effects. Future changes should preserve:

- Keyboard-complete navigation and semantic interactive controls.
- Visible `:focus-visible` states, descriptive link names, and meaningful image alternative text.
- `prefers-reduced-motion: reduce`: content must remain visible, and reveal, marquee, cursor, and other looping effects must be disabled or reduced.
- Responsive layouts without horizontal overflow, plus usable contrast in dark, light, and forced-colors modes.
- Safe handling of external links and non-blocking fallbacks when remote weather or contribution data is unavailable.
