# RIIFT — Shopify Build Briefing

Developer handoff for kicking off the **RIIFT** e-commerce site on **Shopify**. Prepared June 2026 by the design team (RIIFT Pty Ltd).

**Page build workflow:** [`../PAGE_BUILD_GUIDE.md`](../PAGE_BUILD_GUIDE.md)

---

## 1. What this package is

The `designs/` folder contains the approved website design as a set of **HTML prototypes**. They are *design references* — they show the intended look, copy, layout, and motion. **They are not production code to paste into a theme.** Your job is to **recreate these designs as a Shopify theme** using Shopify's own architecture (Online Store 2.0: Liquid, JSON templates, sections & blocks), wiring the commerce parts (products, variants, cart, checkout) to Shopify's data model.

The prototypes are built as self-contained HTML files (they use a small runtime, `support.js`, only so they open in a browser — ignore it for the Shopify build; it has no role in production). Open any `.dc.html` file directly in a browser to view it.

**Fidelity: High.** Colours, type, spacing, copy and interactions are final and should be matched closely. The two exceptions, both flagged in the brand guide, are (a) photography is placeholder from the team library — a real shot list is pending, and (b) the logo is currently a raster PNG; vector masters are pending.

---

## 2. The product & the commerce model (read this first)

RIIFT is an **efoil propulsion system** sold as two separable parts. This shapes the entire Shopify catalog.

- **RIIFT Tracks** — carbon rails laminated into a board by a partner **shaper**. Sold *to shapers*, in **2P** and **4P** sizes.
- **RIIFT Power System** — the **PowerPack** (battery) + **Propulsion Unit** (motor pod) + hard case / chargers / remote. Sold *to riders*. PowerPacks come in **2P / 3P / 4P**.
- **Boards** — RRP ~**AUD 2,500**, fulfilled **direct via shapers** (so the storefront likely *configures/quotes* a board and routes to a shaper, rather than selling stock board inventory — confirm fulfilment flow with the team).

**Compatibility rule (hard constraint, must be enforced in UI):** all three PowerPacks fit **4P tracks**; **2P tracks accept only the 2P PowerPack**. The configurator (the Wizard, §5) enforces this and it must hold anywhere a customer pairs a board/track with a pack.

**One board, three ride modes**, swapped tool-less: **Prone** (unpowered) → **Foil Assist** (motor high on mast) → **E-Foil** (motor low on mast). Mode change **60 sec**; battery swap **30 sec**. Core differentiator = **Perfect Balance** (battery mass over the foil's centre of lift).

### Suggested Shopify catalog structure
- **Products:** each PowerPack tier (2P/3P/4P) as a product *or* one "PowerPack" product with a size variant; Tracks (2P/4P) as products gated to the shaper/trade audience; accessories (case, charger, remote) as products. Board = configurable product or lead-gen form (TBC with team).
- **Collections:** "Power System", "Tracks (Trade)", "Boards", "Accessories".
- **Metafields:** energy (Wh), efoil run time, price tier, compatible track sizes, weight, dimensions — drive the spec tables (§4) from metafields, not hard-coded copy.
- **Customer tags / B2B:** shapers and dealers are a trade audience. Consider Shopify B2B (catalogs/price lists) or tag-gated pages for Tracks pricing and the Shapers/Dealers areas.

### Fixed product facts (from engineering/legal — **do not reword or alter values**)
| PowerPack | Energy | Efoil run* | Price (AUD) |
|---|---|---|---|
| 2P (Entry) | 518 Wh | ~30 min | $7,000 |
| 3P (All-day) | 778 Wh | ~45 min | $8,500 |
| 4P (Flagship) | 1,036 Wh | ~60 min | $10,000 |

\*80 kg rider, flat water, continuous ~20 km/h; surfing roughly doubles times; a 45 kg rider roughly doubles again. Note **1,036 Wh** (not 1,037). Pod **49.5 mm** vs 63 mm industry standard (−38% drag); up to **150 W/kg** at 4P. Boards RRP ~AUD 2,500 incl. GST. **Launch: September 2026. PowerPack delivery: from December 2026.** Prices AUD incl. GST.

---

## 3. Design system / tokens

Full reference: `designs/RIIFT Brand & Style Guidelines.dc.html` (open in a browser — it's the source of truth). Summary:

**Colour (intentionally monochrome — photography supplies all colour):**
- Ink `#111111` — text, primary buttons, rules
- Footer Black `#0D0D0D` — footer, dark bands, hero scrim base
- White `#FFFFFF` — primary surface, cards
- Off-White `#F2F1EE` — alternating section bands
- Greys: `#999` labels · `#E4E2DC` borders · `#EFECE5` hairline · `#B3AEA3` placeholder
- Scrim on photos: `rgba(13,13,13,…)` gradients, ~18–88% opacity
- **Accent (NOT currently used — decision pending):** Bug Yellow `#FFED00`, Ocean Teal `#1A5C6B`. Keep the build mono unless the team decides otherwise.

**Type** (Google Fonts — load Poppins + Inter):
- **Poppins** — display & headings, weights 500/600/700/800. Headings are **UPPERCASE**, tracking ~−.01em. Italic 500 for the wordmark and pull-quotes only.
- **Inter** — body & UI, weights 400/500/600. Sentence case, line-height 1.65–1.75, body at ~70% ink opacity.
- Scale (responsive `clamp()`): Hero H1 Poppins 800 ~2.4→5.2rem · Section H2 800 ~1.6→3rem · Card H3 700 ~1.2rem · Eyebrow Poppins 600 11–12px +.14em tracking UPPER · Body Inter 400 ~1.05rem · Caption ~.82–.92rem `#999` · Pull-quote Poppins 500 italic.

**Components:**
- **Buttons:** pill (radius 999px), uppercase Poppins 600 13px +.1em — primary CTA, usually white-on-photo. Solid square `#111` for form/subscribe. Text link with arrow that nudges on hover (gap 8→14px). Hover lifts buttons −2px / `#111`→`#333`.
- **Cards:** white surface, 1px `#E4E2DC` hairline, **near-square radius ≈2px**, image on top; lift −4px + soft shadow on hover. Only pills/circular controls are fully round.
- **Spec row:** label left (`#999`), value right, hairline divider.
- **Form input:** 1px `#ccc` border, square, no radius.
- **Nav:** fixed; transparent over hero → solid `#0D0D0D` after 40px scroll. Links uppercase Poppins 600, .14em tracking, 78%→100% opacity on hover.

**Motion** (calm, one thing at a time, nothing bounces):
- Scroll reveal: fade in + rise 28px, 700ms, `cubic-bezier(.2,.7,.3,1)`, trigger ~12% in view.
- Hero kinetic headline: cycles three phrases every 2.6s, 400ms fade/slide (see §4 Home).
- Hero image ken-burns: scale 1.06→1.15 over ~16s.
- Hover: cards −4px, image tiles zoom 1.06 over 600ms.

**Voice:** confident, positive, precise. Phrase positively ("Drag Free" not "No Drag"). Short uppercase headlines. Lead with ride feel, back with engineering. Use real numbers. No hype words.

---

## 4. Pages / sections to build

Recreate each as a Shopify template composed of reusable **sections** (so content is editable in the theme editor). Map repeating content to metafields/blocks.

### Home (`designs/Home E - Wireframe.dc.html`) — the approved homepage
Sections, top→bottom:
1. **Hero** — full-viewport. Background **crossfades through 3 photos** in sync with a **kinetic headline** that cycles 3 pairs every 2.6s:
   - "Recess Integrated" → "No Drag. No Tools. No Compromise." (board underside shot)
   - "Perfectly Balanced" → "Unpowered. Foil Assist. E-Foil. Adapts to your ride." (zoomed-in crop)
   - "Pure Performance" → "Your Shaper. Your Foil. Your Vision."
   "Learn More" CTA. Implement as a section with the 3 slides as blocks (image + headline + subhead).
2. **The Core of the Board** — intro paragraph.
3. **Video band** — full-bleed looping background video + "Watch" control. *(Stand-in only in the prototype — real video pending. In Shopify use a section with a video/file setting.)*
4. **One System. Infinite Possibilities.** — two paragraphs.
5. **Three Ways to Ride** — 3 cards: **Prone** / **Foil Assist** (motor high on mast) / **E-Foil** (motor low on mast), each photo + tag + body.
6. **The RIIFT PowerPack** — **full-bleed dark section with a looping background video** behind 3 spec cards (2P/3P/4P, see §2 table) + footnote. Drive specs from product metafields. *(Video is a stand-in in the prototype.)*
7. **Perfect Balance** — intro + **Kane De Wilde quote + YouTube video** *(both still pending from the team — leave an editable placeholder block).*
8. **Engineered to Ride** — 3 advantage columns (Thin Boards / Tool-less / the 60-30 swap rules).
9. **Collaboration at the Core** — paragraphs + shaper logo row.
10. **Modular Track System** — caption over image.
11. **Get Set Up with RIIFT** — 3 steps: **Board** / **Ride** / **Power Up** ("Add your RIIFT Powerpack. Quick, tool-less installation of the Powerpack and MotorPod gets you flying.").
12. **Follow RIIFT** — Instagram reels row (9:16).
13. **Be First to Ride** — launch dates + email signup (wire to Shopify customer/marketing capture).
14. **Footer** (`designs/Footer.dc.html`).

### Shared chrome
- **Nav** (`designs/Nav.dc.html`) — links: **Boards, System, Shapers, Dealers, People, Contact** (+ add **Wizard**, see open items). Note: the label is **"System"** (changed from "Electronics") but the underlying page/route is still the electronics/system page. Desktop shows the full link set; mobile collapses.
- **Footer** (`designs/Footer.dc.html`) — tagline, link columns, email signup. Uses the white logo on `#0D0D0D`.

### Interior pages (currently **scaffolds** — layout/intent only, build out fully)
- **Boards** (`Boards.dc.html`) — board range; sizes 5'4"×19"×3" (4P), 5'0"×18.75"×3" (4P), 4'10"×18.5"×2.1" (2P).
- **System / Electronics** (`Electronics.dc.html`) — Power System detail (PowerPack, Propulsion Unit, case/chargers/remote).
- **Shapers** (`Shapers.dc.html`) — trade audience; Tracks info + partner program.
- **Dealers** (`Dealers.dc.html`) — trade/retail.
- **People** (`People.dc.html`) — team (names/photos pending).
- **Customers** (`Customers.dc.html`) — testimonials (content pending).
- **Contact** (`Contact.dc.html`) — contact form (wire to Shopify contact form / app).

### Logo / wordmark
Italic heavyweight wordmark, raster PNG for now: `assets/riift-logo-black.png` (on light), `assets/riift-logo-white.png` (on dark/photos). Header & footer height ~24px; never below ~18px. Don't rebuild in live text. **Vector masters pending.**

---

## 5. The Wizard (product configurator) — `designs/Wizard - Live Ranking.dc.html`

An interactive **"which RIIFT is right for me"** configurator with a **dual live ranking**: as the user answers, **2 Tracks** and **3 Batteries** re-rank live. Start button: "Start RIIFT Wizard". Result CTA: **"Buy now"** (should add the recommended PowerPack to cart / route to the product). Enforces the **4P-default** and **2P-tracks-locks-2P-battery** rules from §2.

On Shopify this is best built as a **custom section with a JS app** (vanilla or a small framework island) that reads product/variant data (and metafields for compatibility) from the Shopify Storefront/AJAX API, then adds the chosen variant to cart. Recommendations and ranking logic are in the prototype's script — port the logic, not the markup.

**Open item the team requested (not yet done in the prototype):** make the Wizard reachable from the homepage as **both** a popup/modal **and** a standalone page, and add **Wizard** to the nav. Plan for both entry points.

---

## 6. Assets

In `designs/assets/`:
- `riift-logo-black.png`, `riift-logo-white.png` — wordmark (raster; vector pending).
- `photos/` — ~25 placeholder photos from the team library, incl. `hero-1/2/3.jpg` (homepage hero rotation), `efoil.jpg`, `foil-assist.jpg`, and numbered shots used across cards/steps/reels. **Treat all photography as placeholder** — a real shot list + clean studio product shots (battery, pod, tracks, board blank) are pending.
- Fonts: load **Poppins** & **Inter** from Google Fonts (weights listed in §3).

---

## 7. Still pending from the RIIFT team (don't block on these — leave editable placeholders)
- Hi-res/final photography + art-direction shot list; clean studio product shots.
- **Vector logo masters** (SVG/EPS) + minimum size; decision on a standalone symbol/app-icon.
- **Accent-colour decision** (stay mono vs. reintroduce Bug Yellow / Ocean Teal, and where).
- **Kane De Wilde quote + YouTube video** for the Perfect Balance section.
- Team names/photos (People); customer testimonials (Customers).
- Board fulfilment flow (direct-via-shaper) — confirm whether storefront sells, configures, or lead-gens boards.
- Real video for the homepage video band and the PowerPack section background.

---

## 8. Files in this package
- `designs/Home E - Wireframe.dc.html` — approved homepage
- `designs/Nav.dc.html`, `designs/Footer.dc.html` — shared chrome
- `designs/Boards|Electronics|Shapers|Dealers|People|Customers|Contact.dc.html` — interior pages (scaffolds)
- `designs/Wizard - Live Ranking.dc.html` — product configurator
- `designs/RIIFT Brand & Style Guidelines.dc.html` — **full design-system reference (open this)**
- `designs/assets/` — logos + photos
- `designs/support.js` — prototype runtime only; **ignore for the Shopify build**

*Parked/alternative homepage directions (A/B/C/D), the direction picker, and the older linear Wizard were intentionally excluded — direction **E (Wireframe)** is the approved one.*
