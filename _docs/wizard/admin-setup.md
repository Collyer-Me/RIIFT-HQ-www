# RIIFT Wizard — Admin & metaobject setup

The wizard reads configuration from **Shopify Metaobjects** when entries exist. Otherwise it falls back to [`assets/wizard-config.json`](../../assets/wizard-config.json).

## Metaobject definitions (one-time)

In **Shopify Admin → Content → Metaobjects → Add definition**, create:

### 1. `wizard_step`

| Field key | Type | Notes |
|-----------|------|--------|
| `sort_order` | Integer | 1–7 |
| `key` | Single line text | e.g. `mode`, `build` |
| `eyebrow` | Single line text | e.g. `01 · Discipline` |
| `title` | Single line text | Question title |
| `options_json` | JSON | Array of `{ "id", "label", "desc" }` |

**Storefront access:** Read

### 2. `wizard_candidate`

| Field key | Type | Notes |
|-----------|------|--------|
| `candidate_id` | Single line text | e.g. `t2`, `2p` |
| `candidate_type` | Single line text | `track` or `battery` |
| `name` | Single line text | Full name |
| `short_label` | Single line text | e.g. `2P Tracks` |
| `subtitle` | Single line text | Subline under name |
| `price_label` | Single line text | e.g. `~$2,200` (tracks) |
| `pack_index` | Integer | 0/1/2 for batteries |
| `product` | Product reference | PowerPack product (batteries only) |
| `score_weights` | JSON | Scoring matrix (batteries only) |

**Storefront access:** Read

### 3. `wizard_shaper_region`

| Field key | Type | Notes |
|-----------|------|--------|
| `region_id` | Single line text | e.g. `aus`, `eu` |
| `shaper_name` | Single line text | Matched shaper label |

**Storefront access:** Read

---

## Seed data

Copy values from [`seed-data.json`](seed-data.json) when creating entries manually, or run the automated script:

```powershell
# One-time: authorize CLI (opens browser)
shopify store auth --store riift-hq.myshopify.com --scopes read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_products

# Validate definitions only
node scripts/seed-wizard-metaobjects.mjs --check

# Validate + create all missing entries (7 steps, 5 candidates, 5 shapers)
node scripts/seed-wizard-metaobjects.mjs
```

The script checks field keys, types, storefront read access, links battery candidates to PowerPack products by handle, and skips entries that already exist.

Until metaobjects exist **and are published (Active)**, the theme uses `assets/wizard-config.json` automatically.

> **Important:** Metaobject entries must be **Active**, not **Draft**. The storefront only reads published entries. After editing in Admin, click **Save** and set status to **Active** (or use **Publish**). Draft copies of entries are invisible to the theme.

---

## Products for add-to-cart

Create products (or set handles in JSON config):

| Handle | Wizard role |
|--------|-------------|
| `riift-powerpack-2p` | 2P PowerPack |
| `riift-powerpack-3p` | 3P PowerPack |
| `riift-powerpack-4p` | 4P PowerPack |

Link each in the matching `wizard_candidate` entry, or set `productHandle` / `variantId` in `wizard-config.json`.

**Buy now** opens the recommended product page with the matching variant selected (`/products/{handle}?variant={id}`).

By default each battery candidate links to its own product (`riift-powerpack-2p`, etc.). If you use **one product** with Tracks + PowerPack variant options, set `buy.productHandle` in `wizard-config.json` (or add a theme metaobject later) and map option values under `buy.options` to match your Admin variant labels exactly.

---

## Editing via Claude (Shopify connector)

Examples:

- “Update wizard step `conditions` title to …”
- “Change 4P battery score weight for efoil mode to 10”
- “Link wizard candidate `3p` to product handle `riift-powerpack-3p`”

These update metaobject entries — **no theme deploy** required.

Intro copy on the standalone wizard page is editable in **Theme Editor → RIIFT Wizard** section settings.

---

## Entry points

| Entry | Location |
|-------|----------|
| Standalone page | `/pages/wizard` — template **wizard** |
| Nav | Header → Wizard |
| Homepage modal | **RIIFT Wizard launcher** section → opens modal |
| Boards page | “Find your setup” button (modal or `/pages/wizard`) |

---

## Developer notes

- Scoring + compatibility rules live in [`assets/riift-wizard.js`](../../assets/riift-wizard.js) (not editable in Admin).
- 2P tracks lock 2P battery — hard constraint.
- Pull live config after Admin edits: `shopify theme pull` (theme section settings only; metaobjects live in Admin).
