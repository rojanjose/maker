# Makers Manual

Editorial buying guides for DIY enthusiasts, styled like a newspaper front page.
Articles are written in **Markdown** and rendered through Jekyll layouts — GitHub
Pages runs Jekyll natively, so deployment is just a git push.
Spec: [docs/specs/requirements.md](docs/specs/requirements.md).

Live target: **https://rojan.dev/maker**

## Repo structure

```
├── _config.yml                 # Site title, tagline, baseurl (/maker)
├── _layouts/
│   ├── default.html            # Chrome: masthead, nav, search, footer
│   └── guide.html              # Article template: kicker, headline, byline,
│   │                           #   hero figure, auto-generated ToC rail
├── index.html                  # Front page (layout: default)
├── contents.html               # Manual-style Table of Contents
├── sections/
│   └── 3d-printers.html        # Section front (one per topic)
├── guides/
│   ├── 3d-printers.md          # ★ Articles are Markdown with front matter
│   └── how-we-test.md
├── assets/
│   ├── css/style.css           # All styling
│   ├── js/search.js            # Client-side search
│   ├── js/search-index.js      # Hand-maintained search index
│   └── images/*.svg            # Placeholder illustrations — replace with photos
├── Gemfile                     # Local preview only (Jekyll); not needed to deploy
└── docs/specs/requirements.md  # Requirements specification
```

## Writing an article

Create `guides/<topic>.md` with front matter; the `guide` layout supplies all the
page chrome and builds the "In this guide" ToC automatically from your `##`
headings:

```markdown
---
layout: guide
title: The Best Widgets for Makers
description: One-line summary for search engines.
nav: 3d-printers            # which nav item to highlight
section: 3D Printers        # kicker text
section_url: /sections/3d-printers.html
subhead: One-sentence dek under the headline.
author: rojan.dev
published: 2026-07-12
updated: 2026-07-12         # omit until first refresh
hero: /assets/images/hero.svg
hero_alt: Alt text
hero_caption: Cutline under the hero image.
hero_credit: "Photo: Makers Manual"
# toc: false                # uncomment to skip the ToC rail (e.g. short articles)
# audio: /assets/audio/x.mp3 # optional narrated audio; without it, the article
#                            # gets a browser text-to-speech "Listen" button
---

## First section {#custom-anchor}

Body prose in Markdown. Pin heading anchors with {#id} so links stay stable.

Raw HTML blocks work anywhere markdown falls short — "Our Pick" callouts,
the comparison table and video embeds are HTML snippets (copy them from
guides/3d-printers.md).
```

Then add the article to `assets/js/search-index.js`, `contents.html`, and its
section front.

## Preview locally

```sh
bundle install    # first time only (gems go to vendor/bundle)
bundle exec jekyll serve --port 4173
# open http://localhost:4173/maker/
```

Requires Ruby ≥ 3 (`brew install ruby`, then put `/opt/homebrew/opt/ruby/bin`
on PATH). None of this is needed to deploy — GitHub Pages builds the site itself.

## Deploy to GitHub Pages

1. Create a GitHub repo named **`maker`** (the repo name becomes the URL path:
   `rojan.dev/maker`), push this directory to `main`.
2. Repo → Settings → Pages → Source: “Deploy from a branch”, branch `main`,
   folder `/ (root)`. GitHub Pages detects Jekyll and builds automatically.
3. For the custom domain, `rojan.dev` must be configured as the custom domain on
   your GitHub Pages **user site** (`rojanjose.github.io`); project sites like
   this one then resolve under it.

## Placeholder content

Product names, specs, prices, body copy, all images, and the embedded video are
**placeholders** to demonstrate structure and rendering. Verify or replace before
publishing.
