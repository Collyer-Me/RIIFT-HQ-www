(function () {
  'use strict';

  var BATTERY_KEYS = ['mode', 'conditions', 'weight', 'session', 'experience'];

  function getRowSlot(root) {
    if (!root) return 96;
    var val = getComputedStyle(root).getPropertyValue('--riift-wz-row-slot').trim();
    var n = parseFloat(val);
    return Number.isFinite(n) && n > 0 ? n : 96;
  }

  function loadConfig(root) {
    var inline = root.querySelector('[data-riift-wizard-config]');
    if (inline && inline.textContent.trim()) {
      try {
        return Promise.resolve(JSON.parse(inline.textContent));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    var url = root.getAttribute('data-config-url');
    if (!url) return Promise.reject(new Error('No wizard config'));
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Config fetch failed');
      return r.json();
    });
  }

  function esc(text) {
    var d = document.createElement('div');
    d.textContent = text == null ? '' : String(text);
    return d.innerHTML;
  }

  function RiiftWizard(root, config) {
    this.root = root;
    this.config = config;
    this.state = { phase: 'intro', step: 0, answers: {} };
    this._timer = null;

    this.el = {
      status: root.querySelector('[data-wz-status]'),
      progress: root.querySelector('[data-wz-progress]'),
      intro: root.querySelector('[data-wz-intro]'),
      quiz: root.querySelector('[data-wz-quiz]'),
      results: root.querySelector('[data-wz-results]'),
      quizInner: root.querySelector('[data-wz-quiz-inner]'),
      resultsInner: root.querySelector('[data-wz-results-inner]'),
      boards: root.querySelector('[data-wz-boards]')
    };

    this.bindStatic();
    this._lastRowSlot = getRowSlot(root);
    this._onResize = this.handleResize.bind(this);
    window.addEventListener('resize', this._onResize);
    this.render();
  }

  RiiftWizard.prototype.handleResize = function () {
    var slot = getRowSlot(this.root);
    if (slot === this._lastRowSlot) return;
    this._lastRowSlot = slot;
    this.render();
  };

  RiiftWizard.prototype.bindStatic = function () {
    var self = this;
    var start = this.root.querySelector('[data-wz-start]');
    if (start) {
      start.addEventListener('click', function () {
        self.setPhase('quiz');
      });
    }
  };

  RiiftWizard.prototype.setPhase = function (phase) {
    if (phase === 'intro') {
      this.state = { phase: 'intro', step: 0, answers: {} };
    } else {
      this.state.phase = phase;
    }
    this.render();
  };

  RiiftWizard.prototype.goBack = function () {
    if (this.state.step === 0) {
      this.setPhase('intro');
    } else {
      this.state.step -= 1;
      this.render();
    }
  };

  RiiftWizard.prototype.selectOption = function (optionId) {
    var steps = this.config.steps;
    var key = steps[this.state.step].key;
    this.state.answers[key] = optionId;
    var self = this;
    var isLast = this.state.step === steps.length - 1;
    clearTimeout(this._timer);
    this.render();
    this._timer = setTimeout(function () {
      if (isLast) self.setPhase('results');
      else {
        self.state.step += 1;
        self.render(true);
      }
    }, isLast ? 620 : 360);
  };

  RiiftWizard.prototype.goes2P = function () {
    var a = this.state.answers;
    return a.build === 'perf' && a.experience === 'adv';
  };

  RiiftWizard.prototype.scoreList = function (list, keys) {
    var a = this.state.answers;
    var answered = keys.filter(function (k) {
      return a[k];
    });
    var maxSoFar = answered.length * 10;
    return list.map(function (b, i) {
      var score = 0;
      answered.forEach(function (k) {
        var bucket = (b.w && b.w[k]) || {};
        score += bucket[a[k]] || 0;
      });
      var pct = maxSoFar > 0 ? Math.min(100, Math.round((score / maxSoFar) * 100)) : 0;
      return Object.assign({}, b, { order: i, score: score, pct: pct });
    });
  };

  RiiftWizard.prototype.scoreTracks = function () {
    var a = this.state.answers;
    var decided = !!(a.build || a.experience);
    var want2P = this.goes2P();
    var tracks = this.config.tracks;
    return tracks.map(function (t, i) {
      var pct = 0;
      var score = 0;
      if (decided) {
        var winner = want2P ? 't2' : 't4';
        if (t.id === winner) {
          pct = 100;
          score = 100;
        } else if (t.id === 't2') {
          pct = a.build === 'perf' ? 64 : 30;
          score = pct;
        } else {
          pct = a.build === 'perf' && a.experience !== 'adv' ? 72 : 48;
          score = pct;
        }
      }
      return Object.assign({}, t, { order: i, score: score, pct: pct });
    });
  };

  RiiftWizard.prototype.makeRows = function (scored, anyAnswered) {
    var ranked = scored.slice().sort(function (x, y) {
      return y.score - x.score || x.order - y.order;
    });
    var rankById = {};
    ranked.forEach(function (b, idx) {
      rankById[b.id] = idx;
    });
    var rowSlot = getRowSlot(this.root);
    var rows = scored.map(function (b) {
      var rk = rankById[b.id];
      var leader = anyAnswered && rk === 0;
      return {
        id: b.id,
        name: b.name,
        sub: b.sub,
        ty: rk * rowSlot,
        rank: anyAnswered ? String(rk + 1) : '–',
        pct: anyAnswered ? b.pct : 0,
        pctLabel: anyAnswered ? b.pct + '%' : '—',
        leader: leader
      };
    });
    return { rows: rows, ranked: ranked };
  };

  RiiftWizard.prototype.getBoards = function () {
    var answers = this.state.answers;
    var trackScored = this.scoreTracks();
    var trackAnswered = !!(answers.build || answers.experience);
    var battAnswered = BATTERY_KEYS.some(function (k) {
      return answers[k];
    });
    var lock2P = trackAnswered && this.goes2P();
    var battScored = this.scoreList(this.config.batteries, BATTERY_KEYS);
    if (lock2P) {
      battScored = battScored.map(function (b) {
        if (b.id === '2p') {
          return Object.assign({}, b, { score: 1000, pct: 100 });
        }
        var sub = b.sub.replace(/ · needs 4P tracks$/, '') + ' · needs 4P tracks';
        return Object.assign({}, b, { score: -1, pct: 0, sub: sub });
      });
    }
    return {
      track: this.makeRows(trackScored, trackAnswered),
      battery: this.makeRows(battScored, battAnswered),
      battScored: battScored,
      trackAnswered: trackAnswered,
      battAnswered: battAnswered
    };
  };

  RiiftWizard.prototype.buildResult = function (boards) {
    var answers = this.state.answers;
    var trackTop = boards.track.ranked[0];
    var battTop = boards.battery.ranked[0];
    var is2PTracks = trackTop && trackTop.id === 't2';
    if (is2PTracks) {
      battTop = boards.battScored.find(function (b) {
        return b.id === '2p';
      });
    }
    var packs = this.config.packs;
    var pack = packs[battTop.pack];
    var shapers = this.config.shapers || {};
    var shaper = shapers[answers.region] || shapers.other || '—';
    return {
      headline: trackTop.short + ' + ' + battTop.short,
      matchLine: 'Tracks ' + trackTop.pct + '% · Battery ' + battTop.pct + '% match',
      blurb: is2PTracks
        ? 'As an advanced rider chasing a peak-performance build, 2P Tracks give you the lightest, stiffest setup possible — paired with the 2P Battery Kit.'
        : '4P Tracks are the versatile choice: they accept every PowerPack, so you can change battery size any time without a new board. We\u2019ve matched the Battery Kit to your riding.',
      trackLine: trackTop.name + ' · ' + trackTop.price,
      packLine: pack.name + ' · ' + pack.wh + ' · ' + pack.price,
      shaper: shaper,
      run: pack.run + ' efoil at ~20 km/h',
      showWarn: is2PTracks,
      warn: '2P Tracks are sized for the 2P battery only — you won\u2019t be able to fit a 3P or 4P PowerPack later without re-tracking the board.',
      trackId: trackTop.id,
      batteryId: battTop.id
    };
  };

  RiiftWizard.prototype.renderBoards = function () {
    var boards = this.getBoards();
    var groups = [
      {
        title: 'RIIFT Tracks',
        hint: boards.trackAnswered ? 'Live ranking' : 'Answer to begin',
        count: this.config.tracks.length,
        rows: boards.track.rows
      },
      {
        title: 'Battery Kit',
        hint: boards.battAnswered ? 'Live ranking' : 'Answer to begin',
        count: this.config.batteries.length,
        rows: boards.battery.rows
      }
    ];
    var rowSlot = getRowSlot(this.root);
    var html = '';
    groups.forEach(function (g) {
      var height = g.count * rowSlot - 12;
      html += '<div class="riift-wizard__group">';
      html += '<div class="riift-wizard__group-head">';
      html += '<h3 class="riift-wizard__group-title">' + esc(g.title) + '</h3>';
      html += '<span class="riift-wizard__group-hint">' + esc(g.hint) + '</span>';
      html += '</div>';
      html += '<div class="riift-wizard__board" style="height:' + height + 'px">';
      g.rows.forEach(function (row) {
        html +=
          '<div class="riift-wizard__row' +
          (row.leader ? ' is-leader' : '') +
          '" style="transform:translateY(' +
          row.ty +
          'px)">';
        html += '<span class="riift-wizard__rank">' + esc(row.rank) + '</span>';
        html += '<div class="riift-wizard__row-body">';
        html += '<div class="riift-wizard__row-top">';
        html += '<span class="riift-wizard__row-name">' + esc(row.name) + '</span>';
        html += '<span class="riift-wizard__row-pct">' + esc(row.pctLabel) + '</span>';
        html += '</div>';
        html += '<div class="riift-wizard__row-sub">' + esc(row.sub) + '</div>';
        html += '<div class="riift-wizard__row-bar">';
        html +=
          '<div class="riift-wizard__row-bar-fill" style="width:' +
          row.pct +
          '%"></div>';
        html += '</div></div></div>';
      });
      html += '</div></div>';
    });
    this.el.boards.innerHTML = html;
    return boards;
  };

  RiiftWizard.prototype.renderQuiz = function (animate) {
    var steps = this.config.steps;
    var cur = steps[this.state.step];
    var answers = this.state.answers;
    var self = this;
    var html = '';
    html += '<p class="riift-wizard__eyebrow">' + esc(cur.eyebrow) + '</p>';
    html += '<h2 class="riift-wizard__title riift-wizard__title--quiz">' + esc(cur.title) + '</h2>';
    html += '<div class="riift-wizard__options">';
    cur.options.forEach(function (o) {
      var sel = answers[cur.key] === o.id;
      html +=
        '<button type="button" class="riift-wizard__option' +
        (sel ? ' is-selected' : '') +
        '" data-wz-option="' +
        esc(o.id) +
        '">';
      html += '<span><span class="riift-wizard__option-label">' + esc(o.label) + '</span>';
      if (o.desc) {
        html += '<span class="riift-wizard__option-desc">' + esc(o.desc) + '</span>';
      }
      html += '</span>';
      html += '<span class="riift-wizard__option-check">' + (sel ? '✓' : '') + '</span>';
      html += '</button>';
    });
    html += '</div>';
    html += '<div class="riift-wizard__nav">';
    html += '<button type="button" class="riift-btn riift-btn--pill" data-wz-back>← Back</button>';
    html +=
      '<span class="riift-wizard__step-counter">Question ' +
      (this.state.step + 1) +
      ' of ' +
      steps.length +
      '</span></div>';

    this.el.quizInner.innerHTML = html;
    if (animate) {
      this.el.quizInner.classList.remove('is-entering');
      void this.el.quizInner.offsetWidth;
      this.el.quizInner.classList.add('is-entering');
    }

    this.el.quizInner.querySelector('[data-wz-back]').addEventListener('click', function () {
      self.goBack();
    });
    this.el.quizInner.querySelectorAll('[data-wz-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.selectOption(btn.getAttribute('data-wz-option'));
      });
    });
  };

  RiiftWizard.prototype.fetchProduct = function (handle) {
    return fetch('/products/' + encodeURIComponent(handle) + '.js').then(function (r) {
      if (!r.ok) throw new Error('Product not found');
      return r.json();
    });
  };

  RiiftWizard.prototype.findSetupVariant = function (product, trackId, batteryId) {
    var buy = this.config.buy || {};
    if (!buy.options || !product.variants) return null;

    var want = [];
    if (buy.options.tracks && buy.options.tracks[trackId]) {
      want.push(buy.options.tracks[trackId]);
    }
    if (buy.options.battery && buy.options.battery[batteryId]) {
      want.push(buy.options.battery[batteryId]);
    }
    if (!want.length) return null;

    var optionValues = [];
    if (product.options) {
      product.options.forEach(function (opt) {
        if (opt.values) optionValues = optionValues.concat(opt.values);
      });
    }
    var targets = want.filter(function (label) {
      return optionValues.indexOf(label) !== -1;
    });
    if (!targets.length) return null;

    return product.variants.find(function (v) {
      var vals = [v.option1, v.option2, v.option3].filter(Boolean);
      return targets.every(function (label) {
        return vals.indexOf(label) !== -1;
      });
    });
  };

  RiiftWizard.prototype.resolveVariantId = function (battery, trackId) {
    var self = this;
    var buy = this.config.buy || {};

    if (buy.productHandle) {
      return this.fetchProduct(buy.productHandle).then(function (product) {
        var variant = self.findSetupVariant(product, trackId, battery.id);
        if (!variant) return null;
        return { product: product, variant: variant };
      });
    }

    if (battery.variantId) {
      return Promise.resolve({
        product: { handle: battery.productHandle },
        variant: { id: battery.variantId }
      });
    }

    if (!battery.productHandle) return Promise.resolve(null);

    return this.fetchProduct(battery.productHandle).then(function (product) {
      var variant = self.findSetupVariant(product, trackId, battery.id);
      if (!variant && product.variants && product.variants.length) {
        variant = product.variants[0];
      }
      if (!variant) return null;
      return { product: product, variant: variant };
    });
  };

  RiiftWizard.prototype.buildProductUrl = function (batteryId, trackId) {
    var self = this;
    var buy = this.config.buy || {};
    var battery = this.config.batteries.find(function (b) {
      return b.id === batteryId;
    });
    if (!battery) return Promise.reject(new Error('No matching product'));

    return this.resolveVariantId(battery, trackId).then(function (resolved) {
      if (!resolved || !resolved.variant || !resolved.variant.id) {
        var handle = buy.productHandle || battery.productHandle || '';
        throw new Error(
          'Product not found. Create product handle "' +
            handle +
            '" or set variantId in wizard config.'
        );
      }

      var handle = resolved.product.handle || buy.productHandle || battery.productHandle;
      var url =
        '/products/' +
        encodeURIComponent(handle) +
        '?variant=' +
        encodeURIComponent(resolved.variant.id);

      if (trackId) {
        url += '&riift_track=' + encodeURIComponent(trackId);
      }
      if (batteryId) {
        url += '&riift_battery=' + encodeURIComponent(batteryId);
      }

      return url;
    });
  };

  RiiftWizard.prototype.renderResults = function (boards) {
    var rec = this.buildResult(boards);
    var self = this;
    var html = '';
    html += '<p class="riift-wizard__eyebrow">Your recommended setup</p>';
    html += '<h2 class="riift-wizard__title riift-wizard__title--results">' + esc(rec.headline) + '</h2>';
    html += '<p class="riift-wizard__match-line">' + esc(rec.matchLine) + '</p>';
    html += '<p class="riift-wizard__lede">' + esc(rec.blurb) + '</p>';
    html += '<div class="riift-wizard__result-card">';
    html +=
      '<div class="riift-wizard__result-row"><span class="riift-wizard__result-label">Tracks</span><span class="riift-wizard__result-value">' +
      esc(rec.trackLine) +
      '</span></div>';
    html +=
      '<div class="riift-wizard__result-row"><span class="riift-wizard__result-label">Battery Kit</span><span class="riift-wizard__result-value">' +
      esc(rec.packLine) +
      '</span></div>';
    html +=
      '<div class="riift-wizard__result-row"><span class="riift-wizard__result-label">Matched shaper</span><span class="riift-wizard__result-value">' +
      esc(rec.shaper) +
      '</span></div>';
    html +=
      '<div class="riift-wizard__result-row"><span class="riift-wizard__result-label">Est. run time</span><span class="riift-wizard__result-value">' +
      esc(rec.run) +
      '</span></div>';
    html += '</div>';
    if (rec.showWarn) {
      html += '<div class="riift-wizard__warn"><span class="riift-wizard__warn-icon">!</span>';
      html += '<p class="riift-wizard__warn-text">' + esc(rec.warn) + '</p></div>';
    }
    html += '<div class="riift-wizard__actions">';
    html += '<button type="button" class="riift-btn riift-btn--solid riift-wizard__buy" data-wz-buy>Buy now</button>';
    html += '<button type="button" class="riift-btn riift-btn--pill" data-wz-restart>Start over</button>';
    html += '</div>';
    html += '<p class="riift-caption riift-wizard__buy-error" data-wz-buy-error hidden></p>';

    this.el.resultsInner.innerHTML = html;
    this.el.resultsInner.classList.add('is-entering');

    this.el.resultsInner.querySelector('[data-wz-restart]').addEventListener('click', function () {
      self.setPhase('intro');
    });

    var buyBtn = this.el.resultsInner.querySelector('[data-wz-buy]');
    var errEl = this.el.resultsInner.querySelector('[data-wz-buy-error]');
    buyBtn.addEventListener('click', function () {
      buyBtn.classList.add('is-loading');
      buyBtn.disabled = true;
      errEl.hidden = true;
      self
        .buildProductUrl(rec.batteryId, rec.trackId)
        .then(function (url) {
          window.location.href = url;
        })
        .catch(function (err) {
          buyBtn.classList.remove('is-loading');
          buyBtn.disabled = false;
          errEl.textContent = err.message || 'Could not open product page.';
          errEl.hidden = false;
        });
    });
  };

  RiiftWizard.prototype.render = function (animateQuiz) {
    var phase = this.state.phase;
    var steps = this.config.steps;
    var total = steps.length;
    var progress = phase === 'results' ? 100 : phase === 'quiz' ? Math.round((this.state.step / total) * 100) : 0;

    if (this.el.progress) this.el.progress.style.width = progress + '%';

    if (this.el.status) {
      this.el.status.textContent =
        phase === 'results'
          ? 'Ranking locked'
          : phase === 'quiz'
            ? 'Question ' + (this.state.step + 1) + ' / ' + total
            : 'Ready';
    }

    if (this.el.intro) this.el.intro.hidden = phase !== 'intro';
    if (this.el.quiz) this.el.quiz.hidden = phase !== 'quiz';
    if (this.el.results) this.el.results.hidden = phase !== 'results';

    var boards = this.renderBoards();

    if (phase === 'quiz') this.renderQuiz(animateQuiz);
    if (phase === 'results') this.renderResults(boards);
  };

  function initRoot(root) {
    if (root.getAttribute('data-riift-wizard-init') === 'true') return;
    loadConfig(root)
      .then(function (config) {
        root.setAttribute('data-riift-wizard-init', 'true');
        root._riiftWizard = new RiiftWizard(root, config);
      })
      .catch(function (err) {
        console.error('[riift-wizard]', err);
      });
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-riift-wizard]').forEach(initRoot);
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add('riift-wizard-modal-open');
    initAll(modal);
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.classList.remove('riift-wizard-modal-open');
  }

  function bindModalTriggers() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('[data-riift-wizard-modal]:not([hidden])').forEach(function (modal) {
        closeModal(modal);
      });
    });
    document.querySelectorAll('[data-riift-wizard-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        var modalId = trigger.getAttribute('data-riift-wizard-open') || 'riift-wizard-modal';
        var modal = document.getElementById(modalId);
        if (!modal) return;
        e.preventDefault();
        openModal(modal);
      });
    });

    document.querySelectorAll('[data-riift-wizard-modal]').forEach(function (modal) {
      var backdrop = modal.querySelector('.riift-wizard-modal__backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', function (e) {
          if (e.target === backdrop) {
            closeModal(modal);
          }
        });
      }
      var closeBtn = modal.querySelector('[data-wz-modal-close-btn]');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          closeModal(modal);
        });
      }
    });
  }

  function boot() {
    initAll(document);
    bindModalTriggers();
  }

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
