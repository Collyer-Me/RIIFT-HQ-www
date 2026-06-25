(function () {
  'use strict';

  function initHero(hero) {
    if (hero.getAttribute('data-riift-hero-init') === 'true') return;
    hero.setAttribute('data-riift-hero-init', 'true');

    var slideInterval = parseInt(hero.getAttribute('data-slide-interval') || '6000', 10);
    var slidesContainer = hero.querySelector('.riift-hero__slides');
    var slideEls = slidesContainer ? slidesContainer.querySelectorAll('.riift-hero__slide') : [];
    var copySets = hero.querySelectorAll('.riift-hero__copy-set');
    var count = slideEls.length;

    if (copySets.length > 0 && copySets.length < count) {
      count = copySets.length;
    }

    if (count <= 1) return;

    var index = 0;
    setInterval(function () {
      slideEls[index].classList.remove('is-active');
      if (copySets[index]) copySets[index].classList.remove('is-active');

      index = (index + 1) % count;

      slideEls[index].classList.add('is-active');
      if (copySets[index]) copySets[index].classList.add('is-active');
    }, slideInterval);
  }

  function init() {
    document.querySelectorAll('[data-riift-hero]').forEach(initHero);
  }

  document.addEventListener('shopify:section:load', function (event) {
    event.target.querySelectorAll('[data-riift-hero]').forEach(initHero);
  });

  document.addEventListener('shopify:section:unload', function (event) {
    event.target.querySelectorAll('[data-riift-hero]').forEach(function (hero) {
      hero.removeAttribute('data-riift-hero-init');
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
