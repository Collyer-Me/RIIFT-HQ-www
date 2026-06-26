# Claude page HTML cookbook

Copy-paste HTML for Shopify Pages (`page.riift` template). Use `riift-*` classes only — no Liquid, no `<script>` tags. Theme JS handles `data-reveal` and `data-riift-hero`.

Component reference: [`COMPONENT_CATALOG.md`](COMPONENT_CATALOG.md)

---

## Page shell

```html
<div class="riift-page">
  <div class="riift-band riift-band--off-white">
    <div class="riift-band__inner">
      <!-- content -->
    </div>
  </div>
</div>
```

Band variants: `riift-band--off-white`, `riift-band--dark` (on `riift-band`).

---

## Typography

```html
<p class="riift-eyebrow">The heart of the system</p>
<h1 class="riift-h1">Recess Integrated</h1>
<h2 class="riift-h2">Section heading</h2>
<h3 class="riift-h3">Card title</h3>
<p class="riift-body">Body copy at ~70% ink opacity. Generous line-height for reading.</p>
<p class="riift-caption">Caption or label text</p>
<p class="riift-pullquote">"Pull-quote specimen — Poppins 500 italic."</p>
```

---

## Buttons

```html
<a href="/pages/boards" class="riift-btn riift-btn--pill">Explore boards</a>

<a href="/pages/contact" class="riift-btn riift-btn--solid">Get in touch</a>

<a href="/pages/wizard" class="riift-btn riift-btn--ghost">Find your setup</a>

<a href="/pages/system" class="riift-link-arrow">
  Learn more
  <span aria-hidden="true">→</span>
</a>
```

Dual CTA row:

```html
<div style="display: flex; flex-wrap: wrap; gap: 14px;">
  <a href="/pages/shapers" class="riift-btn riift-btn--solid">Become a partner</a>
  <a href="/pages/wizard" class="riift-btn riift-btn--ghost">Find your setup</a>
</div>
```

---

## Card

**Image card:**

```html
<div class="riift-card" data-reveal>
  <div class="riift-card__media">
    <img src="https://cdn.shopify.com/..." alt="Surf mode" loading="lazy">
  </div>
  <div class="riift-card__body">
    <p class="riift-eyebrow">Mode</p>
    <p class="riift-h3 riift-card__title">Surf</p>
    <p class="riift-body">Low-aspect foil feel with responsive power delivery.</p>
  </div>
</div>
```

**Text-only card** (no media block):

```html
<div class="riift-card riift-card--text" data-reveal>
  <div class="riift-card__body">
    <p class="riift-eyebrow">Component</p>
    <p class="riift-h3 riift-card__title">Propulsion Unit</p>
    <p class="riift-body">49.5 mm pod. Recess-integrated.</p>
  </div>
</div>
```

**Compact entity card:**

```html
<div class="riift-card riift-card--compact" data-reveal>
  <div class="riift-card__body">
    <p class="riift-h3 riift-card__title">South Coast Shapers</p>
    <p class="riift-body">NSW, Australia</p>
  </div>
</div>
```

**Testimonial card:**

```html
<div class="riift-card riift-card--testimonial" data-reveal>
  <div class="riift-card__body">
    <p class="riift-pullquote riift-card__quote">"The balance is unlike anything else on the water."</p>
    <p class="riift-body riift-card__attribution">Kane D. · RIIFT rider</p>
  </div>
</div>
```

Linked card — add `href` by using `<a href="..." class="riift-card">` instead of `<div>`.

---

## PowerPack card

```html
<div class="riift-card riift-card--powerpack" data-reveal>
  <div class="riift-card__header">
    <p class="riift-eyebrow">3P</p>
    <p class="riift-h3 riift-card__title">All-day</p>
  </div>
  <div class="riift-card__media riift-card__media--powerpack">
    <img src="https://cdn.shopify.com/..." alt="3P PowerPack" loading="lazy">
  </div>
  <div class="riift-card__body riift-card__body--specs">
    <div class="riift-spec-row">
      <span class="riift-spec-row__label">Energy</span>
      <span class="riift-spec-row__value">778 Wh</span>
    </div>
    <div class="riift-spec-row">
      <span class="riift-spec-row__label">Efoil run</span>
      <span class="riift-spec-row__value">~45 min</span>
    </div>
    <div class="riift-spec-row">
      <span class="riift-spec-row__label">Price (AUD)</span>
      <span class="riift-spec-row__value">$8,500</span>
    </div>
  </div>
</div>
```

Use fixed product facts from the design handoff README — do not alter Wh, run times, or AUD prices.

---

## Spec row

```html
<div class="riift-spec-row">
  <span class="riift-spec-row__label">Weight</span>
  <span class="riift-spec-row__value">12.4 kg</span>
</div>
```

---

## Stat column

```html
<div class="riift-stat-column" data-reveal>
  <p class="riift-h3">Drag Free</p>
  <p class="riift-body">Recess-integrated tracks eliminate bolt-on drag.</p>
</div>
```

Numbered step — add eyebrow before title:

```html
<div class="riift-stat-column" data-reveal>
  <p class="riift-eyebrow">01</p>
  <p class="riift-h3">Choose your shaper</p>
  <p class="riift-body">Find a RIIFT-enabled shaper in your region.</p>
</div>
```

---

## Page hero

**Text band (fallback):**

```html
<div class="riift-page-hero riift-page-hero--text">
  <div class="riift-page-hero__inner" data-reveal>
    <p class="riift-eyebrow">Interior</p>
    <h1 class="riift-h1">Page title</h1>
    <p class="riift-body" style="margin-top: 16px; max-width: 60ch;">Optional intro copy.</p>
  </div>
</div>
```

**Photo hero (interior pages)** — tall variant:

```html
<header class="riift-page-hero riift-page-hero--photo riift-full-bleed">
  <div class="riift-page-hero__media riift-page-hero__media--ken-burns">
    <img
      class="riift-page-hero__image"
      src="https://cdn.shopify.com/..."
      alt="Boards"
      loading="eager"
    >
  </div>
  <div class="riift-page-hero__scrim" aria-hidden="true"></div>
  <div class="riift-page-hero__inner riift-page-hero__inner--center" data-reveal>
    <p class="riift-eyebrow riift-page-hero__eyebrow">RIIFT Enabled</p>
    <h1 class="riift-h1">Boards</h1>
    <p class="riift-body riift-page-hero__body">RIIFT-enabled foilboards, built by the world's best shapers.</p>
  </div>
</header>
```

**Short photo hero** (Contact) — add `riift-page-hero--short` on the `<header>`.

---

## Split band

Two-column layout for contact, marketplace, dealer locator:

```html
<div class="riift-band">
  <div class="riift-band__inner">
    <div class="riift-split-band riift-split-band--form">
      <div class="riift-split-band__primary">
        <!-- form or primary content -->
      </div>
      <div class="riift-split-band__secondary">
        <!-- details sidebar -->
      </div>
    </div>
  </div>
</div>
```

Ratios: `riift-split-band--balanced` (1:1) or `riift-split-band--form` (1.3:1).

**Details blocks** (contact sidebar):

```html
<div class="riift-detail-block">
  <p class="riift-eyebrow riift-detail-block__label">Email</p>
  <p class="riift-body riift-detail-block__value">hello@riift.com</p>
</div>
```

---

## Contact form markup

For static HTML pages, use native fields with RIIFT classes. Wire to Shopify contact handling via theme section on a dedicated template, or link to `/pages/contact`.

```html
<form class="riift-form" action="/contact#contact_form" method="post" accept-charset="UTF-8">
  <input type="hidden" name="form_type" value="contact">
  <input type="hidden" name="utf8" value="✓">

  <div class="riift-form__row riift-form__row--split">
    <input type="text" class="riift-form__input" name="contact[name]" placeholder="Name" autocomplete="name">
    <input type="email" class="riift-form__input" name="contact[email]" placeholder="Email" required autocomplete="email">
  </div>
  <input type="tel" class="riift-form__input" name="contact[phone]" placeholder="Phone (optional)" autocomplete="tel">
  <select class="riift-form__input riift-form__select" name="contact[enquiry]">
    <option value="">What's your enquiry about?</option>
    <option value="Buying a RIIFT Power System">Buying a RIIFT Power System</option>
    <option value="Finding a RIIFT-enabled board">Finding a RIIFT-enabled board</option>
  </select>
  <textarea class="riift-form__input riift-form__textarea" name="contact[body]" rows="5" placeholder="Your message"></textarea>
  <button type="submit" class="riift-btn riift-btn--solid">Send message</button>
</form>
```

---

## Media band · caption overlay

```html
<div class="riift-media-band riift-full-bleed riift-media-band--caption">
  <img class="riift-media-band__image" src="https://cdn.shopify.com/..." alt="" loading="lazy">
  <div class="riift-media-band__scrim" aria-hidden="true"></div>
  <div class="riift-media-band__caption-wrap">
    <p class="riift-media-band__caption">Modular Track System</p>
    <p class="riift-body riift-media-band__caption-body">Carbon tracks laid in before lamination.</p>
  </div>
</div>
```

---

## Form input row (newsletter)

```html
<form class="riift-input-row" action="#" method="post">
  <input type="email" class="riift-input" placeholder="Enter your email" aria-label="Email">
  <button type="submit" class="riift-btn riift-btn--solid">→</button>
</form>
```

---

## Hero with kinetic headline

Theme `riift-hero.js` reads JSON from attributes. No inline scripts.

```html
<div
  class="riift-hero"
  data-riift-hero
  data-slides='["https://cdn.shopify.com/photo-1.jpg","https://cdn.shopify.com/photo-2.jpg"]'
  data-phrases='["Drag Free.","Tool-less.","Pure Performance."]'
  data-slide-interval="6000"
  data-phrase-interval="2600"
>
  <div class="riift-hero__slides"></div>
  <div class="riift-hero__scrim"></div>
  <div class="riift-hero__content">
    <p class="riift-eyebrow">Efoil propulsion</p>
    <div class="riift-hero__headline riift-h1"></div>
    <p class="riift-body" style="margin-top: 20px; max-width: 48ch;">Balanced over the foil.</p>
    <a href="/pages/system" class="riift-btn riift-btn--pill" style="margin-top: 28px;">Explore the system</a>
  </div>
</div>
```

Add `data-reveal` to child blocks for scroll animation.

---

## Card grid layout

```html
<div class="riift-card-grid">
  <!-- cards here -->
</div>
```

---

## Scroll reveal

Add `data-reveal` to any block. Theme `riift.js` fades in + rises 28px at 12% visibility.

```html
<div data-reveal>
  <h2 class="riift-h2">Animates on scroll</h2>
</div>
```

---

## Dark band example

```html
<div class="riift-band riift-band--dark">
  <div class="riift-band__inner" data-reveal>
    <p class="riift-eyebrow">Tagline</p>
    <h2 class="riift-h2">Drag Free. Tool-less. Pure Performance.</h2>
    <p class="riift-body" style="color: rgba(255,255,255,0.7);">Always phrased positively.</p>
  </div>
</div>
```

---

## Image notes

- Upload photos to **Shopify Files** and use CDN URLs in `src` attributes.
- Placeholder gradient (no image): leave `riift-card__media` empty or omit the `<img>`.
- Logos: `riift-logo-white.png` / `riift-logo-black.png` in theme assets.

---

## Preview

All components are demonstrated on `/pages/styleguide` (theme template `styleguide`).
