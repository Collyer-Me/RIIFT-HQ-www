# Claude page HTML cookbook

Copy-paste HTML for Shopify Pages (`page.riift` template). Use `riift-*` classes only — no Liquid, no `<script>` tags. Theme JS handles `data-reveal` and `data-riift-hero`.

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

<a href="/pages/system" class="riift-link-arrow">
  Learn more
  <span aria-hidden="true">→</span>
</a>
```

---

## Card

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

Linked card — wrap with `<a href="..." class="riift-card">` instead of `<div>`.

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

---

## Page hero (interior band)

```html
<div class="riift-page-hero">
  <div class="riift-page-hero__inner" data-reveal>
    <p class="riift-eyebrow">Interior</p>
    <h1 class="riift-h1">Page title</h1>
    <p class="riift-body" style="margin-top: 16px; max-width: 60ch;">Optional intro copy.</p>
  </div>
</div>
```

---

## Form input row

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
- Placeholder gradient (no image): leave `riift-card__media` empty.
- Logos: `riift-logo-white.png` / `riift-logo-black.png` in theme assets.
