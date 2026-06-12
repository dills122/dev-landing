---
title: "Getting Started With Astro"
description: "A quick overview of why Astro is a strong default for small personal sites, blogs, docs, and content-heavy projects."
pubDate: 2026-06-12
type: overview
tags:
  - astro
  - frontend
  - static-sites
  - markdown
---

## Why Astro Clicked For Me

Astro feels like a very practical answer to a problem a lot of frontend projects eventually run into: not every site needs to be a full client-side application.

That sounds obvious, but it is easy to forget. A portfolio, blog, documentation site, marketing page, or project archive usually needs great HTML, strong content primitives, fast pages, and just enough interactivity where it matters. Astro starts from that direction instead of assuming the whole page should be JavaScript first.

That is the part I like most. Astro lets the boring parts stay boring.

## What To Know First

Astro pages are file-based. A file in `src/pages` becomes a route. Components can render HTML by default. Markdown content can live in collections. Dynamic behavior can still exist, but it has to be added deliberately.

That is a healthy default for a site like this one.

```txt
src/
  components/
  content/
  layouts/
  pages/
  styles/
```

The structure stays easy to reason about. Pages handle routes, layouts handle repeated document structure, components handle reusable UI, and content collections handle Markdown with typed frontmatter.

## Content Collections Are The Feature

For a blog, Astro content collections are the thing I would reach for first. They let posts stay as Markdown files while still giving the site a typed contract for metadata.

```ts
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});
```

That gives you a clean writing workflow without turning the site into a database-backed CMS. For technical writing, that matters. Posts stay reviewable in git, easy to move, and easy to edit in any text editor.

## Islands Keep Interactivity Honest

Astro's island model is also a good mental reset. You do not start by hydrating everything. You start with HTML, then hydrate the pieces that actually need to run in the browser.

On this site, most of the page is static. The menu animation and copy buttons need browser behavior, so those get scripts. The article body, headings, tags, and footer do not need a client runtime.

That separation keeps the site simpler.

## The Gotchas

The main thing to watch is deployment paths. If the site is hosted under a GitHub Pages project path, assets and internal links need to respect `base`.

```js
const base = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
```

That small detail prevents a lot of broken links when moving between local development and production.

## Where Astro Fits

Astro is a strong default for:

- personal sites
- blogs
- documentation
- project archives
- content-heavy marketing pages
- static pages with a little client-side behavior

It is not trying to replace every app framework. If the primary thing you are building is a highly interactive application, another stack may still make more sense. But for the web pages around your work, Astro is hard to argue with.

## The Short Version

Astro gives me the pieces I want for this kind of site: clean HTML, Markdown content, typed metadata, fast static output, and deliberate interactivity. That combination is boring in the best possible way.
