// =============================================
// RANK PLATE — config + injector
// =============================================
var RANK_PLATE_CFG = {
  'Unranked': {
    color: '#555555', bg: 'rgba(85,85,85,0.08)',
    pulse: false, glow: false, speed: null,
    svgIcon:
      '<rect x="2" y="2" width="4" height="4" fill="#555"/>',
  },
  'Bronze': {
    color: '#cd7f32', bg: 'rgba(205,127,50,0.08)',
    pulse: false, glow: false, speed: null,
    svgIcon:
      '<rect x="1" y="0" width="6" height="2" fill="#cd7f32"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#cd7f32"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#cd7f32"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#a0521a"/>' +
      '<rect x="1" y="2" width="2" height="2" fill="#e8a060" opacity="0.5"/>',
  },
  'Silver': {
    color: '#a8a9ad', bg: 'rgba(168,169,173,0.08)',
    pulse: false, glow: false, speed: null,
    svgIcon:
      '<rect x="1" y="0" width="6" height="2" fill="#a8a9ad"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#a8a9ad"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#a8a9ad"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#787878"/>' +
      '<rect x="1" y="2" width="2" height="2" fill="#ddd" opacity="0.5"/>',
  },
  'Gold': {
    color: '#ffd700', bg: 'rgba(255,215,0,0.08)',
    pulse: true, glow: false, speed: '2s',
    svgIcon:
      '<rect x="1" y="0" width="6" height="2" fill="#ffd700"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#ffd700"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#ffd700"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#cc9900"/>' +
      '<rect x="3" y="2" width="2" height="2" fill="#fff" opacity="0.5"/>',
  },
  'Platinum': {
    color: '#e5e4e2', bg: 'rgba(229,228,226,0.08)',
    pulse: true, glow: false, speed: '2s',
    svgIcon:
      '<rect x="1" y="0" width="6" height="1" fill="#e5e4e2"/>' +
      '<rect x="0" y="1" width="8" height="1" fill="#e5e4e2"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#e5e4e2"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#e5e4e2"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#b0b0b0"/>' +
      '<rect x="2" y="3" width="4" height="1" fill="#fff" opacity="0.5"/>',
  },
  'Diamond': {
    color: '#b9f2ff', bg: 'rgba(185,242,255,0.08)',
    pulse: true, glow: true, speed: '1.4s',
    svgIcon:
      '<rect x="3" y="0" width="2" height="2" fill="#b9f2ff"/>' +
      '<rect x="1" y="2" width="6" height="2" fill="#b9f2ff"/>' +
      '<rect x="0" y="4" width="8" height="2" fill="#7ad0f0"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#b9f2ff"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#7ad0f0"/>' +
      '<rect x="2" y="2" width="2" height="2" fill="#fff" opacity="0.5"/>',
  },
  'Legend': {
    color: '#fee783', bg: 'rgba(254,231,131,0.08)',
    pulse: true, glow: true, speed: '0.9s',
    svgIcon:
      '<rect x="0" y="3" width="2" height="2" fill="#fee783"/>' +
      '<rect x="3" y="1" width="2" height="2" fill="#fee783"/>' +
      '<rect x="6" y="3" width="2" height="2" fill="#fee783"/>' +
      '<rect x="0" y="5" width="8" height="3" fill="#fee783"/>' +
      '<rect x="0" y="7" width="8" height="1" fill="#cc9900"/>' +
      '<rect x="1" y="2" width="1" height="1" fill="#fff" opacity="0.6"/>' +
      '<rect x="4" y="1" width="1" height="1" fill="#fff" opacity="0.6"/>',
  },
};

function injectRankPlate(rank, totalXP) {
  var statsCard = document.querySelector('.stats-card');
  if (!statsCard) return;

  var cfg = RANK_PLATE_CFG[rank] || RANK_PLATE_CFG['Unranked'];

  /* build icon SVG */
  var iconSVG =
    '<svg class="rp-icon" width="32" height="32" viewBox="0 0 8 8" ' +
    'xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' +
    cfg.svgIcon + '</svg>';

  /* build max rank line for Legend */
  var maxLine = (rank === 'Legend')
    ? '<div class="rp-max">✦ MAX RANK</div>'
    : '';

  var plateHTML =
    '<div id="bv-rank-plate"' +
    ' class="' + [cfg.pulse ? 'rp-pulse' : '', cfg.glow ? 'rp-glow' : ''].filter(Boolean).join(' ') + '"' +
    ' style="' +
      '--rp-color:' + cfg.color + ';' +
      '--rp-bg:'    + cfg.bg    + ';' +
      '--rp-glow:'  + (cfg.glow ? cfg.color : 'transparent') + ';' +
      '--rp-speed:' + (cfg.speed || '2s') + '">' +
      iconSVG +
      '<div class="rp-info">' +
        '<div class="rp-name">' + rank.toUpperCase() + '</div>' +
        '<div class="rp-xp">'  + (totalXP || 0) + ' XP</div>' +
        maxLine +
      '</div>' +
    '</div>';

  /* idempotent — replace if exists */
  var existing = document.getElementById('bv-rank-plate');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
  statsCard.insertAdjacentHTML('beforeend', plateHTML);
}

// =============================================
// PROFILE — populate from localStorage
// =============================================
function populateProfile() {
  if (typeof BVUser === 'undefined') return;
  var u = BVUser.load();

  // Mission Status stats
  var set = function(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('stat-rank',    u.rank);
  injectRankPlate(u.rank, u.totalXP);
  set('stat-level',   u.level);
  set('stat-streak',  u.streak + 'x');
  set('stat-winrate', u.winRate + '%');
  set('stat-battles', u.totalBattles);

  // ── Skill XP bars + level badges ──
  var skillDefs = [
    { key:'ai',    pctId:'skill-ai-pct',    fillId:'skill-ai-fill'    },
    { key:'cyber', pctId:'skill-cyber-pct', fillId:'skill-cyber-fill' },
    { key:'data',  pctId:'skill-data-pct',  fillId:'skill-data-fill'  },
  ];
  skillDefs.forEach(function(sd) {
    var xp  = u.skills[sd.key] || 0;
    var lv  = BVUser.getSkillLevel(xp);
    var pctEl  = document.getElementById(sd.pctId);
    var fillEl = document.getElementById(sd.fillId);
    if (pctEl)  pctEl.textContent  = xp + '%';
    if (fillEl) fillEl.style.width = xp + '%';

    // Inject/update level badge next to the XP label
    var pctParent = pctEl ? pctEl.parentElement : null;
    if (pctParent) {
      var existing = pctParent.querySelector('.skill-lv-badge');
      if (!existing) {
        existing = document.createElement('span');
        existing.className = 'skill-lv-badge';
        pctParent.insertBefore(existing, pctEl.parentElement ? null : pctEl);
        pctParent.appendChild(existing);
      }
      existing.textContent = 'LV.' + lv;
      existing.title = BVUser.getSkillPassive(sd.key, lv);
    }
  });

  // ── Armory — update all 8 items stock + visual state ──
  var ITEM_IDS = ['eraser','freeze','retry','xp','shield','gem','warp','focus'];
  ITEM_IDS.forEach(function(k) {
    var box = document.getElementById('item-' + k);
    if (!box) return;
    var count = (u.items && u.items[k]) || 0;
    // Update tooltip stock
    box.dataset.tipV3 = count + '×';
    // Stock visual state
    if (count > 0) {
      box.classList.remove('item-empty');
      box.classList.add('item-stocked');
    } else {
      box.classList.add('item-empty');
      box.classList.remove('item-stocked');
    }
    // Update or inject stock badge
    var badge = box.querySelector('.armory-stock-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'armory-stock-badge';
      box.appendChild(badge);
    }
    badge.textContent = count > 0 ? '×' + count : 'EMPTY';
    badge.style.color = count > 0 ? '#00ff88' : 'rgba(255,255,255,.2)';
  });

  // Daily mission — show "✓ DONE TODAY" badge if completed today
  var doneBadge = document.getElementById('daily-done-badge');
  if (doneBadge) {
    var today = new Date().toDateString();
    if (u.dailyCompletedDate === today) {
      doneBadge.classList.remove('hidden');
    } else {
      doneBadge.classList.add('hidden');
    }
  }
}

// =============================================
// MASCOT — speech bubbles on click
// =============================================
var MASCOT_TIPS = [
  'Train daily to\nkeep your streak!',
  'Raid mode gives\nbig XP rewards!',
  'Use items wisely\nin battle!',
  'Check Grimoire\nfor knowledge!',
  'Earn XP to\nlevel up fast!',
  'S Rank = 100%\ncorrect answers!',
  'Freeze item adds\n+10 seconds!',
  '3x streak gives\na fire bonus!',
  'Daily quiz done?\nGood work!',
  'Discuss answers\non The Commons!',
];
var _mascotTimer = null;

function initMascot() {
  var wrap   = document.getElementById('mascot-wrap');
  var bubble = document.getElementById('mascot-bubble');
  if (!wrap || !bubble) return;

  // Show a random tip on click
  wrap.addEventListener('click', function () {
    clearTimeout(_mascotTimer);
    var tip = MASCOT_TIPS[0 | Math.random() * MASCOT_TIPS.length];
    bubble.innerHTML = tip.replace(/\n/g, '<br>');
    bubble.classList.remove('hidden');
    _mascotTimer = setTimeout(function () { bubble.classList.add('hidden'); }, 3000);
  });

  // Idle greeting after 4s
  setTimeout(function () {
    if (!bubble.classList.contains('hidden')) return;
    bubble.innerHTML = 'Click me!';
    bubble.classList.remove('hidden');
    _mascotTimer = setTimeout(function () { bubble.classList.add('hidden'); }, 2500);
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {

  // Fetch profile from backend, sync to localStorage, then populate UI
  if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
    BVAPI.getProfile()
      .then(function (profile) {
        if (typeof BVUser !== 'undefined') BVUser.syncFromBackend(profile);
      })
      .catch(function () { /* offline or error — use cached local data */ })
      .finally(function () {
        populateProfile();
        initMascot();
      });
  } else {
    populateProfile();
    initMascot();
  }


  // =============================================
  // VR ENTRANCE — fixed overlay, never touches body filter
  // (filter on body breaks position:fixed particles + mascot)
  // =============================================
  if (sessionStorage.getItem('bv_entering')) {
    sessionStorage.removeItem('bv_entering');

    // Inject keyframe once
    var entStyle = document.createElement('style');
    entStyle.textContent =
      '@keyframes bvOverlayFade{' +
        '0%  {opacity:1;filter:blur(18px) brightness(2.5);}' +
        '50% {filter:blur(6px) brightness(1.3);}' +
        '100%{opacity:0;filter:blur(0) brightness(1);}' +
      '}';
    document.head.appendChild(entStyle);

    // Fixed overlay div — filter stays here, never on body
    var ov = document.createElement('div');
    ov.style.cssText =
      'position:fixed;inset:0;' +
      'background:#fff;' +
      'z-index:99998;' +
      'pointer-events:none;' +
      'animation:bvOverlayFade 1.3s ease-out forwards;';
    document.body.appendChild(ov);

    setTimeout(function() { ov.remove(); entStyle.remove(); }, 1350);
  }

  // =============================================
  // HOME — Hamburger menu toggle
  // =============================================
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // =============================================
  // ARMORY TOOLTIP — position:fixed, bebas clip-path
  // =============================================
  const RARITY_COLORS = {
    'r-legendary': '#ff9500',
    'r-epic':      '#c084fc',
    'r-rare':      '#00e5ff',
    'r-uncommon':  '#00ff88',
    'r-common':    '#94a3b8'
  };

  const tip = document.getElementById('armory-global-tooltip');
  if (!tip) return;

  document.querySelectorAll('.armory-box').forEach(box => {
    box.addEventListener('mouseenter', function(e) {
      const r = this.dataset.tipRarity || 'r-common';
      const c = RARITY_COLORS[r] || '#94a3b8';

      tip.innerHTML = `
        <div class="tip-name">${this.dataset.tipName || ''}</div>
        <div class="tip-type">${this.dataset.tipType || ''}</div>
        <div class="tip-divider"></div>
        <div class="tip-stat">
          <span class="tip-stat-name">${this.dataset.tipS1 || ''}</span>
          <span class="tip-stat-val" style="color:${c}">${this.dataset.tipV1 || ''}</span>
        </div>
        <div class="tip-stat">
          <span class="tip-stat-name">${this.dataset.tipS2 || ''}</span>
          <span class="tip-stat-val" style="color:${c}">${this.dataset.tipV2 || ''}</span>
        </div>
        <div class="tip-stat">
          <span class="tip-stat-name">${this.dataset.tipS3 || ''}</span>
          <span class="tip-stat-val" style="color:${c}">${this.dataset.tipV3 || ''}</span>
        </div>
        <div class="tip-ability"><b>✦ QUIZ ABILITY</b>${this.dataset.tipAbility || ''}</div>
      `;
      tip.style.outline = `2px solid ${c}`;
      tip.style.setProperty('--tip-arrow-color', c);
      tip.style.display = 'block';

      // arrow color
      tip.style.cssText += `; --ac:${c}`;
      positionTip(e);
    });

    box.addEventListener('mousemove', positionTip);
    box.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  });

  function positionTip(e) {
    if (!tip) return;
    const tw = tip.offsetWidth  || 210;
    const th = tip.offsetHeight || 150;
    let x = e.clientX - tw / 2;
    let y = e.clientY - th - 18;
    if (x < 8) x = 8;
    if (x + tw > window.innerWidth - 8) x = window.innerWidth - tw - 8;
    if (y < 8) y = e.clientY + 18;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }



  // =============================================
  // SKILL CARDS — sparkle particles
  // =============================================
  const skillSparkConfigs = [
    { id: 'sparks-ai',    color: '#00e5ff', count: 6 },
    { id: 'sparks-cyber', color: '#ff3bff', count: 6 },
    { id: 'sparks-data',  color: '#00ff88', count: 6 }
  ];

  skillSparkConfigs.forEach(cfg => {
    const container = document.getElementById(cfg.id);
    if (!container) return;
    for (let i = 0; i < cfg.count; i++) {
      const sp = document.createElement('div');
      sp.className = 'skill-spark';
      sp.style.cssText = `left:${10 + Math.random() * 80}%;top:${10 + Math.random() * 80}%;color:${cfg.color};animation-delay:${Math.random() * 1.5}s;animation-duration:${1 + Math.random() * 0.8}s`;
      container.appendChild(sp);
    }
  });

  // =============================================
  // MISSION AURA — flying pixel particles
  // =============================================
  const missionContainer = document.querySelector('.mission-container');
  if (missionContainer) {
    const PX_COLORS = ['#00c3ff', '#87cefa', '#4db8ff', '#00e5ff', '#a5d8ff', '#c0eeff'];
    const ANIMS    = ['missionPxFloatL', 'missionPxFloatR'];
    const SIZES    = [2, 2, 2, 4, 4, 6];

    for (let i = 0; i < 32; i++) {
      const p   = document.createElement('div');
      p.className = 'mission-px-particle';
      const sz   = SIZES[0 | Math.random() * SIZES.length];
      const dur  = 2.5 + Math.random() * 3.5;       // 2.5–6 s
      const del  = -(Math.random() * dur);          // start mid-cycle so not all sync
      const anim = ANIMS[0 | Math.random() * 2];
      const col  = PX_COLORS[0 | Math.random() * PX_COLORS.length];

      p.style.cssText =
        `width:${sz}px;` +
        `height:${sz}px;` +
        `background:${col};` +
        `left:${-2 + Math.random() * 104}%;` +
        `top:${5 + Math.random() * 88}%;` +
        `animation:${anim} ${dur.toFixed(1)}s linear ${del.toFixed(1)}s infinite;`;

      missionContainer.appendChild(p);
    }
  }

});