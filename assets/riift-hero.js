(function () {
  'use strict';

  function initHero(hero) {
    var slidesData = hero.getAttribute('data-slides');
    var phrasesData = hero.getAttribute('data-phrases');
    var slideInterval = parseInt(hero.getAttribute('data-slide-interval') || '6000', 10);
    var phraseInterval = parseInt(hero.getAttribute('data-phrase-interval') || '2600', 10);

    var slidesContainer = hero.querySelector('.riift-hero__slides');
    var headline = hero.querySelector('.riift-hero__headline');

    if (slidesData && slidesContainer) {
      try {
        var slides = JSON.parse(slidesData);
        slidesContainer.innerHTML = '';
        slides.forEach(function (url, index) {
          var slide = document.createElement('div');
          slide.className = 'riift-hero__slide' + (index === 0 ? ' is-active' : '');
          slide.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
          slidesContainer.appendChild(slide);
        });

        if (slides.length > 1) {
          var slideIndex = 0;
          setInterval(function () {
            var slideEls = slidesContainer.querySelectorAll('.riift-hero__slide');
            slideEls[slideIndex].classList.remove('is-active');
            slideIndex = (slideIndex + 1) % slideEls.length;
            slideEls[slideIndex].classList.add('is-active');
          }, slideInterval);
        }
      } catch (e) {
        /* invalid JSON — skip slide rotation */
      }
    }

    if (phrasesData && headline) {
      try {
        var phrases = JSON.parse(phrasesData);
        headline.innerHTML = '';
        phrases.forEach(function (text, index) {
          var span = document.createElement('span');
          span.className = 'riift-hero__phrase riift-h1' + (index === 0 ? ' is-active' : '');
          span.textContent = text;
          headline.appendChild(span);
        });

        if (phrases.length > 1) {
          var phraseIndex = 0;
          setInterval(function () {
            var phraseEls = headline.querySelectorAll('.riift-hero__phrase');
            phraseEls[phraseIndex].classList.remove('is-active');
            phraseIndex = (phraseIndex + 1) % phraseEls.length;
            phraseEls[phraseIndex].classList.add('is-active');
          }, phraseInterval);
        }
      } catch (e) {
        /* invalid JSON — keep static headline */
      }
    }
  }

  function init() {
    document.querySelectorAll('[data-riift-hero]').forEach(initHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
