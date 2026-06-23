# OfferVane — marketing site

The public marketing site for **OfferVane**: an embeddable instant-cash-offer
widget for real estate investors (fix-and-flip, BRRRR, wholesalers). A seller
enters their address, sees a real cash offer in seconds, and lands in the
investor's dashboard as a lead.

Standalone static front-end. Dark/premium, amber-on-charcoal — the investor
dashboard's marketing cousin, so site → product feels like one continuous brand.

## Stack

- **Vite** (vanilla — no framework needed), single `index.html`
- Self-hosted variable fonts via `@fontsource-variable` (no external font requests)
- ~26 KB HTML / ~27 KB CSS / ~2 KB JS — fast, fully static, deploy anywhere

## Run

```bash
npm install
npm run dev        # local dev server
npm run build      # → dist/  (deploy to any static host)
npm run preview    # serve the production build
```

## Structure

`index.html` is a one-page scroller built to expand:

1. **Hero** — headline + weathervane signature + amber "Start free trial"
2. **The problem** — sellers ghost slow investors; manual offers are slow; visitors bounce
3. **How it works** — drop widget → seller enters info → instant offer + lead
4. **The math / proof** — the transparent offer breakdown + a dashboard lead, in the app aesthetic
5. **Set your own rules** — tune offer %, repairs, buy box
6. **Easy install** — copy-paste embed snippet
7. **Pricing** — one plan, $500/mo, first month free, founding-member framing
8. **Founder** — "built by an investor, for investors"
9. **Final CTA** — start your free trial

## Design tokens

`src/styles/tokens.css` is an **independent copy** of the app's visual DNA
(warm charcoal foundation + a single disciplined amber accent). It does not
import from or reference the app repos — the site is fully self-contained.

- Display & body: **Hanken Grotesk** (warm humanist grotesk, oversized headlines)
- Data / code / labels: **JetBrains Mono** (the "transparent math" voice — the
  formula, the embed snippet, eyebrows, numbers)
- Signature: the **weathervane** (the "vane" that points sellers to a number)

## Honesty

OfferVane's marketing is radically honest by design — investors smell BS
instantly, so honesty is the edge. This site contains:

- **Zero** fabricated testimonials, customer logos, "trusted by N investors,"
  review counts, or invented ROI/conversion stats.
- Product mocks are clearly labeled as **example UI with sample data**, not real
  customer screenshots or claimed metrics.
- The real credibility is the founder story (20-year product designer + active
  BRRRR investor who built the tool he needed) and honest "just launched /
  founding member" framing.
- Placeholders mark where real proof will eventually go — search the markup for:
  - `<!-- REAL TESTIMONIAL GOES HERE -->`
  - `<!-- REAL CUSTOMER LOGO GOES HERE -->`
  - `<!-- REAL FOUNDER NAME GOES HERE -->`
  - `<!-- REAL FOUNDER PHOTO GOES HERE -->`

## Design-only

CTAs are visual placeholders (`href="#"`). There is no signup, email capture,
or backend — this is the design pass.

## Build assets

- `.ogsrc/og.html` — source for the social share card; rendered to `public/og.png`
- `scripts/shots.mjs` — Playwright capture (desktop + mobile + OG)
