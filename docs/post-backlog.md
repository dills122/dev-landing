# Post Backlog

## Needs Research: Personal Site Timeline

Working title: **Why I Keep Rebuilding Personal Sites**

Goal: build a walkthrough/timeline article covering the different versions of my personal sites, portfolio sites, and blogs. This should be more researched than a quick-hit post because it needs screenshots, old repo context, and a clear story.

Research tasks:

- Get the old ASP.NET personal site running locally, or at least render enough of it to capture accurate screenshots.
- Revisit `dills122/Personal_Website` and document the WebForms-era portfolio, project pages, and admin/database assumptions.
- Revisit `dills122/Blog` and document the Jekyll/GitHub Pages era.
- Revisit `dills122/dsteele.dev` and document the later Jekyll portfolio/blog shell.
- Find any additional portfolio/blog iterations in old repos, backups, screenshots, or deployment history.
- Capture screenshots for each version at comparable desktop/mobile widths.
- Note what each rebuild was trying to learn: ASP.NET/WebForms, Jekyll, GitHub Pages, static publishing, Astro, accessibility, minimal design, deployment automation.

Possible structure:

1. The ASP.NET/WebForms portfolio
2. The first GitHub Pages blog
3. The later Jekyll portfolio shell
4. The current Astro landing page and blog
5. What kept changing, and what stayed the same

Angle: personal sites are not just vanity projects. They are low-risk places to test deployment, content systems, design taste, accessibility, performance, and how your own thinking has changed.

## Needs Research: Running Angular Inside Zendesk As A Custom App

Working title: **Running Angular Inside Zendesk As A Custom App**

Angle: lessons from embedding a real frontend framework inside a constrained third-party app surface. Cover iframe constraints, Zendesk app lifecycle, build output, routing assumptions, authentication/context handoff, styling isolation, and what breaks when a framework expects to own the whole page.

Research inputs:

- Find the old Zendesk custom app notes/code if available.
- Identify which Angular version was used.
- Capture the build/deploy shape and any Zendesk app manifest details.
- Document what was easy, what was fragile, and what I would do differently now.

## Draft: Nx And Angular Generators/Schematics

Working title: **Nx And Angular Generators: Boring Automation That Pays Off**

Angle: generators/schematics are not just scaffolding. They encode team conventions, reduce drift, and make migrations safer when an Angular workspace has lots of apps/libs.

Possible sections:

1. Why manual consistency fails
2. What generators are good at
3. Where generators become overkill
4. How Nx changes the mental model
5. Practical examples: feature shells, libraries, routes, tests, linting defaults

## Needs Research: pnpm Supply Chain Mitigations

Working title: **pnpm Supply Chain Mitigations**

Angle: a practical overview of how package-manager choices can reduce supply-chain risk. Focus on lockfiles, strict installs, dependency isolation, lifecycle scripts, overrides, package provenance, and what pnpm changes compared with npm/yarn.

Research inputs:

- Validate current pnpm security features and flags.
- Look at `pnpm approve-builds`, ignored build scripts, lockfile behavior, and workspace controls.
- Keep this practical rather than alarmist.
- Include a small checklist teams can actually adopt.

## Needs Source Material: Package Managers Walkthrough

Working title: **A Walkthrough Of JavaScript Package Managers**

Angle: turn the work presentation into a public technical overview. Explain npm, yarn, pnpm, lockfiles, dependency trees, hoisting, workspaces, install performance, supply-chain concerns, and choosing defaults for teams.

Research inputs:

- Locate the work presentation and extract the outline.
- Remove anything company-specific.
- Decide whether this should be one long post or a series.
- Add current package-manager details before publishing.

## Draft: ASP.NET I Hardly Knew Ya

Working title: **ASP.NET I Hardly Knew Ya**

Angle: a reflective post on the weird parallels between old ASP.NET/WebForms patterns and modern frontend frameworks. Not a nostalgia post exactly; more about how ideas come back in different shapes.

Possible parallels:

- Master pages and modern layouts
- Server controls and components
- ViewState and client/server state synchronization
- Code-behind and component logic
- Postbacks and server actions/forms
- Validation controls and schema/form libraries
- UpdatePanels and partial UI refreshes
- WebForms pain points that modern frontend still echoes

Question to answer: which ideas were ahead of their time, which were accidental complexity, and which have reappeared in better forms?
