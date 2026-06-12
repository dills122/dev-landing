---
title: "Design Principles Behind This Site"
description: "A quick note on the constraints and decisions behind this minimal developer landing page and blog."
pubDate: 2026-06-12
type: overview
tags:
  - design
  - accessibility
  - astro
  - frontend
---

## Start With The Actual Job

This site is not trying to be a product landing page. It is not trying to sell a course, collect leads, or explain a startup. It is a personal developer site with a small blog attached.

That means the design should do a few things well:

- say who I am
- establish what kind of work I do
- make links easy to find
- make writing easy to browse
- stay fast, readable, and accessible

Everything else is optional.

## Minimal Does Not Mean Empty

The goal was a minimal site, but not a blank one. A minimal site still needs rhythm, hierarchy, strong spacing, visible focus states, responsive behavior, and enough visual character to feel intentional.

The dark palette gives the site a quieter feel. The warm accent and green action color keep it from becoming flat. The monospace details make the menu, metadata, and tags feel more technical without turning the whole thing into a terminal gimmick.

## Content First, Then Motion

The menu animation came after the content structure was already working. That ordering matters.

The core page still works as a normal document:

- semantic header and nav
- skip link
- real links
- real headings
- readable article content
- visible focus states

The animated menu adds personality, but it is not the foundation of the experience.

## The Menu Is Intentional Friction

The landing page does not need a large horizontal nav. The page is already small, and the primary content should stay dominant. Moving links into a menu keeps the surface quiet.

The menu prints links like a small command list. It is minimal, but it still gives the site a memorable interaction. On repeat opens, the animation speeds up so the effect does not become annoying.

That is the balance I wanted: distinctive once, efficient after that.

## Blog Pages Need More Width

The first pass of the blog was too narrow. That is a common problem when a landing page layout gets reused for long-form writing. Hero copy and article content have different needs.

Posts need room for:

- code blocks
- table of contents
- tags
- headings
- paragraphs with comfortable line length

The fix was not to make all text run edge to edge. The better split was to let structural elements and code blocks use a wider content area while keeping paragraphs constrained enough to read.

## Accessibility Is A Design Constraint

Accessibility was not a separate cleanup step. It affected the design from the start:

- keyboard-visible focus states
- `aria-expanded` on the menu button
- semantic `nav`, `main`, `article`, and `footer`
- reduced-motion handling
- color contrast against the dark background
- mobile-first spacing and layout checks

Those details are easy to skip on a small personal site, but they are also easier to get right there.

## The Short Version

The site is built around restraint: fewer sections, clearer content, stable layout, deliberate motion, and enough personality to feel owned. That is usually the kind of personal site I like most.
