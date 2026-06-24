(function () {
  'use strict';

  function initHeaderScroll() {
    var header = document.querySelector('.riift-header');
    if (!header) return;

    var threshold = 40;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > threshold);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initReveal(root) {
    var scope = root || document;
    var items = scope.querySelectorAll('[data-reveal]:not(.is-revealed)');
    if (!items.length) return;

    if (window.Shopify && window.Shopify.designMode) {
      items.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-riift-menu-toggle]');
    var nav = document.querySelector('.riift-header__nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function init() {
    initHeaderScroll();
    initReveal();
    initMobileNav();
  }

  document.addEventListener('shopify:section:load', function (event) {
    initReveal(event.target);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
