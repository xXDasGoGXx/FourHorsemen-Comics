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

## Content (v3, 2026-11-14)
- Pages: `index.html` (hero "I buy comics. I sell comics.", Key of the Day, what I buy, how it works, want lists and
  selling tips, why there's no price list, about Matthew + FAQ, contact form), `learn.html` (plain-English value guide:
  keys, eras, grading scale, raw vs slabbed, variants and reprints, why prices move, how to check sold prices, storage),
  `404.html`. `prices.html` redirects to `learn.html`, `sold.html` to the front page.
- Voice: first person ("I"), Matthew speaking. Only promises the owner confirmed (cash in person around Tucson,
  PayPal for shipped books, straight answer even if he passes, want lists, offers based on current sales).
- **No prices anywhere.** The owner removed the Heritage price guide on 2026-11-14 because old sale prices set false
  expectations ("a comic could've sold for $1000 a year ago but right now it's only 300"). Do not bring back price
  lists or dollar estimates per book.
- **No sold section** until the owner has real sales and asks for it (removed with `data/sold.json`). Invented sales
  are never added (owner asked 2026-10-20, Claude declined).
- `site/data/keys.json`: Key of the Day list (title, issue, cover-date year, publisher, one-line fact; no prices).
  The page shows entry (days since 1970 mod count), so it changes every day with no upkeep. Facts must be well
  established; add or fix entries there only.
- Images: the owner's own photos are welcome (put them under `site/assets/` or `site/photos/`). Never add publisher
  cover scans or other sellers' listing photos.
- Owner: Matthew Malleo, Tucson, Arizona; eBay `abandcomics` since 2011, 100% positive (checked 2026-10-20).
- Phone (owner's cell, published at his request 2026-10-20): (520) 272-3253, `tel:+15202723253`, in the header pill,
  hero, contact section and footers (and the car magnet).
- Contact form: POSTs JSON to `/api/contact` (name, email, phone, intent, books, message, hidden `website` trap,
  `t` = page-open time). OMV container `fourhorsemen-contact` (OMV-Docker-Rebuild `compose/proxy-security`) emails it
  to admin@fourhorsemencomics.net with Reply-To = the visitor. Rate limits: nginx 6/min, service 5/hour per visitor.
- Logo: the owner's artwork, cut out of its gray background: `assets/logo-hero.webp` (hero) and
  `assets/logo-header.webp` (header/footer); `assets/og-image.jpg` for link previews; `assets/logo.svg` is the favicon.
- Fonts: Inter from Google Fonts (`opsz` axis; headings use the display size). Colors are tokens in `style.css`.
- Caching: `/assets/` is cached for an hour (browsers and Cloudflare). When style.css or app.js change, bump the
  `?v=N` on their links in every HTML page (now `?v=7`).

## Log (newest first)
- 2026-11-14: v3 redesign at the owner's request ("too much like a template... juvenile"): calmer grown-up look, first person, price guide and drawn covers removed, Key of the Day, learn.html guide. ?v=7.
- 2026-10-20: Phone number added site-wide (tap to call); CSS/JS ?v=6.
- 2026-10-20: Owner confirmed all 'Why everyone wins' promises. Deals are local first (Tucson, cash); shipping + PayPal for bigger books farther away. The PayPal address is NOT published on the site (given per deal by email).
- 2026-10-20: Payment: cash in person (Tucson) or PayPal, both directions (owner: no card machine). Shown in Step 3 and both 'Why everyone wins' lists.
- 2026-10-20: Owner card links his eBay account abandcomics (member since 2011, 100% positive, checked 2026-10-20 on ebay.com/usr/abandcomics). Re-check if the feedback changes.
- 2026-10-20: Tucson / Southern Arizona added; contact form now sends straight to admin@ (no mail app needed), CSS/JS ?v=5.
- 2026-10-20: v2: owner's logo, comic-style redesign, "we buy all comics, keys are our specialty / you never know" message, 50-book price guide from real auction results (prices.html; sold.html redirects), samples removed, contact email live.
- 2026-10-20: Site v1 built (home, sold archive, sell steps, grading guide, contact form), 50 sample sales.
