# Restoring fourhorsemencomics.net

Everything needed to bring the website back lives in this repository, except two things that hold secrets and
are kept elsewhere on purpose: Nginx Proxy Manager's certificate data and the mail server's keys. Both are named
below with where they live.

Last checked against the live setup: **2026-11-14** (live commit `b862bff`, `deploy/compose.yaml` in step with
production, Cloudflare and NPM as listed below).

## What makes up the site

| Piece | Where it runs | Where it is kept |
|---|---|---|
| Website files (`site/`) | served from OMV | **this repo**, branch `main` |
| `fourhorsemen-web` (nginx, port 8095) | OMV, Compose project `proxy-security` | OMV-Docker-Rebuild `compose/proxy-security/compose.yaml`; copy in **`deploy/compose.yaml`** |
| `fourhorsemen-sync` (pulls `main` every 2 min) | same | same |
| `fourhorsemen-contact` (contact form, emails admin@) | same | same |
| HTTPS front door | Nginx Proxy Manager `jc21-npm` on OMV (`proxy-security`) | NPM data: `/srv/docker/volumes/npm/` (OMV backups) |
| DNS | Cloudflare zone `fourhorsemencomics.net` | records listed below |
| Inbound web traffic | Cisco ISR static NAT 207.108.121.181 → OMV 80/443 | OMV-Docker-Rebuild network docs (shared with every OMV site) |
| Mailbox admin@fourhorsemencomics.net | mail VM 192.168.1.190 | private repo **Mail-Server-Recovery** |

The website folder on OMV (`/srv/docker/volumes/fourhorsemen-web/site`) is deliberately **not** in the Backblaze
backup: it is rebuilt from this repo by `fourhorsemen-sync` within two minutes of starting.

## Quick check: is it up?

- https://fourhorsemencomics.net/version.txt shows the first 12 characters of the live commit. It should match
  the newest commit on `main`.
- Claude can check from any chat through the HomeCommander-Claude connector: `omv-docker-ps`, `omv-compose-diff
  proxy-security`, the `fourhorsemen-sync` log, and `npm-proxy-hosts`.

## Case 1: OMV is fine, the site is not

1. Ask Claude to run `omv-compose-diff proxy-security`. If the live file differs from GitHub, `omv-compose-sync
   proxy-security` puts GitHub's version back (it backs up first and rolls back by itself if unhealthy).
2. Look at the `fourhorsemen-sync` log. `published <commit>` lines are normal; `fetch failed` means OMV cannot
   reach GitHub at that moment and the last good release keeps being served.
3. A bad website change: revert the commit on `main`; the old version is back within two minutes.

## Case 2: OMV rebuilt from scratch

Follow OMV-Docker-Rebuild's rebuild guide for the `proxy-security` project (it brings back NPM and its data from
backup). The three `fourhorsemen-*` containers are part of that Compose file, so once `proxy-security` is up:

1. Wait two minutes; `fourhorsemen-sync` clones this repo and publishes `main`.
2. Check `http://192.168.2.181:8095/version.txt` on the LAN, then the public address.
3. If NPM's data could not be restored, recreate the two proxy hosts (Case 4).

## Case 3: run the site on another Docker host

For when OMV is down and the site must come back somewhere else (for example a Lanner VM). Root shell on that
host, with Docker and the Compose plugin installed:

```sh
git clone https://github.com/xXDasGoGXx/FourHorsemen-Comics.git /root/FourHorsemen-Comics
cd /root/FourHorsemen-Comics && docker compose -f deploy/compose.yaml up -d
```

Then:

1. Check `http://<host IP>:8095/version.txt` from another machine on the LAN.
2. In NPM, change both proxy hosts' forward address from `192.168.2.181` to the new host's IP (port stays
   `8095`). If NPM itself is gone, see Case 4.
3. The contact form sends through the mail VM at `192.168.1.190` (the `extra_hosts` line in `deploy/compose.yaml`).
   The new host must be able to reach 192.168.1.190 port 25. Test it by sending yourself a message from the form.

Do not run `deploy/compose.yaml` on a host where `proxy-security`'s own `fourhorsemen-*` containers are running:
same names, same port.

## Case 4: recreate the NPM proxy hosts

In the NPM web interface (`http://192.168.2.181:8181`), **Hosts → Proxy Hosts → Add Proxy Host**, twice:

| Field | Host 1 | Host 2 |
|---|---|---|
| Domain Names | `fourhorsemencomics.net` | `www.fourhorsemencomics.net` |
| Scheme | `http` | `http` |
| Forward Hostname / IP | `192.168.2.181` (or the Case 3 host) | same |
| Forward Port | `8095` | `8095` |
| Block Common Exploits, Websockets Support | on | on |
| SSL tab: certificate | the fourhorsemencomics.net certificate | same |
| SSL tab: Force SSL, HTTP/2 | on | on |

Certificate: if NPM has none for the site, **SSL Certificates → Add → Let's Encrypt**, domain names
`fourhorsemencomics.net` and `www.fourhorsemencomics.net`, **Use a DNS Challenge**, provider **Cloudflare**, with a
Cloudflare API token that can edit DNS for the zone (Zone → DNS → Edit). Do not use the plain HTTP challenge: it
fails here because Cloudflare's bot protection blocks Let's Encrypt's checks. Key type ECDSA 256 is fine.

Today these are NPM proxy hosts **#2** and **#3** with certificate **#5** (valid to 2027-01-19, renews itself).

## Cloudflare DNS for the website

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `fourhorsemencomics.net` | `207.108.121.181` | proxied (orange) |
| CNAME | `www` | `fourhorsemencomics.net` | proxied (orange) |

Mail records in the same zone (`mail` A to `207.108.121.180` DNS only, MX, SPF, DMARC, DKIM) belong to the mail
server: see Mail-Server-Recovery `docs/DNS.md`. The DKIM value must match the mail server's private key, so take it
from there, never from memory. Other CNAMEs in the zone (`omv`, `plex`, `books`, ...) are for the owner's other
services, not the website.

## The contact form

`fourhorsemen-web` passes `POST /api/contact` to `fourhorsemen-contact`, which sends one plain-text email per
message to admin@fourhorsemencomics.net through the mail VM (port 25, STARTTLS, certificate checked against
`mail.fourhorsemencomics.net`), with Reply-To set to the visitor. Limits: 6 a minute per visitor in nginx, 5 an
hour in the service, a hidden trap field and a minimum time on the page. The mail server's side of this is written
down in Mail-Server-Recovery `CURRENT-STATUS.md` ("website contact form delivers here").

## Keeping this repo a complete restore source

- Website changes: merge to `main` (that is also publishing).
- Container changes: edit OMV-Docker-Rebuild `compose/proxy-security/compose.yaml` first (production), sync it to
  OMV, then copy the same blocks into `deploy/compose.yaml` here and run
  `python3 deploy/check-in-step.py <path to that compose.yaml>`; it must print `IN STEP`.
- NPM, Cloudflare or mail changes: update the tables above and the "Last checked" line.
