# RIIFT component catalog

Inventory extracted from [`design_handoff_shopify/designs/`](design_handoff_shopify/designs/). Maps design patterns to theme primitives, merge groups, and build status.

**Live preview:** `/pages/styleguide` (template `styleguide`)  
**Authoring:** [`claude-page-html-guide.md`](claude-page-html-guide.md) for interior Page HTML

---

## Status key

| Status | Meaning |
|--------|---------|
| **built** | Snippet/section/CSS exists and matches design |
| **partial** | Exists but missing variants or design fidelity |
| **planned** | Documented; not yet in theme |
| **separate** | Own subsystem — not merged into generic components |

---

## Merged primitives (~18)

### Global chrome

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `chrome-nav` | Global chrome | Nav.dc.html, all pages | built | `sections/riift-header.liquid` |
| `chrome-footer` | Global chrome | Footer.dc.html, all pages | built | `sections/riift-footer.liquid` |
| `motion-reveal` | Motion | All content pages | built | `assets/riift.js`, `[data-reveal]` |

### Foundation

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `tokens-colour` | Typography tokens | Brand Guidelines §03 | built | `assets/riift-tokens.css` |
| `tokens-type` | Typography tokens | Brand Guidelines §04–05 | built | `assets/riift-components.css` |
| `atom-eyebrow` | Typography tokens | All pages | built | `snippets/riift-eyebrow.liquid` |

### Atoms

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `btn-pill` | Buttons | Home, quote bands | built | `snippets/riift-button.liquid` |
| `btn-solid` | Buttons | Forms, footer newsletter | built | `snippets/riift-button.liquid` |
| `btn-link` | Buttons | Section headers | built | `snippets/riift-button.liquid` |
| `btn-ghost` | Buttons | Boards, Shapers, Dealers, Wizard | built | `snippets/riift-button.liquid` |
| `input-inline` | Forms | Home notify, footer | built | `.riift-input-row` |
| `input-field` | Forms | Contact.dc.html | built | `.riift-form__*` |
| `spec-row` | Spec row / table | Home PowerPack, Electronics | built | `snippets/riift-spec-row.liquid` |

### Heroes

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `hero-home` | Home hero | Home E - Wireframe.dc.html | built | `sections/riift-hero.liquid`, `assets/riift-hero.js` |
| `hero-page-text` | Page hero | — (fallback) | built | `snippets/riift-page-hero.liquid` (`variant: text`) |
| `hero-page-photo` | Page hero | Boards, Electronics, Shapers, Dealers, People, Customers, Contact | built | `snippets/riift-page-hero.liquid` (`variant: photo`) |

### Layout bands

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `band-shell` | Layout bands | All interior pages | built | `.riift-band`, `.riift-band--off-white`, `.riift-band--dark` |
| `band-text` | Text band | Home intros, notify, CTAs | built | `sections/riift-text-band.liquid` |
| `band-split` | Split band | Contact, Shapers marketplace, Dealers locator, Electronics tracks | built | `snippets/riift-split-band.liquid`, `sections/riift-split-band.liquid` |
| `band-quote` | Quote band | Home Perfect Balance, People ambassadors | built | `sections/riift-quote-band.liquid` |
| `band-media-play` | Media band | Home video band | built | `sections/riift-media-band.liquid` (`mode: play`) |
| `band-media-caption` | Media band | Home Modular Track, Boards Carbon tracks | partial | `sections/riift-media-band.liquid` (`mode: caption`) |

### Cards & grids

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `card-image` | Card + grid | Home modes, boards, steps | built | `snippets/riift-card.liquid` |
| `card-text` | Card + grid | Electronics system parts | built | `snippets/riift-card.liquid` (`variant: text`) |
| `card-compact` | Card + grid | Shapers, Dealers by region | built | `snippets/riift-card.liquid` (`variant: compact`) |
| `card-powerpack` | Card + grid | Home + Electronics PowerPack | built | `snippets/riift-powerpack-card.liquid` |
| `card-testimonial` | Card + grid | Customers.dc.html | built | `snippets/riift-card.liquid` (`variant: testimonial`) |
| `grid-cards` | Card + grid | All card sections | built | `sections/riift-card-grid.liquid`, `.riift-card-grid` |

### Stats & specs

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `stat-column` | Stat grid | Home advantages, Boards steps | built | `sections/riift-stat-grid.liquid`, `.riift-stat-column` |
| `stat-big-number` | Stat grid | Electronics 60/30 band | planned | Extend `riift-stat-grid` |
| `spec-table` | Spec row / table | Product pages | built | `sections/riift-spec-table.liquid` |

### Forms & capture

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `form-contact` | Contact form | Contact.dc.html | built | `snippets/riift-contact-form.liquid` |
| `form-klaviyo` | Forms | Home, footer | built | `sections/riift-klaviyo-embed.liquid` |

### Media grids (lower priority)

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `grid-reels` | Media grid | Home Follow RIIFT (9:16) | planned | — |
| `grid-gallery` | Media grid | Customers In the wild (1:1) | planned | — |
| `strip-logos` | Media grid | Home shaper collaboration | planned | — |

### Separate subsystem

| ID | Merge group | Design source | Status | Theme files |
|----|-------------|---------------|--------|-------------|
| `wizard-app` | Wizard | Wizard - Live Ranking.dc.html | separate | `sections/riift-wizard.liquid`, `assets/riift-wizard.js` |

---

## Design file → components used

| Design file | Components |
|-------------|------------|
| **Home E - Wireframe** | hero-home, band-text, band-media-play, card-image, card-powerpack, band-quote, stat-column, strip-logos, band-media-caption, grid-reels, form-klaviyo, chrome-footer |
| **Boards** | hero-page-photo, band-text, grid-cards, band-media-caption, stat-column, btn-ghost |
| **Electronics (System)** | hero-page-photo, card-text, card-powerpack, band-split, stat-big-number, band-text |
| **Shapers** | hero-page-photo, band-text, card-compact, band-split, band-quote (CTA mode) |
| **Dealers** | hero-page-photo, card-compact, band-split, band-quote (CTA mode) |
| **People** | hero-page-photo, band-text, card-image, band-quote |
| **Customers** | hero-page-photo, card-testimonial, grid-gallery, band-text |
| **Contact** | hero-page-photo (short), band-split, form-contact |
| **Nav** | chrome-nav |
| **Footer** | chrome-footer, form-klaviyo |
| **Brand Guidelines** | All atoms + specimens |
| **Wizard** | wizard-app (separate) |

---

## Merge rationale

| Configurable primitive | Absorbs these design patterns |
|------------------------|------------------------------|
| **Page hero** | Text band header + photo interior heroes (tall/short, ken-burns, centered scrim) |
| **Card + grid** | Image, text-only, powerpack, testimonial, compact entity cards — one snippet, `variant` param |
| **Text band** | Centered intro, notify/signup, dual-paragraph sections |
| **Stat grid** | Advantage columns, numbered steps; future: big-number band |
| **Quote band** | Pull-quote on photo + dark partner CTA bands |
| **Media band** | Video/play pill + caption overlay on photo |
| **Split band** | Contact form/details, copy+image, dealer locator |
| **Buttons** | Pill, solid, ghost, link — one snippet, four variants |

---

## Implementation priority (interior pages)

1. Ghost button — dual CTA rows
2. Photo page hero — all interior scaffolds
3. Split band + contact form — Contact page + reusable 2-column
4. Card variants — powerpack, testimonial
5. Media band caption — Boards overlay band

Homepage-specific gaps (reels, shaper strip, dark PowerPack band) remain **planned** until interior pages ship.

---

## Related docs

- [`PAGE_BUILD_GUIDE.md`](PAGE_BUILD_GUIDE.md) — architecture and workflow
- [`design_handoff_shopify/README.md`](design_handoff_shopify/README.md) — design briefing
- [`claude-page-html-guide.md`](claude-page-html-guide.md) — Page HTML patterns
