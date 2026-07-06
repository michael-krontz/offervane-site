# OfferVane Marketing Site — Handoff / Working Notes

## What this is
Standalone static marketing site for **OfferVane** — an embeddable instant-cash-offer
widget for real estate investors (fix-and-flip / BRRRR / wholesale). Radically-honest
copy (no fabricated testimonials/logos/stats), dark amber-on-charcoal, one-page scroller.

- **Location:** `~/offervane-site` (do NOT touch the app repos — different project)
- **Stack:** Vite + vanilla JS, `base: './'`, self-hosted fonts (Hanken Grotesk + JetBrains Mono)
- **Repo:** github.com/michael-krontz/offervane-site
- **Live:** https://michael-krontz.github.io/offervane-site/
  (custom domain offervane.com is DNS-parked, so every deploy strips CNAME + sets robots noindex)

## Deploy process (run after every change)
1. `npm run build`
2. Commit source → `git push origin main` (direct to main; no PRs)
3. Copy `dist/` → a scratch deploy dir; **`rm CNAME`**; write `robots.txt` = `User-agent: *` / `Disallow: /`; `touch .nojekyll`
4. `git init` in that dir, `git checkout -b gh-pages`, commit (author `TrueCatholicAI <michaelkrontz@gmail.com>`), `git push -f` to origin gh-pages
5. Poll for live, verify with curl + Playwright

Note: `HANDOFF.md` and `scripts/` are NOT part of the site — only `dist/` is deployed.

## Gotchas
- **GitHub Pages builds run 4–9 min lately (slow).** Poll patiently. Status:
  `GET /repos/michael-krontz/offervane-site/pages/builds/latest` (token from `~/.git-credentials`).
- **Don't grep for CSS/JS bundle hashes** — they contain `-`/`_`. Grep a literal content marker instead.
- **Never start a compound Bash command with `kill`/`pkill`** — exit 144 aborts the rest. Run commit/push separately.
- `scripts/*.mjs` = gitignored throwaway Playwright verification scripts. Playwright is at `/home/michael/scratch/pw/`.
- Verify built `dist/` via `python3 -m http.server 4321` (from dist).
- No image tools preinstalled (potrace/imagemagick/Pillow). Pillow is installed in a scratch venv when needed.
- Copy rule: **no em dashes**.

## Brand tokens
- Gold = `--amber` **#E8A317** (== the highlight-text color). Also `--amber-bright #F4B53A`,
  `--amber-deep #BC7A0D`, `--amber-ink #1A1206`.
- `--bg #0C0B09`, `--bg-2 #131109`, `--ink #F4EFE4`, `--radius-lg 22px`.

## Remote preview tunnel
`cloudflared tunnel --url http://127.0.0.1:4317 --http-host-header 127.0.0.1:4317`
The `--http-host-header` is **required** (vite preview on :4317 rejects the random
`*.trycloudflare.com` host with 403). Quick tunnels get a new URL each launch and die
with the process.

## Key files
- `index.html` — the single page
- `src/styles/main.css`
- `src/main.js` — scroll-tied animations (doorlight, sunset, offer-rule slider, install typewriter)
- `public/logomark.png` — the brand mark (amber rooster-vane)
- `public/favicon.svg` — embeds the amber mark on a dark tile
- `public/CNAME` — `offervane.com` (stripped on each gh-pages deploy while DNS is parked)
- `offer-vane-icon.svg` — the source icon upload (a raster PNG inside an SVG wrapper) at repo root
- `vite.config.js` — `base: './'`

## Current hero state
- **Left column (7fr):** eyebrow "Be first with a real number." → oversized H1
  "Give every seller an instant cash offer, **right on your site.**" (amber tail) → body →
  two CTAs → helper line. (Leave this alone unless asked.)
- **Right column (5fr):** `.offerpreview` — a cream, **static**, white-labeled seller-offer card:
  - Header strip: neutral-gold house glyph + "Heartland Home Buyers" (deliberately NOT the OfferVane mark)
  - PROPERTY: "3565 N Pennsylvania St, Indianapolis IN" + gold check
  - AFTER-REPAIR VALUE: **$312,000** (dark, ~65% of offer size) + "Based on 6 comps within 0.5 mi"
  - divider
  - YOUR CASH OFFER: **$176,400** (brand gold, largest text = the card's hero)
  - "Accept this offer →" gold CTA
  - Below card: caption "What sellers see on the investor's site. Your brand, not ours."
  - Card is `aria-hidden` (caption stays readable), centered against the H1 via
    `margin-top: clamp(1.5rem, 4.5vw, 5.5rem)`, and **hidden below 900px**.
  - Numbers match the math section for continuity.

## Notable component behaviors
- **Logo mark:** the uploaded rooster-vane icon, decoded from a raster-in-SVG, cropped +
  recolored to amber, shipped as `public/logomark.png` and used via `<img class="logomark">`
  in nav, final-CTA, and footer. It is **raster, not vector**.
- **Easy install typewriter:** as the code card scrolls in, `YOUR_INVESTOR_ID` types out
  **character-by-character** (substring reveal) with a blinking caret, over 0.05→0.55 of the
  card's scroll progress. This is the **only** animation in that section (an earlier
  line-by-line snippet reveal and a Copy-button gold pulse were both removed). a11y: no
  `aria-live`; an `.sr-only` span carries the full ID; copy uses a canonical `SNIPPET_TEXT`
  constant so a mid-type click still copies the exact snippet.

## Downstream sections (all working, scroll-tied where noted)
Problem (doorway-light SVG) · How it works (sunset SVG) · The math (formula + dashboard) ·
Tune the offer (scroll-tied ARV slider, 50/90/70 swing) · Easy install (ID typewriter) ·
Pricing · Founder · Early access · Final CTA.

## Open / optional (not done)
- User may upload an icon variant with **a dollar sign on the back of the arrow** → re-swap logo + favicon.
- **`og.png` social card still shows the OLD weathervane** — not regenerated with the new icon.
- Logo is raster; could **trace/redraw as vector** if crispness/recolorability matters.
- Custom domain **offervane.com DNS still parked** (Michael's Namecheap side).
