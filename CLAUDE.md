# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Jekyll site + RSS podcast feed for "Life on the Film Set" podcast (lifeonthefilmset.com), built on a Gulp-driven starter (`nbpayne/jekyll-starter`). Hosted on GitHub Pages (`repository: nbpayne/lifeonthefilmset` in `_config.yml`).

## Setup

- Ruby version pinned in `.ruby-version` (3.3.4); Node version pinned in `.nvmrc` (`lts/*`).
- `bundle install` — installs Jekyll + `github-pages` gem.
- `yarn` (or `npm install`) — installs Gulp toolchain deps.
- `bower install` — installs client deps (Bootstrap, jQuery) into `bower_components/`.

## Common commands

- `gulp serve` (or bare `gulp`) — the only command normally needed during development. Runs `clean` → `fontawesome` → `css` + `wiredep` → `js` → `jekyll-serve` + `watch` in sequence, then serves at `http://127.0.0.1:4000` with livereload and `--drafts --future` so draft/future-dated posts are visible.
- `gulp css` — compiles `__sass/*.scss` (app, `vendor/`, `fontawesome/`) to minified CSS + sourcemaps in `css/`.
- `gulp js` — runs `__includes/*.html` through `gulp-useref` to concatenate/minify the `<script>` blocks it finds into `js/vendor.min.js` / `js/app.min.js` / `js/bootstrap.min.js`, and writes the resulting markup to `_includes/`.
- `gulp wiredep` — injects bower deps into `__includes/head.html` / `foot.html` between the `<!-- bower:css -->` / `<!-- bower:js -->` comment blocks.
- `gulp fontawesome` — copies Font Awesome webfonts from `node_modules` into `fonts/`.
- `gulp clean` — deletes `_includes/head.html`, `_includes/foot.html`, and everything in `css/` and `js/`.
- There is no test suite, linter config, or CI in this repo.

## Architecture: the build-source vs. Jekyll-serve split

This repo has two parallel sets of "head/foot" files, and they are not interchangeable:

- `__includes/head.html` and `__includes/foot.html` are the **editable sources**. They contain the `<!-- bower:css|js --> ... <!-- endbower -->` and `<!-- build:js ... --> ... <!-- endbuild -->` markers that `wiredep` and `useref` key off of.
- `gulp js` and `gulp wiredep` process those sources and write the **built output** into `_includes/head.html` and `_includes/foot.html` — which is what Jekyll actually includes via `{% include head.html %}` / `{% include foot.html %}` in `_layouts/default.html`.
- Never hand-edit `_includes/head.html` or `_includes/foot.html` directly — those edits are overwritten by the next `gulp js`/`wiredep` run. Edit `__includes/*.html` instead, then rebuild (or just run `gulp serve`, which rebuilds automatically).
- Similarly, `__sass/` is SCSS source; `css/` is compiled, minified output — edit `.scss`, not the generated `.min.css`.
- `__js/main.js` is the one hand-written app JS file; it gets pulled into `js/app.min.js` by the `build:js` block in `__includes/foot.html`.

`_includes/head.html` (not `__includes/`) also directly contains site-wide `<head>` additions unrelated to the bower/build pipeline (Google Fonts, `{% seo %}`, favicon) — those can be edited directly since they aren't touched by the gulp build.

## Content model: episodes as posts

Podcast episodes are Jekyll posts in `_posts/`, one markdown file per episode, with front matter driving both the web page and the RSS feed:

- `podcastSeason` / `podcastEpisode` — used to build the episode artwork path `/img/episodes/{season}.{episode}.png` (and `-2x.png` for the RSS `<itunes:image>`), and to sort episodes (`sort: "podcastEpisode"`) on the homepage and in `podcast.xml`.
- `podcastDate` — compared against `site.time` (both truncated to `%Y%m%d`) to decide whether an episode is live yet. Future-dated episodes render a "Coming on {date}" placeholder instead of the player/listen link, and are filtered out of `podcast.xml` entirely. `gulp serve` passes `--future` to `jekyll serve` so these are still visible locally.
- `episodeType` — `"full"` episodes are the ones listed on the homepage (`where: "episodeType", "full"`) and get working Previous/Next pagination in `_layouts/post.html`; non-full posts (e.g. trailers) are excluded from that list and have their pagination links disabled.
- `audioFile`, `podcastBytes`, `podcastDuration` — map to the actual audio asset under `audio/{season}/{episode}/{audioFile}.mp3` and populate the `<enclosure>` / `<itunes:duration>` tags in `podcast.xml`.
- `podcast.xml` and `feed.xml`/`sitemap.xml` (via `jekyll-feed`/`jekyll-sitemap` plugins) are generated through `_layouts/xml.xml`, a bare passthrough layout — new XML feeds should follow that same `layout: xml` pattern.

## Other data-driven content

- `_data/hosts.yaml` drives the "Hosts" section on the homepage (`_layouts/home.html`) — each entry needs a matching photo at `img/hosts/{name | slugify}.jpg`.
- `_includes/platforms.html` is the shared "listen on" badge row (Apple Podcasts, YouTube, Spotify, RSS), included from both the homepage subscribe section and each episode page.
- Social links (Instagram/TikTok/Facebook icons) live in `_includes/header.html`; Google Analytics snippet is `_includes/ga.html`.
