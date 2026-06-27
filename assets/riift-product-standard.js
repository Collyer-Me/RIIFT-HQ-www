/**
 * RIIFT standard product page — variant options, gallery, add to cart.
 */
(function () {
  function initStandardProduct(root) {
    var dataEl = root.querySelector('[data-riift-product-data]');
    if (!dataEl) return;

    var variants;
    try {
      variants = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    if (!variants.length) return;

    var form = root.querySelector('[data-product-form]');
    var variantInput = root.querySelector('[data-variant-input]');
    var priceEl = root.querySelector('[data-product-price]');
    var heroImage = root.querySelector('[data-product-hero-image]');
    var addBtn = root.querySelector('[data-add-to-cart]');
    var errorEl = root.querySelector('[data-product-error]');
    var optionButtons = root.querySelectorAll('[data-option-button]');

    var selectedOptions = {
      option1: variants[0].option1,
      option2: variants[0].option2,
      option3: variants[0].option3,
    };

    // Initialise from pre-selected buttons
    optionButtons.forEach(function (btn) {
      if (btn.classList.contains('is-selected')) {
        var idx = parseInt(btn.getAttribute('data-option-index'), 10);
        var val = btn.getAttribute('data-option-value');
        if (idx === 0) selectedOptions.option1 = val;
        else if (idx === 1) selectedOptions.option2 = val;
        else if (idx === 2) selectedOptions.option3 = val;
      }
    });

    function findVariant() {
      return variants.find(function (v) {
        return (
          v.option1 === selectedOptions.option1 &&
          v.option2 === selectedOptions.option2 &&
          v.option3 === selectedOptions.option3
        );
      });
    }

    function setVariant(variant) {
      if (!variant) return;

      if (variantInput) variantInput.value = variant.id;
      if (priceEl) priceEl.textContent = variant.price;

      if (heroImage && variant.imageUrl) {
        if (heroImage.tagName === 'IMG') {
          heroImage.src = variant.imageUrl;
          heroImage.alt = variant.imageAlt || '';
        }
      }

      if (addBtn) {
        addBtn.disabled = !variant.available;
        addBtn.textContent = variant.available
          ? addBtn.dataset.labelDefault || 'Add to cart'
          : 'Sold out';
      }
    }

    if (addBtn && !addBtn.dataset.labelDefault) {
      addBtn.dataset.labelDefault = addBtn.textContent.trim();
    }

    optionButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-option-index'), 10);
        var val = btn.getAttribute('data-option-value');

        if (idx === 0) selectedOptions.option1 = val;
        else if (idx === 1) selectedOptions.option2 = val;
        else if (idx === 2) selectedOptions.option3 = val;

        root.querySelectorAll('[data-option-index="' + idx + '"]').forEach(function (sibling) {
          if (sibling.hasAttribute('data-option-button')) {
            var active = sibling === btn;
            sibling.classList.toggle('is-selected', active);
            sibling.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        });

        var variant = findVariant();
        if (variant) setVariant(variant);
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
        var variant = findVariant();
        if (!variant || !variant.available) return;

        if (errorEl) {
          errorEl.hidden = true;
          errorEl.textContent = '';
        }

        if (variantInput) variantInput.value = variant.id;

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

    setVariant(findVariant() || variants[0]);
  }

  function boot() {
    document.querySelectorAll('[data-riift-product-standard]').forEach(initStandardProduct);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector('[data-riift-product-standard]');
    if (root) initStandardProduct(root);
  });
})();
