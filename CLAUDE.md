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
- `site/data/market.json` (`books`): the **price guide**: 50 real Heritage Auctions results for CGC-graded copies
  (researched 2026-10-20). Fields: `id`, `publisher`, `title`, `issue` (string), `year`, `grade`, `gradeNumber`,
  `graded`, `price` (average of `sales`), `sales` [{price, date}], `lastSale`, `note`, `source`, `sourceUrl`.
  These are market results, never presented as the owner's own sales. Update by re-checking real results.
- `site/data/sold.json` (`sales`): the owner's **own** sales; the home page's "Sold by Four Horsemen" section shows
  only when it has entries. Same fields plus `soldOn` (YYYY-MM-DD); optional `photo` (`photos/<file>.jpg` under
  `site/`). Only real sales the owner reports go here; invented sales never do (owner asked 2026-10-20, Claude
  declined and built the honest price guide instead).
- Owner: Matthew Malleo, Tucson, Arizona (named on the site at his request: hero "Based in Tucson, buying and selling
  across Southern Arizona", contact card, footer, meta description).
- Contact form: POSTs JSON to `/api/contact` (name, email, phone, intent, books, message, hidden `website` trap,
  `t` = page-open time). OMV container `fourhorsemen-contact` (OMV-Docker-Rebuild `compose/proxy-security`) emails it
  to admin@fourhorsemencomics.net with Reply-To = the visitor. Rate limits: nginx 6/min, service 5/hour per visitor.
- Contact email: `site/data/settings.json` `contactEmail` = admin@fourhorsemencomics.net (mailbox on the mail
  server since 2026-10-20, see Mail-Server-Recovery).
- Logo: the owner's artwork, cut out of its gray background: `assets/logo-hero.webp` (hero) and
  `assets/logo-header.webp` (header/footer); `assets/og-image.jpg` for link previews; `assets/logo.svg` is the
  favicon (horseshoe). Covers are drawn by `site/assets/app.js` (no publisher artwork may be added).
- Fonts: Google Fonts (Bangers for display, Archivo for text).
- Caching: `/assets/` is cached for an hour (browsers and Cloudflare). When style.css or app.js change, bump the
  `?v=N` on their links in every HTML page so visitors get the new files at once.

## Log (newest first)
- 2026-10-20: Owner card links his eBay account abandcomics (member since 2011, 100% positive, checked 2026-10-20 on ebay.com/usr/abandcomics). Re-check if the feedback changes.
- 2026-10-20: Tucson / Southern Arizona added; contact form now sends straight to admin@ (no mail app needed), CSS/JS ?v=5.
- 2026-10-20: v2: owner's logo, comic-style redesign, "we buy all comics, keys are our specialty / you never know" message, 50-book price guide from real auction results (prices.html; sold.html redirects), samples removed, contact email live.
- 2026-10-20: Site v1 built (home, sold archive, sell steps, grading guide, contact form), 50 sample sales.
