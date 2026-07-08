---
title: "The Hard Part of Football Data Wasn't the Scraping"
description: "A project note on footy-data-kit, a small English football dataset built around static files, historical tables, and verification."
pubDate: 2026-06-15
type: overview
tags:
  - football
  - data
  - web-scraping
  - javascript
  - project
---

## It Started With Promotion and Relegation

The original idea was not especially grand. I wanted to look at promotion and relegation across English football and see what patterns fell out of the data. Which clubs bounced between tiers? Which promotions actually stuck? Which teams disappeared from the league structure for long stretches? How much did the shape of the divisions change over time?

Those are easy questions to ask as a football fan and annoying questions to answer as a developer.

The information is not hidden. Most of it is sitting in public view if you are willing to click through enough season pages. But there is a big difference between information being available and data being usable. I did not want to manually inspect a page every time I had a new question, and I did not want every small football project to start by writing the same scraper again.

That is where [`footy-data-kit`](https://github.com/dills122/footy-data-kit) came from. It is a small public data project for historical English football league tables. The current release ships static JSON generated from Wikipedia overview pages, covering seasons from 1888 through 2025. The data is grouped by season and tier, with minified files for websites and a club metadata sidecar for identity and continuity work.

That shape is intentional. It is not an npm package right now, and it is not an API. It is closer to a boring data dump with a build pipeline behind it. That is a feature, not a limitation. Plain files can be downloaded, cached, committed, diffed, and dropped into a static site without any runtime dependency.

The main use case I had in mind was a data project or football site that wants the tables without owning the scraping step. `footy-stats` is one example of the kind of project that can sit on top of these files.

## The Scraper Was Only the Start

At a high level, the scraper is not doing anything magical. It fetches Wikipedia pages, finds tables, normalizes rows, and writes JSON. That is the version of the project that sounds simple in your head before you start.

Then you point it at historical football pages.

The earliest Football League seasons do not look like modern league pages. Some seasons use different section headings. The Football Alliance appears before the Second Division era settles in. Promotion and relegation are not always described in the modern way because election and re-election mattered. War seasons are their own category entirely, because some competitions were suspended, abandoned, or replaced by regional wartime structures. Later eras bring split divisions, renamed competitions, and table notes that are obvious to a person but fragile for a parser.

A human can skim a page and understand the intent. Code does not get that context for free. A small heading change, a footnote, a table order shift, or a slightly different note can be enough to produce wrong data if the parser is too confident.

That was the point where the project became more interesting to me. The scraper mattered, but the real question became: how do I know when the output is still trustworthy?

## Trusting the Output

The thing I care about most in `footy-data-kit` is not that it can scrape a page. It is that the generated data has checks around it.

The repo has normal unit tests for parser behavior, but the more important layer is the verification work around the dataset. The scripts check that season records have the expected shape, that teams and table positions are not duplicated, that played totals match wins plus draws plus losses, and that goal difference lines up with goals for and goals against. They also check that promotion and relegation lists agree with row-level flags, that the tier coverage makes sense for the era, and that generated records carry the source metadata needed to understand where they came from.

The checks go beyond a single page being parsed correctly. If a team is marked as promoted from one season, the next comparable top-flight table should make sense. If a team is relegated, it should not quietly remain where it should not be. If a club disappears from tracked league coverage, the club metadata should eventually explain that gap rather than leaving a mystery in the data.

The part I like most is the scheduled Wikipedia integration test suite. It does not try to re-scrape the entire history of English football every day. Instead, it uses a curated set of seasons that represent brittle formats and historical edge cases. Those tests run against live Wikipedia pages on a schedule, so if a source page drifts in a way the parser no longer understands, the project has a chance to notice.

That framing helped the project click for me. Wikipedia pages are an external dependency. They are useful, but they are not stable in the same way a versioned API is stable. Treating them that way makes the whole project more honest.

## Provenance Matters

Another small but important choice is that the generated files carry provenance.

The output includes a schema version, generator name, build time, git SHA, source files, and build options. Tier records also carry source metadata such as the source URL, season slug, title, league ID, table index, table count, and tier key.

That might sound like bookkeeping, but it matters when a dataset starts being used by other projects. If a release changes, I want to know whether the change came from a parser improvement, a source page update, a merge decision, or a deliberate schema change.

There is also a comparison script that can diff two FootballData exports and report season, tier, table, outcome, and metadata changes. That gives the release process a review step instead of relying on "the generated file looks different, probably fine."

For a project built out of scraped public pages, that kind of visibility is the difference between useful data and a pile of JSON that happens to exist.

## Historical Football Is Messy

One lesson from this project is that football history does not fit neatly into modern assumptions. Modern fans are used to a pyramid with clear promotion and relegation, but historical data is not always that tidy.

Clubs were elected and re-elected. Leagues changed structure. Some seasons were interrupted or suspended. Clubs changed names, dissolved, reformed, merged, or left the tracked structure for decades. A dataset has to decide how much of that history it can safely represent.

Right now, `footy-data-kit` handles some of that directly in the season data and some of it through generated club metadata. The club metadata sidecar is intentionally conservative. It mostly derives what it can from observed table rows and known season metadata. I would rather under-explain a historical club identity than encode a confident-looking guess.

That is one of the harder parts of the project. Data cleaning is not just string cleanup. It is deciding what the dataset is allowed to claim.

## Why Bother

The immediate value is simple: historical English football tables become easy to load.

With the generated files, a site or script can pull season tables, inspect tiers, find promoted and relegated teams, compare seasons, or build historical views without scraping Wikipedia directly. That opens the door for promotion and relegation timelines, club tier histories, league table visualizations, top-flight survival analysis, release-to-release data comparisons, and more careful club continuity research.

The project is still intentionally small, and I like that. It does not need to become a platform to be useful. The value is in having files that are generated in a repeatable way, checked before release, and easy for another project to consume.

The big lesson is that scraping is easy until correctness matters.

It is one thing to pull a table off a page. It is another thing to support many eras, handle historical exceptions, preserve provenance, test against live source drift, and ship data that another project can depend on. The annoying edge cases are where the project gets better, because every weird season forces a decision. Should this become parser logic? A season rule? A metadata placeholder? A fixture? Or is it something the dataset should intentionally ignore?

Those decisions are the real work, and they are also what make the project worth writing about. I started with a football question. I ended up with a small data pipeline, a pile of historical edge cases, and a much better appreciation for how fragile scraped data can be once you actually care about the result.

## Where It Goes Next

The next phase is less about making the scraper clever and more about improving confidence around the data. I want to keep expanding the curated integration fixtures, improve release diffs, and add more source-backed club history where the generated metadata cannot safely explain long gaps or identity changes on its own.

That is probably the long-term shape of `footy-data-kit`: boring files, careful generation, and enough verification to make football data projects easier to start.
