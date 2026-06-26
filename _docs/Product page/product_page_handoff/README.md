# RIIFT — Power System Product Page · Developer Handoff

Everything needed to build the **PowerPack Kit** product page. The design is final; recreate it in your stack (or as a Shopify product template).

## Files
- `Power System - Product.dc.html` — **the design** (the product page). Open in a browser to view it live. It's a self-contained HTML prototype; `support.js` is just the runtime that lets it open standalone — **ignore it in production**.
- `Nav.dc.html`, `Footer.dc.html` — shared header/footer the page mounts.
- `RIIFT Brand & Style Guidelines.dc.html` — **design system source of truth** (colour, type, components, motion). Open this.
- `RIIFT Product Specifications.xlsx` — the raw spec sheet the page data came from.
- `assets/` — logos (PNG; vector pending) + the two photos used (`photos/3.jpg` hero, `photos/16.jpg` propulsion band). All other product images are placeholders — real product shots pending.

## What the page is
A product page for the **RIIFT Power System "PowerPack Kit"**, sold in three tiers: **2P / 3P / 4P**. One configurable product with a tier variant (not three separate products).

## Page sections (top → bottom)
1. **Nav** (shared).
2. **Buy block** — gallery (left) + info (right): tier selector **2P/3P/4P**; selecting a tier live-updates **price, usable energy, efoil run time, pack weight, and the track-compatibility line**. CTAs: **Buy now** (add selected variant to cart) and **Help me choose** (→ Wizard). Default tier = 4P.
3. **What's in the kit** — 5 components: PowerPack, Propulsion Unit, Remote, Charger, Hard Case.
4. **Full specifications** — all-tier table (every spec row).
5. **Propulsion advantage** — 49.5 mm pod / −38% drag / up to 150 W/kg.
6. **How it compares** — factual RIIFT 4P vs FoilDrive Fusion (manufacturer-published).
7. **CTA** → Wizard.
8. **Footer** (shared).

## Data model (per tier — these are the variant values)
| Spec | 2P | 3P | 4P |
|---|---|---|---|
| Battery configuration | 12S2P | 12S3P | 12S4P |
| Cell | 21700 · 6,000 mAh | same | same |
| Nominal pack voltage | 43.2 V | 43.2 V | 43.2 V |
| Capacity | 12 Ah | 18 Ah | 24 Ah |
| Usable energy | 518 Wh | 778 Wh | 1,036 Wh |
| Efoil run time* | ~30 min | ~45 min | ~60 min |
| Peak thrust | 28 kg | 28 kg | 28 kg |
| Battery weight | 2.5 kg | 3.5 kg | 4.5 kg |
| PowerPack weight | 3.2 kg | 4.5 kg | 5.8 kg |
| System weight, installed† | 4.4 kg | 5.7 kg | 7.0 kg |
| Recharge‡ | ~48 min | ~72 min | ~96 min |
| Compatible tracks | **2P & 4P** | 4P | 4P |
| Price AUD incl. GST | **$7,000** | **$8,500** | **$10,000** |

\*80 kg rider, flat water, ~20 km/h; heavier/harder riding reduces it, surfing roughly doubles it. †PowerPack + Propulsion Unit installed. ‡0–100% at 15 A, nominal.

**Two derived values to verify with the RIIFT team** (formula cells with no stored value in the sheet): the **recharge times** (computed at 15 A) and **installed system weight** (PowerPack + Propulsion). Everything else is taken directly from the sheet / confirmed figures.

**Compatibility rule (enforce in UI):** every pack fits **4P tracks**; **2P tracks accept the 2P pack only**. So the 2P variant shows "2P & 4P", the others "4P".

## Design system (summary — full detail in the guidelines file)
- **Mono palette:** ink `#111`, footer/dark `#0D0D0D`, white `#FFF`, off-white band `#F2F1EE`, borders `#E4E2DC`/`#EFECE5`, grey labels `#999`, placeholder `#B3AEA3`. No accent colour in this design.
- **Type:** Poppins (display/headings, UPPERCASE, 600–800) + Inter (body, 400–600). Load both from Google Fonts.
- **Components:** pill buttons (radius 999px, uppercase Poppins 600, dark primary / outline secondary); cards = white, 1px `#E4E2DC` hairline, ~2px radius, −4px lift + soft shadow on hover; spec rows = label left `#999`, value right, hairline divider; tier selector = square segmented buttons, selected = solid `#111` white text.
- **Motion:** scroll-reveal fade + 26px rise, 700ms `cubic-bezier(.2,.7,.3,1)`; hero ken-burns; card hover lift.

## Build notes
- "Buy now" is a placeholder `<a href="#">` — wire to your cart/checkout with the selected tier variant.
- "Help me choose" / CTA link to the **Wizard** (the configurator) — point these at your route for it.
- Drive the spec table + buy-block from the variant data above (metafields if Shopify), not hard-coded copy.
- Page launches **September 2026**; PowerPack delivery **from December 2026** (shown in the buy block).
