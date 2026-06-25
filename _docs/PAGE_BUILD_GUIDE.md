# RIIFT — Page build guide

How we build and maintain pages on the Shopify storefront.  
**Store:** `riift-hq.myshopify.com` · **Theme:** Horizon + RIIFT layer · **Updated:** June 2026

Design reference: [`design_handoff_shopify/README.md`](design_handoff_shopify/README.md)

---

## 1. Core idea

We use **one visual system** and **two authoring tools**:

| Tool | Best for |
|------|----------|
| **Claude** (+ Shopify connector) | Marketing copy, layout HTML, interior pages |
| **Cursor** (+ Shopify CLI) | Theme foundation, commerce templates, dynamic sections, global JS/CSS |
| **Theme Editor** (Shopify Admin) | Sections above/below embedded HTML, live product bands, reordering |

Consistency comes from shared **`riift-*` CSS classes** and **theme JavaScript** that activates `data-*` hooks — not from duplicating inline styles from the `.dc.html` prototypes.

---

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────┐
│  Theme shell (Cursor) — every page                        │
│  riift-header · riift.css · riift.js · riift-footer     │
├─────────────────────────────────────────────────────────┤
│  Optional TOP sections (Theme Editor) — dynamic Liquid    │
├─────────────────────────────────────────────────────────┤
│  PAGE BODY — static HTML (Claude → Shopify Page)         │
│  riift-* classes · data-reveal · data-riift-hero         │
├─────────────────────────────────────────────────────────┤
│  Optional BOTTOM sections (Theme Editor) — dynamic Liquid │
└─────────────────────────────────────────────────────────┘
```

**Claude markup + theme runtime:** Claude supplies HTML structure and hooks. The theme supplies behaviour (hero crossfade, scroll reveal, wizard logic). Do **not** paste `<script>` tags into Page HTML — Shopify may strip them. Put JS in theme assets instead.

---

## 3. Page templates (homepage + interior pages)

### Homepage (`/`)

Uses **`templates/index.json`**. The full homepage is a **stack of `riift-*` Theme Editor sections** — hero, text bands, card grid, wizard launcher, Klaviyo embed, etc. Merchants edit copy, images, and section order in Theme Customize; no Claude Page HTML embed.

| Section (examples) | Edited via |
|--------------------|------------|
| `riift-hero` | Theme Editor |
| `riift-text-band`, `riift-card-grid`, `riift-quote-band` | Theme Editor |
| `riift-wizard-launcher` | Theme Editor |
| `riift-klaviyo-embed` | Theme Editor |

New section types are added in Cursor, then configured in Theme Editor after deploy.

> **Alternate path (not in use):** `riift-page-embed` + a Page `home-content` body lets Claude own homepage HTML. See `_docs/home-content-test.html`. We chose native sections for easier merchant editing.

### Interior pages (Boards, System, Shapers, etc.) — sandwich template

Uses **`templates/page.riift.json`**:

| Layer | Section | Edited via |
|-------|---------|------------|
| Above (optional) | Theme sections e.g. product strip | Theme Editor |
| **Middle** | **`riift-page-content`** → `{{ page.content }}` | Claude → this page’s HTML |
| Below (optional) | Theme sections | Theme Editor |

Assign template **riift** to each marketing page in Admin.

---

## 4. Static vs dynamic content

### Static (inside Page HTML — Claude)

- Copy, layout, images, component markup
- `data-reveal`, `data-riift-hero`, wizard HTML structure
- Klaviyo embed snippets
- Links to `/products/...` and `/collections/...`
- Fixed PowerPack spec table from README §2 (legal/engineering values — do not reword)

**Liquid does not run inside pasted Page HTML.** `{{ product.price }}` in the Pages editor will display as literal text.

### Dynamic (theme — Cursor / Theme Editor)

- Header, footer, cart
- Sections above/below the HTML embed
- Product metafields (live prices, specs)
- Page metafields (if template reads them outside `page.content`)
- JS fetching product data via `data-riift-product="handle"` (advanced)

### When to add a Theme Editor section instead of Claude HTML

| Need | Solution |
|------|----------|
| Live product price or spec | Liquid section or metafield-driven section |
| Collection grid | `riift-product-strip` section |
| Inventory / cart add | Product template or theme JS + Ajax API |
| Email signup | Klaviyo embed in HTML **or** dedicated section |

---

## 5. Unified component library

Build once in the theme. Use everywhere.

| Layer | Files | Claude | Theme Editor |
|-------|-------|--------|--------------|
| Tokens | `assets/riift.css` | automatic | automatic |
| Components | `assets/riift-components.css` | `riift-btn`, `riift-card`, etc. | same classes in section Liquid |
| Snippets | `snippets/riift-*.liquid` | use **cookbook HTML** matching snippets | sections call snippets |
| Cookbook | `_docs/claude-page-html-guide.md` | copy-paste patterns | — |

### Claude HTML rules

1. Wrap body in `<div class="riift-page">...</div>`
2. Use only documented `riift-*` classes — avoid inline styles except image URLs
3. Do **not** include `<nav>`, `<footer>`, or `<script>` tags
4. Use `data-reveal` on blocks for scroll animation (theme handles motion)
5. Use `data-riift-hero` for hero crossfade + kinetic headline (theme handles motion)
6. Never alter fixed product facts (Wh, run times, AUD prices) from the handoff README

### Motion hooks (theme JS — loaded globally)

| Hook | Theme file | Behaviour |
|------|------------|-----------|
| `data-reveal` | `assets/riift.js` | Fade in + rise on scroll |
| `data-riift-hero` | `assets/riift-hero.js` | Crossfade + rotating headline |
| `data-riift-wizard` | `assets/riift-wizard.js` | Quiz + outcome → product URL map |

---

## 6. Division of labour by page type

| Page / surface | Body content | Dynamic bands | Commerce |
|----------------|--------------|---------------|----------|
| **Homepage** | Theme Editor (`riift-*` sections in `index.json`) | — | — |
| **Boards, System, Shapers, Dealers, People, Customers, Contact** | Claude → each Page | Optional sections | — |
| **Wizard** | Claude HTML or section markup | — | Outcome links → `/products/...` (v1) |
| **Product / collection / cart** | — | — | Cursor theme templates |
| **Nav / footer** | — | Cursor (all pages) | — |

---

## 7. Email capture

Use **Klaviyo embed** snippets in Claude HTML or a dedicated theme section.  
Do not use Shopify’s native marketing signup for RIIFT forms.

---

## 8. Wizard

- **Section:** `riift-wizard` on template `page.wizard` → `/pages/wizard`
- **Config:** `assets/wizard-config.json` (fallback) or Shopify **Metaobjects** — see [`_docs/wizard/admin-setup.md`](wizard/admin-setup.md)
- **Logic:** `assets/riift-wizard.js` (live ranking, compatibility rules, add-to-cart)
- **Modal:** `riift-wizard-modal` snippet + `riift-wizard-launcher` section on homepage
- **Buy now:** opens the product page with the recommended variant selected (`/products/{handle}?variant={id}`)

Compatibility rules (must hold in UI and copy):

- All three PowerPacks fit **4P tracks**
- **2P tracks** accept only the **2P PowerPack**

---

## 9. Workflow — building a new page

### A. Interior marketing page (e.g. System)

1. Create Shopify Page in Admin (handle: `system`)
2. Assign template **riift**
3. Claude generates HTML from prototype + [`claude-page-html-guide.md`](claude-page-html-guide.md) (when available)
4. Paste HTML into Page body (HTML mode)
5. Preview on dev store; adjust in Claude or Admin
6. If live product data needed → add Theme Editor section above/below in `page.riift.json` (Cursor, one-time)

### B. Homepage content update

1. Edit section settings in **Theme Customize** (copy, images, band order)
2. Push theme only if section structure or new section types changed (Cursor)

### C. New dynamic band on homepage

1. Cursor builds new section (e.g. `riift-powerpack-strip`)
2. Add to `index.json` (or merchant adds via Theme Editor after deploy)
3. Configure in Theme Customize — no Claude HTML change required

### D. Commerce page change

1. Cursor edits product/collection/cart templates
2. `shopify theme dev` → preview → `git commit` → `git push` → `shopify theme push`

---

## 10. Git and deployment

| Item | Location |
|------|----------|
| Theme code | `c:\dev\Riift\Shopify` → GitHub `RIIFT-HQ-www` (branch **master**) |
| Page HTML | Shopify Admin (not in git) — document major changes in commit messages or `_docs` if needed |
| CLI config | `shopify.theme.toml` → `riift-hq.myshopify.com` |

**Node PATH workaround (temporary):** prefix terminal commands with  
`$env:PATH += ";C:\Program Files\nodejs"` until User PATH is fixed.

---

## 11. What not to do

- Paste full `.dc.html` prototypes into Pages (includes nav, `support.js`, wrong structure)
- Put `<script>` in Page HTML — use theme JS + `data-*` hooks
- Rebuild logo in live text — use PNG assets until SVG masters arrive
- Reword fixed engineering/legal product values
- Assume Claude HTML can run Liquid or read metafields directly

---

## 12. Related docs

| Doc | Purpose |
|-----|---------|
| [`design_handoff_shopify/README.md`](design_handoff_shopify/README.md) | Design specs, catalog model, page list |
| [`claude-page-html-guide.md`](claude-page-html-guide.md) | Component cookbook for Claude |
| `.cursor/plans/` | Full implementation plan and todos |

---

## 13. Decision log

| Decision | Choice |
|----------|--------|
| Homepage structure | **Theme Editor sections** — `riift-*` stack in `index.json` (not page embed) |
| Interior pages | **riift** template — Claude HTML middle, optional dynamic sections |
| Motion / interactivity | Claude markup + theme JS (`data-*` hooks) |
| Email | **Klaviyo** embed |
| Wizard v1 | Static JS + product URL mapping |
| Live catalog data | Theme Editor sections or Liquid — not inside Page HTML |
| Default git branch | **master** |
