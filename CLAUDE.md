# FourHorsemen-Comics: notes for Claude (read this first)

Owner works from an iPad (see HomeCommander-Claude `CLAUDE.md`). This repo is the public website
**https://fourhorsemencomics.net** (owner's comic buying/selling business: "we buy, we sell, everyone wins").

## Status and open items (start here in a new chat; keep this section current)
Last updated 2026-11-19. New chats start with no repos attached: attach FourHorsemen-Comics (and HomeCommander-Claude
for anything on the servers), read both CLAUDE.md files, then this list.

**Live and done**
- Website v3 live, `main` = live (check `version.txt`). Restore kit in `docs/RESTORE.md` + `deploy/`.
- Google: Search Console verified (CNAME `moeglpd573sq`, keep it), sitemap submitted; Business Profile **verified
  2026-11-19** (admin@fourhorsemencomics.net Google account, service area, address hidden, hours 8-8).
- Cloudflare zone rule `Block` fixed 2026-11-19 so Googlebot reaches the website (expression in RESTORE.md).
  Non-US visitors are still blocked on purpose.
- Car magnets: 24x12 design in `marketing/`; the owner ordered 2 from VistaPrint (2026-11-15, font-free PDF).
- Hidden preview page `/originalart` (see Log 2026-11-18), sent to the owner's artist friend.

**Waiting on the owner (nothing for Claude to do until he says)**
- Search Console: owner to tap *Request indexing* (home page) and *Validate fix* on the 403 report if not done yet;
  Google emails admin@ when validation passes.
- Business Profile: add a recovery email (his Yahoo), upload `marketing/google-profile-logo-1080.png` (logo) and
  `google-profile-cover-1920x1080.png` (cover), later real phone photos (comics, the car with the magnet).
- Original art consignment: waiting for the friend's answer. If yes: get his photos + size, medium, year, price per
  piece and the agreed cut, then replace the preview with the real page (real PayPal buttons, still "ships from the
  artist"). If no: delete `site/originalart.html`.
- eBay posting (HomeCommander-Claude catalog v36/v37, `ebay-post` OFF, no keys): owner said "for later". Needs his
  eBay developer Production keyset + Auth'n'Auth token via `lanner/set-provider-secret.sh ebay` on fhc, then switch
  on `ebay-post`, then `ebay-account` -> write `listings/defaults.json`. Steps: HomeCommander-Claude docs/OPERATIONS.md
  "eBay listings".

**Things to remember**
- fourhorsemencomics.**com** is an unrelated store (Four Horsemen Comics and Gaming, Morgantown WV). Always ".net".
  Not fixable (they use it); local Google results put the owner first for Tucson searches.
- The admin@ mailbox password was set by the owner (2026-10-20, add-mail-domain.sh); Claude never had it. The Google
  account on admin@ has its own password (owner reset it 2026-11-19).
- Car-ad statistics (30-70k impressions, 97 % recall) are wrap-industry survey numbers, not evidence for door
  magnets; the honest measure is asking callers how they found him.
- Schwab/stock trading was discussed once and dropped at the owner's request: do not bring it back.

## How it goes live
- Everything under `site/` is the website. Static files only, no build step.
- **Publishing = merging to `main`.** On OMV, container `fourhorsemen-sync` (compose project
  `proxy-security`, file in OMV-Docker-Rebuild `compose/proxy-security/compose.yaml`) fetches `main` every
  2 minutes, copies `site/` to `releases/<commit>` and switches `current` to it; `fourhorsemen-web`
  (nginx, OMV port 8095) serves it. NPM proxies `fourhorsemencomics.net` and `www.` to 192.168.2.181:8095.
- Check what is live: `https://fourhorsemencomics.net/version.txt` = first 12 characters of the live commit.
- Roll back = revert the commit on `main`. The repo is public on purpose (OMV pulls it without keys);
  never commit secrets, customer names or addresses.

## Restore kit (owner, 2026-11-14: "in case the OMV server crashes we have a way to restore it")
- `docs/RESTORE.md`: every piece of the site and how to bring it back (containers, NPM hosts #2/#3 + cert #5,
  Cloudflare records, contact form). Update its tables and "Last checked" line when any of those change.
- `deploy/compose.yaml`: stand-alone copy of the three `fourhorsemen-*` services and their configs, verbatim from
  OMV-Docker-Rebuild `compose/proxy-security/compose.yaml` (production stays the source of truth). After changing
  production, copy the blocks here and run `python3 deploy/check-in-step.py <path to production compose.yaml>`
  (must print IN STEP).
- `marketing/`: car magnet PDF (font-free 300 dpi raster) + JPG + source, Google Business Profile logo/cover, and the business description text.

## eBay listing packages (`listings/`, 2026-11-14)
- Matthew sends photos + details; Claude writes `listings/<sku>/listing.json` + his photos (`01.jpg`...), commits to
  `main`, runs the gateway's `ebay-preview <sku> <commit>` (eBay dry run with fees), shows him, and on his OK runs
  `ebay-post` (he approves in the app). Format and rules: `listings/README.md`. Only his own photos, never stock or
  publisher images. Not part of the website (`site/` only is published).

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
- 2026-11-19: Google Business Profile VERIFIED (blue check, public knowledge panel with phone, hours, website; seen by the owner 13:20). Next: upload `marketing/google-profile-*.png` as logo/cover, real photos later. Note: fourhorsemencomics.com (and shop.fourhorsemencomics.com) belongs to an unrelated store, Four Horsemen Comics and Gaming, Morgantown WV; it ranks for the name, so always print and say ".net".
- 2026-11-19: Google could not index the site (Search Console: 4 home-page URLs "Blocked due to access forbidden (403)" since Nov 6). Cause: Cloudflare custom rule `Block` = `(ip.src.country ne "US") or (cf.client.bot)`; Security Events showed Google-InspectionTool from AS15169 blocked by it. Owner changed it to `(ip.src.country ne "US") or (cf.client.bot and not http.host in {"fourhorsemencomics.net" "www.fourhorsemencomics.net"})`; live test 09:59 "URL is available to Google". Rule recorded in docs/RESTORE.md. Side effect to remember: the site is invisible outside the US (non-US block stays by the owner's earlier choice).
- 2026-11-18: Hidden preview page `site/originalart.html` (served at /originalart via nginx try_files `$uri.html`): Original Art consignment mock-up for a friend of the owner's who sells original comic art (art stays with the artist and ships direct; buyer pays Matthew's PayPal; Matthew pays the artist his share). Sample pieces are drawn placeholders, buttons only show a preview note, `noindex, nofollow`, not linked from any page, not in sitemap.xml or robots.txt. Replace with the real page (artist's own photos, real PayPal buttons) only when the owner says the artist is in.
- 2026-11-15: Google Search Console verified (Domain property, same Google account as the Business Profile) with CNAME `moeglpd573sq` -> `gv-djvbg7pp74qr7k.dv.googlehosted.com` (DNS only), added via cf-dns-create. TXT at the apex was not possible: the gateway's create refuses a second TXT at `@` (SPF lives there). Record listed in docs/RESTORE.md; do not delete it.
- 2026-11-15: Google Business Profile created by the owner under a Google account on admin@fourhorsemencomics.net (category Comic book store, service area business, address hidden, hours 8-8 daily, phone + website); video verification submitted, Google says up to 5 days. Logo/cover for it: `marketing/google-profile-*.png` (upload after verification). Still open: Google Search Console (owner sends the `google-site-verification=` TXT value, Claude adds it with cf-dns-create).
- 2026-11-15: Search basics: `sitemap.xml` + Sitemap line in robots.txt, canonical links, schema.org Store data (phone, Tucson service area, eBay link; no street address). Site was not in search results yet; Google Search Console (DNS TXT via Cloudflare) and a Google Business Profile (service area, address hidden) are the owner's next steps.
- 2026-11-14: `listings/` folder for eBay listing packages (gateway catalog v36 `ebay-preview` / `ebay-post`); `defaults.json` comes after the eBay keys are on the gateway and `ebay-account` shows the policy IDs.
- 2026-11-14: v3 live (b862bff). Restore kit added: docs/RESTORE.md, deploy/compose.yaml (+ check-in-step.py, IN STEP), marketing/ (car magnet, description); README rewritten.
- 2026-11-14: v3 redesign at the owner's request ("too much like a template... juvenile"): calmer grown-up look, first person, price guide and drawn covers removed, Key of the Day, learn.html guide. ?v=7.
- 2026-10-20: Phone number added site-wide (tap to call); CSS/JS ?v=6.
- 2026-10-20: Owner confirmed all 'Why everyone wins' promises. Deals are local first (Tucson, cash); shipping + PayPal for bigger books farther away. The PayPal address is NOT published on the site (given per deal by email).
- 2026-10-20: Payment: cash in person (Tucson) or PayPal, both directions (owner: no card machine). Shown in Step 3 and both 'Why everyone wins' lists.
- 2026-10-20: Owner card links his eBay account abandcomics (member since 2011, 100% positive, checked 2026-10-20 on ebay.com/usr/abandcomics). Re-check if the feedback changes.
- 2026-10-20: Tucson / Southern Arizona added; contact form now sends straight to admin@ (no mail app needed), CSS/JS ?v=5.
- 2026-10-20: v2: owner's logo, comic-style redesign, "we buy all comics, keys are our specialty / you never know" message, 50-book price guide from real auction results (prices.html; sold.html redirects), samples removed, contact email live.
- 2026-10-20: Site v1 built (home, sold archive, sell steps, grading guide, contact form), 50 sample sales.
