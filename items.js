/* =====================================================
   items.js — BINUSVERSE Item Collection Page Logic
   Requires: items-data.js, user-data.js (in that order)
===================================================== */
(function () {
  'use strict';

  var RARITY_COLORS = {
    legendary: '#ff9500',
    epic:      '#c084fc',
    rare:      '#00e5ff',
    uncommon:  '#00ff88',
    common:    '#94a3b8',
  };

  /* MAX stock for bar width calculation */
  var MAX_STOCK = 20;

  /* ── Build SVG string ── */
  function buildSVG(svgContent) {
    return '<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' +
           svgContent + '</svg>';
  }

  /* ── Build one card HTML ── */
  function buildCard(key, def, stock, discovered) {
    if (!def) return '';
    var color     = RARITY_COLORS[def.rarity] || '#666';
    var isOwned   = stock > 0;
    var isLocked  = !discovered && !isOwned;

    var rarityClass = 'r-' + def.rarity;
    var lockClass   = isLocked ? ' locked' : (isOwned ? ' item-owned' : ' item-dimmed');
    var stockPct    = Math.min(100, (stock / MAX_STOCK) * 100);

    var stockBarHTML = isLocked
      ? '<div class="item-stock-wrap"><span class="item-stock-label-locked">LOCKED</span></div>'
      : '<div class="item-stock-wrap">' +
          '<div class="item-stock-bar-track">' +
            '<div class="item-stock-bar-fill" style="width:' + stockPct + '%"></div>' +
          '</div>' +
          '<span class="item-stock-count' + (stock === 0 ? ' empty' : '') + '">×' + stock + '</span>' +
          (isOwned ? '<span class="item-stock-label-owned">OWNED</span>' : '') +
        '</div>';

    return '<div class="item-card ' + rarityClass + lockClass + '"' +
      ' data-key="' + key + '"' +
      ' data-rarity="' + def.rarity + '"' +
      ' data-color="' + color + '"' +
      ' style="--item-color:' + color + ';--item-glow:' + color + '33">' +
      '<div class="item-rarity-tag">' + def.rarity.toUpperCase() + '</div>' +
      '<div class="item-type-badge ' + (def.itemType === 'battle' ? 'badge-usable' : 'badge-relic') + '">' +
        (def.itemType === 'battle' ? 'USABLE' : 'RELIC') +
      '</div>' +
      '<div class="item-card-icon">' + buildSVG(def.svgContent) + '</div>' +
      '<div class="item-card-body">' +
        '<div class="item-card-name">' + def.name + '</div>' +
        '<div class="item-card-type">' + def.type + '</div>' +
        '<div class="item-card-ability">' + def.ability + '</div>' +
        stockBarHTML +
      '</div>' +
    '</div>';
  }

  /* ── Render all 28 cards ── */
  function renderGrid() {
    var u           = (typeof BVUser !== 'undefined') ? BVUser.load() : { items: {}, discoveredItems: [] };
    var stocks      = u.items || {};
    var discovered  = u.discoveredItems || [];
    /* original 8 always discovered */
    var ORIGINALS   = ['eraser','freeze','retry','xp','shield','gem','warp','focus'];

    var grid   = document.getElementById('items-grid');
    var counter = document.getElementById('items-counter');
    if (!grid) return;
    if (typeof ITEMS_REGISTRY === 'undefined') return;

    var html          = '';
    var discoveredCount = 0;

    var keys = Object.keys(ITEMS_REGISTRY);
    keys.forEach(function (key) {
      var def        = ITEMS_REGISTRY[key];
      var stock      = stocks[key] || 0;
      var isOriginal = ORIGINALS.indexOf(key) !== -1;
      var isDiscovered = isOriginal || discovered.indexOf(key) !== -1 || stock > 0;
      if (isDiscovered) discoveredCount++;
      html += buildCard(key, def, stock, isDiscovered);
    });

    grid.innerHTML = html;
    if (counter) counter.textContent = discoveredCount + ' / 28 DISCOVERED';

    initTooltips();
    initFilter();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.dataset.filter;
        document.querySelectorAll('.item-card').forEach(function(card) {
          var key = card.dataset.key;
          var def = ITEMS_REGISTRY[key];
          if (!def) return;
          var show = true;
          if (filter === 'battle') show = def.itemType === 'battle';
          else if (filter === 'relic') show = def.itemType === 'relic';
          else if (filter === 'owned') {
            var u = typeof BVUser !== 'undefined' ? BVUser.load() : { items: {} };
            show = (u.items[key] || 0) > 0;
          }
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── Tooltip ── */
  function initTooltips() {
    var tip = document.getElementById('items-global-tooltip');
    if (!tip) return;

    document.querySelectorAll('.item-card:not(.locked)').forEach(function (card) {
      card.addEventListener('mouseenter', function (e) {
        var key   = card.dataset.key;
        var def   = ITEMS_REGISTRY[key];
        if (!def) return;
        var color = card.dataset.color || '#94a3b8';
        var u     = (typeof BVUser !== 'undefined') ? BVUser.load() : { items: {} };
        var stock = (u.items && u.items[key]) || 0;

        tip.innerHTML =
          '<div class="tip-name">'  + def.name  + '</div>' +
          '<div class="tip-type">'  + def.type  + '</div>' +
          '<div class="tip-divider"></div>' +
          '<div class="tip-stat"><span class="tip-stat-name">' + def.s1 + '</span><span class="tip-stat-val" style="color:' + color + '">' + def.v1 + '</span></div>' +
          '<div class="tip-stat"><span class="tip-stat-name">' + def.s2 + '</span><span class="tip-stat-val" style="color:' + color + '">' + def.v2 + '</span></div>' +
          '<div class="tip-stat"><span class="tip-stat-name">📦 Stock</span><span class="tip-stat-val" style="color:' + color + '">×' + stock + '</span></div>' +
          '<div class="tip-ability"><b>✦ ABILITY</b>' + def.ability + '</div>';

        tip.style.outline = '2px solid ' + color;
        tip.style.display = 'block';
        positionTip(e);
      });

      card.addEventListener('mousemove', positionTip);
      card.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
    });

    function positionTip(e) {
      var tw  = tip.offsetWidth  || 210;
      var th  = tip.offsetHeight || 150;
      var off = 14;
      var x   = e.clientX + off;
      var y   = e.clientY + off;
      if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - off;
      if (y + th > window.innerHeight - 8) y = e.clientY - th - off;
      if (x < 8) x = 8;
      if (y < 8) y = 8;
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
    }
  }

  /* ── Filter tabs ── */
  function initFilter() {
    var bar = document.getElementById('items-filter-bar');
    if (!bar) return;

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.items-filter-btn');
      if (!btn) return;

      bar.querySelectorAll('.items-filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var rarity = btn.dataset.rarity;
      document.querySelectorAll('.item-card').forEach(function (card) {
        if (rarity === 'all' || card.dataset.rarity === rarity) {
          card.classList.remove('filter-hidden');
        } else {
          card.classList.add('filter-hidden');
        }
      });
    });
  }

  /* ── Hamburger ── */
  function initHamburger() {
    var hb = document.getElementById('hamburger');
    var nl = document.getElementById('navLinks');
    if (hb && nl) {
      hb.addEventListener('click', function () { nl.classList.toggle('active'); });
    }
  }

  var _st = document.createElement('style');
  _st.textContent = '.item-type-badge{font-family:"Press Start 2P",monospace;font-size:.2rem;padding:2px 5px;margin-bottom:3px;letter-spacing:.5px;display:inline-block;}' +
    '.badge-usable{color:#00ff88;border:1px solid #00ff8844;background:rgba(0,255,136,.08);}' +
    '.badge-relic{color:#ff9500;border:1px solid #ff950044;background:rgba(255,149,0,.08);}';
  document.head.appendChild(_st);

  document.addEventListener('DOMContentLoaded', function () {
    renderGrid();
    initHamburger();
  });

})();
