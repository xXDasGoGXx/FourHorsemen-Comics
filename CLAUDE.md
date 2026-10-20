# FourHorsemen-Comics: notes for Claude (read this first)

Owner works from an iPad (see HomeCommander-Claude `CLAUDE.md`). This repo is the public website
**https://fourhorsemencomics.net** (owner's comic buying/selling business: "we buy, we sell, everyone wins").

## How it goes live
- Everything under `site/` is the website. Static files only, no build step.
- **Publishing = merging to `main`.** On OMV, container `fourhorsemen-sync` (compose project
  `proxy-security`, file in OMV-Docker-Rebuild `compose/proxy-security/compose.yaml`) fetches `main` every
  2 minutes, copies `site/` to `releases/<commit>` and switches `current` to it; `fourhorsemen-web`
  (nginx, OMV port 8095) serves it. NPM proxies `fourhorsemencomics.net` and `www.` to 192.168.2.181:8095.
- Check what is live: `https://fourhorsemencomics.net/version.txt` = first 12 characters of the live commit.
- Roll back = revert the commit on `main`. The repo is public on purpose (OMV pulls it without keys);
  never commit secrets, customer names or addresses.

## Content
- Sold comics: `site/data/sold.json` (`sales` list). Fields: `id` (unique), `publisher`, `title`, `issue`
  (string), `year`, `grade` (e.g. `VG+`), `gradeNumber` (4.5), `graded` (true = CGC slab), `price` (whole
  dollars), `soldOn` (YYYY-MM-DD), `note` (why it matters), optional `photo` (`photos/<file>.jpg` under
  `site/`) and `sample`.
- The 50 listings from 2026-10-20 are **samples** (`"sample": true`, shown with a "Sample" stamp). Real
  sales must have `sample` false or absent. Never remove the stamp from invented sales: the owner's real
  sales replace them.
- Contact email: `site/data/settings.json` `contactEmail`. Empty = the form says the address is being set up.
- Covers are drawn by `site/assets/app.js` (no publisher artwork or logos may be added; owner photos of
  his own books are fine via `photo`).
- Fonts: Google Fonts (Big Shoulders Display, Archivo).

## Log (newest first)
- 2026-10-20: Site v1 built (home, sold archive, sell steps, grading guide, contact form), 50 sample sales.
