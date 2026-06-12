# Dylan Steele Landing

Personal landing page and technical writing site for Dylan Steele. The site is built with Astro and published as a static GitHub Pages site on a custom domain.

## Stack

- Astro 6
- TypeScript
- Plain CSS
- GitHub Pages
- Pa11y CI for WCAG-oriented accessibility checks
- Lighthouse CI for performance, accessibility, best-practices, and SEO checks

## Requirements

- Node.js 24 or newer
- npm

## Getting Started

```sh
npm ci
npm run dev
```

The local dev server runs at:

```text
http://127.0.0.1:4321/
```

Astro may choose the next open port if `4321` is already in use.

## Scripts

| Command                    | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev`              | Start the Astro dev server.                                 |
| `npm run check`            | Run Astro type and content checks.                          |
| `npm run format`           | Format the repo with Prettier.                              |
| `npm run format:check`     | Check formatting without writing files.                     |
| `npm run lint`             | Run Astro checks and Prettier checks.                       |
| `npm run build`            | Check and build the static site into `dist/`.               |
| `npm run preview`          | Preview the production build locally.                       |
| `npm run audit:a11y`       | Build, preview, and run Pa11y CI against the local sitemap. |
| `npm run audit:lighthouse` | Build and run Lighthouse CI against representative pages.   |
| `npm run audit:site`       | Run both accessibility and Lighthouse audits.               |

## Project Layout

```text
src/components/        Shared Astro components
src/content/blog/      Markdown blog posts
src/layouts/           Page and blog layouts
src/lib/               Small shared utilities
src/pages/             Astro routes and generated feeds
src/styles/global.css  Site-wide styles
public/                Static assets copied into the build
docs/                  Project notes and deployment docs
```

## Quality Gates

Use this before opening a PR:

```sh
npm run lint
npm run build
```

Use this when changing templates, navigation, page structure, or major CSS:

```sh
npm run audit:site
```

The accessibility audit uses Pa11y CI with WCAG 2 AA rules. The Lighthouse audit writes reports to `.lighthouseci/` and uses local filesystem output instead of public temporary storage.

## Deployment

Deployment is handled by GitHub Actions and GitHub Pages. See [docs/deployment.md](docs/deployment.md) for setup details and notes about the Astro `site` setting.
