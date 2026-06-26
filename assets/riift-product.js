/**
 * PowerPack product buy block — tier selector, live spec updates, add to cart.
 */
(function () {
  function formatMoney(cents, template) {
    if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents, template || window.theme?.moneyFormat);
    }
    return '$' + (cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function initBuyBlock(root) {
    var dataEl = root.querySelector('[data-riift-product-data]');
    if (!dataEl) return;

    var variants;
    try {
      variants = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    if (!variants.length) return;

    var defaultTier = (root.getAttribute('data-default-tier') || '4P').toUpperCase();
    var selected =
      variants.find(function (v) {
        return v.tier === defaultTier;
      }) || variants[variants.length - 1];

    var form = root.querySelector('[data-product-form]');
    var variantInput = root.querySelector('[data-variant-input]');
    var priceEl = root.querySelector('[data-product-price]');
    var energyEl = root.querySelector('[data-product-energy]');
    var runEl = root.querySelector('[data-product-run]');
    var weightEl = root.querySelector('[data-product-weight]');
    var compatEl = root.querySelector('[data-product-compat]');
    var heroImage = root.querySelector('[data-product-hero-image]');
    var addBtn = root.querySelector('[data-add-to-cart]');
    var errorEl = root.querySelector('[data-product-error]');
    var tierButtons = root.querySelectorAll('[data-tier-button]');

    function setSelected(variant) {
      selected = variant;
      if (variantInput) variantInput.value = variant.id;
      if (priceEl) priceEl.textContent = variant.price;
      if (energyEl) energyEl.textContent = variant.usableEnergy;
      if (runEl) runEl.textContent = variant.efoilRunTime;
      if (weightEl) weightEl.textContent = variant.packWeight;
      if (compatEl) compatEl.textContent = variant.trackCompat;

      if (heroImage && variant.imageUrl) {
        if (heroImage.tagName === 'IMG') {
          heroImage.src = variant.imageUrl;
          heroImage.alt = variant.imageAlt || '';
        }
      }

      if (addBtn) {
        addBtn.disabled = !variant.available;
        addBtn.textContent = variant.available ? addBtn.dataset.labelDefault || 'Buy now' : 'Sold out';
      }

      tierButtons.forEach(function (btn) {
        var active = String(btn.getAttribute('data-variant-id')) === String(variant.id);
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    if (addBtn && !addBtn.dataset.labelDefault) {
      addBtn.dataset.labelDefault = addBtn.textContent.trim();
    }

    tierButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-variant-id');
        var variant = variants.find(function (v) {
          return String(v.id) === String(id);
        });
        if (variant) {
          setSelected(variant);
          return;
        }
        // Fallback: read per-variant specs from button data attributes (Liquid / metafields)
        if (variantInput) variantInput.value = id;
        if (priceEl && btn.dataset.price) priceEl.textContent = btn.dataset.price;
        if (energyEl && btn.dataset.usableEnergy) energyEl.textContent = btn.dataset.usableEnergy;
        if (runEl && btn.dataset.efoilRun) runEl.textContent = btn.dataset.efoilRun;
        if (weightEl && btn.dataset.packWeight) weightEl.textContent = btn.dataset.packWeight;
        if (compatEl && btn.dataset.trackCompat) compatEl.textContent = btn.dataset.trackCompat;
        tierButtons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-selected', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      });
    });

    var thumbs = root.querySelectorAll('[data-thumb-index]');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var img = thumb.querySelector('img');
        if (!img || !heroImage || heroImage.tagName !== 'IMG') return;
        heroImage.src = img.currentSrc || img.src;
        thumbs.forEach(function (t) {
          t.classList.toggle('is-active', t === thumb);
        });
      });
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!selected || !selected.available) return;

        if (errorEl) {
          errorEl.hidden = true;
          errorEl.textContent = '';
        }

        var formData = new FormData(form);
        fetch(window.Shopify?.routes?.root ? window.Shopify.routes.root + 'cart/add.js' : '/cart/add.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        })
          .then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok) throw data;
              return data;
            });
          })
          .then(function () {
            window.location.href = window.Shopify?.routes?.root ? window.Shopify.routes.root + 'cart' : '/cart';
          })
          .catch(function (err) {
            if (errorEl) {
              errorEl.hidden = false;
              errorEl.textContent = err.description || err.message || 'Could not add to cart.';
            }
          });
      });
    }

    setSelected(selected);
  }

  function boot() {
    document.querySelectorAll('[data-riift-product-buy]').forEach(initBuyBlock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector('[data-riift-product-buy]');
    if (root) initBuyBlock(root);
  });
})();
