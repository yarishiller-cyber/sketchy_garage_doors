# CLAUDE.md — Sketchy Garage Doors (site-specific)

The METHOD lives in the shared brain (`garagedoors-shared/`, aka `_shared/`). This file holds
the SPECIFICS for this site. Read both.

## This site
- **Brand:** Sketchy Garage Doors  ·  **Domain:** sketchygaragedoors.ca
- **Email:** info@sketchygaragedoors.ca  ·  **Phone:** 778-800-0769 (`tel:+17788000769`)
- **Coverage model:** `gva-wide` — all of Greater Vancouver. Priority city pages built:
  Vancouver, Burnaby, Surrey, Richmond, Coquitlam, North Vancouver (expand toward ~15–20 max,
  one at a time, each genuinely unique — see `_shared/playbooks/LOCAL-SEO.md`).
- **Emphasis:** residential.
- **Voice / angle:** self-aware / edgy — "Sketchy name. Spotless work." Resolve the joke
  instantly, pair every laugh with a hard trust signal, own the anti-scam / radical-transparency
  position. NEVER joke about safety, competence, or the customer's money.
- **Palette:** near-black `#15171a` + hazard yellow `#ffd21e` (hazard-tape motif).
- **Fonts:** Space Grotesk (display) + Inter (body).  **Layout:** layout-c (dark split editorial).

## How this site is built (no build step at runtime)
Static HTML/CSS/vanilla JS + Motion (CDN) for animation. Pages are emitted by a small Node
generator so all 24 pages stay consistent:
- `node _build/generate.mjs` — regenerates every `.html` from `site-config.json` + in-file copy.
- `node _build/gen-images.mjs` — idempotent Nano Banana image batch (skips existing `.webp`).
  Needs `GEMINI_API_KEY` and `cwebp` (`apt-get install -y webp`).
After editing copy/data in `_build/generate.mjs` or `site-config.json`, re-run the generator,
then bump the `ASSETV` constant if you changed `styles.css`/`script.js` (cache-busting).

## Lead forms (no secrets in this PUBLIC repo)
`form-handler.php` uses the host's `mail()` to send contact + partner submissions to
`info@sketchygaragedoors.ca` → redirect to `/thank-you.html`. Works without JS (plain POST);
`script.js` enhances with fetch + a mailto fallback. Supabase is NOT used (host egress was
blocked at build time + DDL impossible from the session); to add it later, create a public
`leads` table with an anon INSERT policy and mirror submissions from `script.js`.

## Rules / guardrails specific to this site
- Use **"Licensed (business licence), insured & WorkSafeBC-covered"** — garage-door tech is an
  UNREGULATED trade in BC; never imply a trade certificate.
- Only claim same-day / after-hours if genuinely true (currently framed as "same-day for most
  repairs" + "honest after-hours rates").
- **No invented reviews/ratings** and **no self-serving Review/AggregateRating schema.** Social
  proof is handled honestly ("no fake reviews — we'd rather earn real ones"); route reviews to GBP.
- Keep per-city copy distinct from the sibling sites (probably-fine / good-enough).

## Deploy
Hostinger via Git. Dev branch this session: `claude/blissful-curie-vcd8sd`. Production deploy is
push-to-`main` (per fleet convention) — not live until merged to `main`.
