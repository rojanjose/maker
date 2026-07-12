# Makers Manual — Requirements Specification

**Status:** Accepted — all open questions resolved
**Date:** 2026-07-12
**Source:** Derived from a product-ideation conversation (Claude Desktop session, July 2026)

---

## 1. Overview

Makers Manual is an online editorial guide that helps DIY enthusiasts pick the right
products for their projects — a Wirecutter-style recommendation site with the visual
identity of a newspaper front page (nytimes.com). The site launches with a single
category, **3D printers**, and is designed to grow into additional maker-tool
categories (e.g., CNC routers, laser cutters) over time.

## 2. Goals

- **G1.** Publish trustworthy, opinionated product-picking guides for DIY/maker tools.
- **G2.** Launch with 3D printers as the first fully built-out category.
- **G3.** Present content with an editorial, newspaper-front-page aesthetic modeled on
  nytimes.com — not a documentation or blog theme.
- **G4.** Host for free on GitHub Pages with a simple publish workflow.

## 3. Decisions already made

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Host on **GitHub Pages** | Free, simple, fits a static content site |
| D2 | Build a **custom NYT-style layout** rather than adopt an off-the-shelf theme | Stock themes only approximate the NYT look; a custom static HTML/CSS (or Jekyll) layout can match it and bake in product-guide components |
| D3 | **3D printers** is the first content category | Owner's chosen starting point |
| D4 | Site name and masthead: **"Makers Manual"** | Confirmed by owner |
| D5 | Stack: **Jekyll** (GitHub Pages' native generator) — articles in **Markdown**, page chrome in shared HTML layouts. *Revised 2026-07-12; supersedes the original plain-HTML/CSS choice.* | Owner wants to author articles in Markdown; Jekyll renders them through templates with zero deploy tooling (GitHub Pages builds automatically) |
| D6 | URL: **https://rojan.dev/maker** | GitHub Pages project site served under the owner's rojan.dev custom domain |
| D7 | Sub-categories within a topic (e.g., FDM vs. resin) are **sections within one guide**; distinct topics (e.g., photography) get **their own site section** | One authoritative guide per topic keeps picks easy to compare |
| D8 | Guides are **dated and periodically refreshed** to the latest products on the market | Visible dates for trust, evergreen accuracy over time |

### Rejected alternatives

- **Minimal Mistakes, Just the Docs, Chirpy** — rejected by the owner; too
  docs/blog-like, wrong aesthetic.
- **jekyll-news, The Interesting Times, Mediumish** — newspaper-style themes that get
  closer, but none is pixel-faithful to the NYT look; superseded by the custom-layout
  decision (D2).
- **Astro / Docusaurus with filterable product tables** — noted as a possible future
  direction if the site outgrows a static Jekyll/HTML approach; overkill for launch.

## 4. Functional requirements

### 4.1 Homepage (newspaper front page)

- **FR-1.** The homepage shall present a newspaper-front-page layout: a serif masthead
  (Cheltenham-style), a section navigation bar, a lead-story column, and a
  multi-column grid of guide cards with varying headline sizes and thin rules between
  columns.
- **FR-2.** The homepage shall feature one guide as the lead story, with the remaining
  guides arranged as cards in the grid.

### 4.2 Sections and navigation

- **FR-3.** Content shall be organized into topic sections (analogous to NYT sections
  such as Tech or Business). The launch section is **3D Printers**; each future
  distinct topic (e.g., **Photography**) becomes its own section.
- **FR-4.** The section navigation shall support adding new categories without
  redesigning the layout.
- **FR-16.** The site shall provide a dedicated Table of Contents page, styled like a
  printed manual's ToC (numbered chapters with dot leaders), hyperlinking every
  section, article, and notable in-article heading. *(ID out of sequence: added after
  FR-15; requirement IDs are stable, not positional.)*

### 4.3 Guide pages (feature articles)

- **FR-5.** Each product guide shall render as a feature-style article with a
  headline, subhead, byline, and a featured image with cutline and photo credit.
- **FR-6.** Each guide shall include a **product comparison table** covering the
  candidates evaluated.
- **FR-7.** Each guide shall include **"Our Pick" callouts** highlighting the top
  recommendation(s) — e.g., "Best Budget 3D Printer," "Best for Beginners."
- **FR-8.** Sub-categories within a topic (e.g., FDM vs. resin 3D printers) shall be
  presented as sections **within that topic's single guide**, not as separate guides.
- **FR-9.** Each guide shall display its original publication date and a
  **"last updated" date**, since picks are periodically refreshed.
- **FR-10.** The first published guide shall be the 3D printer guide, containing a
  comparison table and the owner's top picks.

### 4.4 Media and search

- **FR-11.** Guides shall support embedded images throughout the article body, each
  with a cutline and photo credit.
- **FR-12.** Guides shall support embedded video (hosted embeds such as YouTube, or
  self-hosted HTML5 video files in the repository).
- **FR-13.** The site shall provide client-side search across all guides, sections,
  and notable in-guide anchors (matching titles and keywords), with no backend or
  external search service.
- **FR-17.** Each guide shall offer audio playback at the top of the article: a
  narrated audio file when one is supplied in front matter, otherwise a
  "Listen to this article" control using the browser's built-in speech synthesis
  (no external services). *(ID out of sequence; requirement IDs are stable, not
  positional.)*

### 4.5 Content management

- **FR-14.** Guides shall be authored as Markdown files with front matter (title,
  subhead, author, dates, hero image); shared layouts render them to the site's
  visual design, so publishing or updating a guide is a git commit/push.
- **FR-15.** The structure shall support periodically refreshing a guide's picks to
  the latest products on the market without restructuring the site, with the
  "last updated" date (FR-9) bumped on each refresh.

## 5. Non-functional requirements

- **NFR-1. Hosting/cost:** The site shall be a static site deployed on GitHub Pages
  at no hosting cost, served at **https://rojan.dev/maker**. GitHub Pages runs the
  Jekyll build itself; no build tooling is required to deploy (local Jekyll is
  optional, for preview only).
- **NFR-2. Design fidelity:** The layout shall read as an editorial newspaper front
  page — visually closer to nytimes.com than any stock theme approximation.
- **NFR-3. Responsiveness:** The multi-column grid shall adapt gracefully to tablet
  and mobile widths.
- **NFR-4. No heavy tooling:** The stack shall stay simple at launch — Jekyll with
  hand-written layouts, no plugins beyond GitHub Pages defaults; frameworks such as
  Astro or Docusaurus remain explicitly deferred (see Rejected alternatives).
- **NFR-5. Imagery:** Layout and templates shall accommodate product photography
  prominently, since product guides depend on images.

## 6. Out of scope (for launch)

- Filterable/sortable product tables or interactive comparison widgets.
- Additional product categories beyond 3D printers (structure must allow them, but
  content is deferred).
- Comments, user accounts, or any dynamic backend.

## 7. Proposed next steps

1. Initialize the git repository and GitHub Pages deployment. To serve at
   **rojan.dev/maker**, publish as a project site in a repo named `maker` with
   rojan.dev configured as the custom domain on the owner's GitHub Pages user site
   (project pages then resolve under that domain).
2. Mock up the homepage layout: masthead, section nav, lead story, guide-card grid.
3. Draft the 3D printer guide: FDM and resin sections, comparison table, "Our Pick"
   callouts, and publication/last-updated dates.
