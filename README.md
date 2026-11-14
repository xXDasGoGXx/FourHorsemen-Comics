# Four Horsemen Comics

Website for [fourhorsemencomics.net](https://fourhorsemencomics.net): Matthew Malleo buys and sells comics in
Tucson, Arizona.

| Folder | What it is |
|---|---|
| `site/` | The whole website: plain HTML, CSS and JavaScript, no build step. |
| `site/data/keys.json` | The Key of the Day list (one famous issue per day, facts only, no prices). |
| `deploy/` | The three containers that run the site, as a stand-alone Compose file, and a check that it matches production. |
| `docs/RESTORE.md` | How to bring the site back if the server dies: containers, NPM, Cloudflare, contact form. |
| `marketing/` | Car door magnet (print-ready PDF and PNG, 24 x 12 in) and its source, plus text for listings. |

**Publishing:** changes merged to `main` go live within about two minutes. The live commit is shown at
https://fourhorsemencomics.net/version.txt. To undo a change, revert its commit on `main`.

This repository is public on purpose (the server pulls it without keys). Never commit passwords, keys, or
customers' names and addresses.
