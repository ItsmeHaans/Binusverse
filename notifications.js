/**
 * BVNotify — Pixel RPG Notification System
 * BINUSVERSE | pixelate fantasy exploration theme
 * Exposes: window.BVNotify = { toast, levelUp, rankUp, itemEarned }
 */
(function (global) {
  'use strict';

  // ─── Inject CSS ────────────────────────────────────────────────────────────
  var STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* ── TOAST ── */
#bvn-toast-container {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.bvn-toast {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.624rem;
  line-height: 1.6;
  padding: 10px 14px 10px 10px;
  border: 2px solid #00e5ff;
  background: #0d0f20;
  color: #e0f7ff;
  image-rendering: pixelated;
  box-shadow:
    4px 4px 0 #001a2e,
    0 0 12px rgba(0,229,255,0.25);
  min-width: 180px;
  max-width: 260px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: bvnToastIn 0.12s steps(3) forwards, bvnToastOut 0.2s steps(4) forwards 2.6s;
  pointer-events: auto;
  position: relative;
  clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
}
.bvn-toast::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,transparent,rgba(0,229,255,0.6),transparent);
  animation: bvnScanLine 1.2s steps(6) infinite;
}
.bvn-toast.type-success { border-color:#00ff88; box-shadow:4px 4px 0 #002a18,0 0 12px rgba(0,255,136,0.25); color:#ccffe8; }
.bvn-toast.type-error   { border-color:#ff4444; box-shadow:4px 4px 0 #2a0000,0 0 12px rgba(255,68,68,0.25); color:#ffd0d0; }
.bvn-toast.type-warn    { border-color:#ff9500; box-shadow:4px 4px 0 #2a1400,0 0 12px rgba(255,149,0,0.25); color:#ffe0b0; }
.bvn-toast.type-xp      { border-color:#fee783; box-shadow:4px 4px 0 #2a2000,0 0 12px rgba(254,231,131,0.35); color:#fffbe0; }
.bvn-toast.type-item    { border-color:#c084fc; box-shadow:4px 4px 0 #1a0030,0 0 12px rgba(192,132,252,0.25); color:#f0d0ff; }

.bvn-toast-icon { font-size: 0.9rem; flex-shrink:0; margin-top:1px; }
.bvn-toast-body { flex:1; }
.bvn-toast-title { font-size:0.44rem; margin-bottom:3px; }
.bvn-toast-msg   { font-size:0.38rem; opacity:0.85; }

@keyframes bvnToastIn {
  from { opacity:0; transform:translateX(40px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes bvnToastOut {
  from { opacity:1; transform:translateX(0); }
  to   { opacity:0; transform:translateX(40px); }
}
@keyframes bvnScanLine {
  0%   { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}

/* ── LEVEL UP OVERLAY ── */
#bvn-levelup {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: rgba(0,0,0,0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: bvnLUFadeIn 0.1s steps(2) forwards;
}
@keyframes bvnLUFadeIn {
  from { background:rgba(0,0,0,0); }
  to   { background:rgba(6,4,20,0.88); }
}

.bvn-lu-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bvn-lu-box {
  font-family: 'Press Start 2P', monospace;
  text-align: center;
  position: relative;
  z-index: 2;
  animation: bvnLUBoxPop 0.25s steps(5) forwards;
}
@keyframes bvnLUBoxPop {
  0%   { transform: scale(0.2); opacity:0; }
  60%  { transform: scale(1.15); opacity:1; }
  100% { transform: scale(1);    opacity:1; }
}

.bvn-lu-sub {
  font-size: 0.6rem;
  color: #fee783;
  letter-spacing: 0.2em;
  margin-bottom: 12px;
  text-shadow: 0 0 8px #fee783, 2px 2px 0 #a07000;
  animation: bvnFlicker 0.4s steps(2) infinite;
}
.bvn-lu-main {
  font-size: clamp(1.4rem,5vw,2.6rem);
  color: #fff;
  text-shadow:
    0 0 20px #fee783,
    0 0 40px #ff9500,
    4px 4px 0 #a05000,
    8px 8px 0 #603000;
  line-height: 1.1;
  margin-bottom: 16px;
}
.bvn-lu-levels {
  font-size: 0.65rem;
  color: #aac4ff;
  letter-spacing: 0.1em;
}
.bvn-lu-levels b { color:#fff; }

@keyframes bvnFlicker {
  0%,100% { opacity:1; } 50% { opacity:0.4; }
}

/* ── RANK UP OVERLAY ── */
#bvn-rankup {
  position: fixed;
  inset: 0;
  z-index: 99997;
  background: rgba(6,4,20,0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.bvn-ru-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bvn-ru-box {
  font-family: 'Press Start 2P', monospace;
  text-align: center;
  position: relative;
  z-index: 2;
  animation: bvnLUBoxPop 0.3s steps(6) forwards;
}

.bvn-ru-crown {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
  animation: bvnCrownSpin 0.6s steps(4) 0.3s forwards;
  transform: rotate(0deg);
}
@keyframes bvnCrownSpin {
  0%   { transform:rotate(-20deg) scale(0.8); }
  50%  { transform:rotate(10deg)  scale(1.2); }
  100% { transform:rotate(0deg)   scale(1);   }
}

.bvn-ru-sub {
  font-size: 0.55rem;
  color: #94a3b8;
  letter-spacing: 0.3em;
  margin-bottom: 10px;
}
.bvn-ru-rank {
  font-size: clamp(1.2rem,4.5vw,2.2rem);
  margin-bottom: 10px;
  text-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}
.bvn-ru-desc {
  font-size: 0.45rem;
  color: #aac4ff;
  letter-spacing: 0.1em;
}

/* ── ITEM EARNED POPUP ── */
#bvn-item-popup {
  position: fixed;
  inset: 0;
  z-index: 99996;
  background: rgba(6,4,20,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.bvn-ip-card {
  font-family: 'Press Start 2P', monospace;
  background: #0d0f20;
  border: 3px solid #c084fc;
  box-shadow:
    6px 6px 0 #1a0030,
    0 0 30px rgba(192,132,252,0.4);
  padding: 28px 32px;
  text-align: center;
  position: relative;
  clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  animation: bvnLUBoxPop 0.2s steps(4) forwards;
}
.bvn-ip-card::before, .bvn-ip-card::after {
  content: '✦';
  position: absolute;
  font-size: 0.6rem;
  color: #c084fc;
  animation: bvnFlicker 0.6s steps(2) infinite;
}
.bvn-ip-card::before { top:8px; left:10px; }
.bvn-ip-card::after  { bottom:8px; right:10px; animation-delay:0.3s; }

.bvn-ip-eyebrow {
  font-size: 0.42rem;
  color: #c084fc;
  letter-spacing: 0.25em;
  margin-bottom: 16px;
  animation: bvnFlicker 0.5s steps(2) infinite;
}
.bvn-ip-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  display: block;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 12px rgba(192,132,252,0.8));
  animation: bvnItemBob 0.8s steps(4) infinite;
}
@keyframes bvnItemBob {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-6px); }
}

.bvn-ip-name {
  font-size: 0.7rem;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 2px 2px 0 #1a0030;
}
.bvn-ip-desc {
  font-size: 0.42rem;
  color: #d4b8ff;
  line-height: 1.8;
  margin-bottom: 18px;
}
.bvn-ip-count {
  font-size: 0.52rem;
  color: #fee783;
  text-shadow: 2px 2px 0 #604010;
}

/* ── HIDDEN UTIL ── */
.bvn-hidden { display:none !important; }
`;

  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // ─── Toast Container ────────────────────────────────────────────────────────
  var toastWrap = document.createElement('div');
  toastWrap.id = 'bvn-toast-container';
  document.body.appendChild(toastWrap);

  // ─── Particle helpers ───────────────────────────────────────────────────────
  function spawnCanvasParticles(canvas, opts) {
    opts = opts || {};
    var ctx    = canvas.getContext('2d');
    var W      = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    var H      = canvas.height = canvas.offsetHeight || window.innerHeight;
    var count  = opts.count  || 120;
    var colors = opts.colors || ['#fee783','#ff9500','#fff','#00e5ff','#c084fc'];
    var gravity = opts.gravity != null ? opts.gravity : 0.12;
    var particles = [];

    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * (opts.maxSpeed || 7);
      var sz    = (opts.sizes || [3,4,6,8])[Math.floor(Math.random() * 4)];
      particles.push({
        x:  opts.cx != null ? opts.cx : W / 2,
        y:  opts.cy != null ? opts.cy : H / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (opts.upBias || 2),
        col: colors[Math.floor(Math.random() * colors.length)],
        sz: sz,
        life: 1,
        decay: 0.008 + Math.random() * 0.012
      });
    }

    var raf;
    function tick() {
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        if (p.life <= 0) continue;
        alive = true;
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += gravity;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.col;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz);
      }
      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function () { cancelAnimationFrame(raf); };
  }

  // ─── Item SVG library ───────────────────────────────────────────────────────
  var ITEM_DEFS = {
    eraser: {
      name: 'Phantom Eraser',
      desc: 'Eliminates 2 wrong\nanswer choices instantly',
      color: '#ff9500',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="1" y="5" width="14" height="7" fill="#ff9500"/>
        <rect x="1" y="5" width="14" height="3" fill="#ffb700"/>
        <rect x="1" y="8" width="14" height="1" fill="#cc7700"/>
        <rect x="1" y="9" width="14" height="3" fill="#f0d0a0"/>
        <rect x="3" y="2" width="1" height="1" fill="#ff4444"/>
        <rect x="4" y="3" width="1" height="1" fill="#ff4444"/>
        <rect x="5" y="2" width="1" height="1" fill="#ff4444"/>
        <rect x="9" y="2" width="1" height="1" fill="#ff4444"/>
        <rect x="10" y="3" width="1" height="1" fill="#ff4444"/>
        <rect x="11" y="2" width="1" height="1" fill="#ff4444"/>
      </svg>`
    },
    freeze: {
      name: 'Time Freeze Orb',
      desc: 'Adds +10 seconds\nto the battle timer',
      color: '#c084fc',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="3" y="1" width="10" height="2" fill="#7c3aed"/>
        <rect x="2" y="2" width="12" height="10" fill="#6d28d9"/>
        <rect x="1" y="4" width="14" height="6" fill="#7c3aed"/>
        <rect x="3" y="12" width="10" height="2" fill="#6d28d9"/>
        <rect x="5" y="4" width="6" height="6" fill="#1a0a2e"/>
        <rect x="6" y="3" width="4" height="1" fill="#c084fc"/>
        <rect x="4" y="5" width="1" height="4" fill="#c084fc"/>
        <rect x="11" y="5" width="1" height="4" fill="#c084fc"/>
        <rect x="6" y="10" width="4" height="1" fill="#c084fc"/>
        <rect x="7" y="5" width="1" height="3" fill="#fff"/>
        <rect x="7" y="7" width="3" height="1" fill="#fff"/>
        <rect x="7" y="7" width="1" height="1" fill="#fee783"/>
      </svg>`
    },
    retry: {
      name: '2nd Chance Scroll',
      desc: 'Retry a wrong answer\nwithout any penalty',
      color: '#00e5ff',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="2" y="0" width="12" height="2" fill="#b87333"/>
        <rect x="1" y="1" width="14" height="2" fill="#d4a96a"/>
        <rect x="2" y="2" width="12" height="1" fill="#b87333"/>
        <rect x="1" y="3" width="14" height="9" fill="#fdf3dc"/>
        <rect x="3" y="4" width="10" height="1" fill="#a0a8d0"/>
        <rect x="3" y="6" width="8" height="1" fill="#a0a8d0"/>
        <rect x="5" y="5" width="6" height="1" fill="#00e5ff"/>
        <rect x="10" y="5" width="1" height="3" fill="#00e5ff"/>
        <rect x="9" y="7" width="2" height="1" fill="#00e5ff"/>
        <rect x="5" y="4" width="3" height="1" fill="#00e5ff"/>
        <rect x="2" y="12" width="12" height="1" fill="#b87333"/>
        <rect x="1" y="13" width="14" height="2" fill="#d4a96a"/>
      </svg>`
    },
    xp: {
      name: 'XP Magnet',
      desc: 'Multiplies XP earned\nthis question by ×1.5',
      color: '#fee783',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="2" y="2" width="4" height="10" fill="#94a3b8"/>
        <rect x="10" y="2" width="4" height="10" fill="#94a3b8"/>
        <rect x="2" y="2" width="12" height="3" fill="#64748b"/>
        <rect x="3" y="5" width="2" height="7" fill="#0d0f20"/>
        <rect x="11" y="5" width="2" height="7" fill="#0d0f20"/>
        <rect x="2" y="12" width="4" height="3" fill="#ef4444"/>
        <rect x="10" y="12" width="4" height="3" fill="#3b82f6"/>
        <rect x="6" y="5" width="1" height="1" fill="#fee783"/>
        <rect x="7" y="4" width="2" height="1" fill="#fee783"/>
        <rect x="9" y="5" width="1" height="1" fill="#fee783"/>
      </svg>`
    },
    shield: {
      name: 'Aegis Shield',
      desc: 'Absorbs 1 wrong answer\nwith no penalty',
      color: '#00e5ff',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="3" y="1" width="10" height="2" fill="#00b8d4"/>
        <rect x="2" y="3" width="12" height="7" fill="#00e5ff"/>
        <rect x="1" y="4" width="14" height="5" fill="#00e5ff"/>
        <rect x="3" y="10" width="10" height="2" fill="#00b8d4"/>
        <rect x="5" y="12" width="6" height="2" fill="#00b8d4"/>
        <rect x="7" y="14" width="2" height="1" fill="#00b8d4"/>
        <rect x="4" y="4" width="8" height="5" fill="#001a22"/>
        <rect x="5" y="5" width="2" height="3" fill="#00e5ff"/>
        <rect x="7" y="4" width="2" height="5" fill="#00e5ff"/>
        <rect x="9" y="5" width="2" height="3" fill="#00e5ff"/>
      </svg>`
    },
    gem: {
      name: 'Soul Gem',
      desc: 'Reveals correct answer\nfor 2 seconds',
      color: '#c084fc',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="5" y="1" width="6" height="2" fill="#9333ea"/>
        <rect x="3" y="3" width="10" height="2" fill="#a855f7"/>
        <rect x="2" y="5" width="12" height="6" fill="#c084fc"/>
        <rect x="3" y="11" width="10" height="2" fill="#a855f7"/>
        <rect x="5" y="13" width="6" height="2" fill="#9333ea"/>
        <rect x="6" y="5" width="4" height="6" fill="#e9d5ff"/>
        <rect x="5" y="6" width="1" height="4" fill="#e9d5ff"/>
        <rect x="10" y="6" width="1" height="4" fill="#e9d5ff"/>
        <rect x="7" y="4" width="2" height="1" fill="#fff"/>
      </svg>`
    },
    warp: {
      name: 'Time Warp',
      desc: 'Skip question and\ngain 50% XP',
      color: '#ff9500',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="6" y="0" width="4" height="2" fill="#ff9500"/>
        <rect x="4" y="1" width="8" height="2" fill="#ffd000"/>
        <rect x="2" y="3" width="12" height="10" fill="#ff9500"/>
        <rect x="1" y="5" width="14" height="6" fill="#ffb700"/>
        <rect x="4" y="13" width="8" height="2" fill="#ff9500"/>
        <rect x="6" y="14" width="4" height="2" fill="#cc7000"/>
        <rect x="4" y="5" width="3" height="6" fill="#1a0800"/>
        <rect x="9" y="5" width="3" height="6" fill="#1a0800"/>
        <rect x="7" y="3" width="2" height="2" fill="#fff"/>
        <rect x="7" y="5" width="2" height="4" fill="#fee783"/>
        <rect x="6" y="7" width="4" height="2" fill="#fee783"/>
      </svg>`
    },
    focus: {
      name: 'Focus Potion',
      desc: 'Pauses the timer\nfor 5 seconds',
      color: '#00ff88',
      svg: `<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
        <rect x="6" y="0" width="4" height="2" fill="#94a3b8"/>
        <rect x="5" y="2" width="6" height="2" fill="#64748b"/>
        <rect x="4" y="4" width="8" height="9" fill="#00ff88"/>
        <rect x="3" y="5" width="10" height="7" fill="#00c060"/>
        <rect x="4" y="12" width="8" height="2" fill="#00ff88"/>
        <rect x="5" y="14" width="6" height="2" fill="#059669"/>
        <rect x="5" y="6" width="6" height="5" fill="#001a0a"/>
        <rect x="6" y="7" width="1" height="3" fill="#00ff88"/>
        <rect x="7" y="6" width="2" height="5" fill="#00ff88"/>
        <rect x="9" y="7" width="1" height="3" fill="#00ff88"/>
      </svg>`
    }
  };

  // ─── API ─────────────────────────────────────────────────────────────────────

  /**
   * BVNotify.toast(msg, type, icon)
   * type: 'info' | 'success' | 'error' | 'warn' | 'xp' | 'item'
   * icon: emoji or short string
   */
  function toast(msg, type, icon) {
    type = type || 'info';
    icon = icon || '⚔';

    var el = document.createElement('div');
    el.className = 'bvn-toast type-' + type;
    el.innerHTML =
      '<span class="bvn-toast-icon">' + icon + '</span>' +
      '<div class="bvn-toast-body"><div class="bvn-toast-msg">' + msg + '</div></div>';

    toastWrap.appendChild(el);
    el.addEventListener('animationend', function (e) {
      if (e.animationName === 'bvnToastOut') el.remove();
    });
    // Auto-remove safety fallback
    setTimeout(function () { if (el.parentNode) el.remove(); }, 3200);
  }

  /**
   * BVNotify.levelUp(fromLevel, toLevel)
   * Full-screen explosion — auto dismisses after 2.8s
   */
  function levelUp(fromLevel, toLevel) {
    var overlay = document.createElement('div');
    overlay.id = 'bvn-levelup';

    var cnv = document.createElement('canvas');
    cnv.className = 'bvn-lu-canvas';
    overlay.appendChild(cnv);

    var box = document.createElement('div');
    box.className = 'bvn-lu-box';
    box.innerHTML =
      '<div class="bvn-lu-sub">✦ LEVEL UP! ✦</div>' +
      '<div class="bvn-lu-main">LVL ' + toLevel + '</div>' +
      '<div class="bvn-lu-levels"><b>' + fromLevel + '</b> → <b>' + toLevel + '</b></div>';
    overlay.appendChild(box);

    document.body.appendChild(overlay);

    // fire particles after brief delay so canvas has size
    setTimeout(function () {
      var stopPfx = spawnCanvasParticles(cnv, {
        count: 160,
        colors: ['#fee783','#ff9500','#fff','#00e5ff','#c084fc','#ff3bff'],
        maxSpeed: 9,
        upBias: 4,
        gravity: 0.15,
        sizes: [4,6,8,10]
      });
      setTimeout(function () {
        stopPfx();
        overlay.style.animation = 'bvnLUFadeIn 0.3s steps(3) reverse forwards';
        setTimeout(function () { overlay.remove(); }, 350);
      }, 2400);
    }, 60);
  }

  /**
   * BVNotify.rankUp(rankName, color)
   * Dramatic rank announcement — auto dismisses after 3.2s
   */
  function rankUp(rankName, color) {
    color = color || '#fee783';
    var RANK_ICONS = {
      Bronze:   '🥉', Silver: '🥈', Gold: '🥇',
      Platinum: '💎', Diamond: '💠', Legend: '👑'
    };
    var icon = RANK_ICONS[rankName] || '⭐';

    var overlay = document.createElement('div');
    overlay.id = 'bvn-rankup';

    var cnv = document.createElement('canvas');
    cnv.className = 'bvn-ru-canvas';
    overlay.appendChild(cnv);

    var box = document.createElement('div');
    box.className = 'bvn-ru-box';
    box.innerHTML =
      '<span class="bvn-ru-crown">' + icon + '</span>' +
      '<div class="bvn-ru-sub">RANK ACHIEVED</div>' +
      '<div class="bvn-ru-rank" style="color:' + color + ';text-shadow:4px 4px 0 rgba(0,0,0,0.6),0 0 20px ' + color + '">' + rankName.toUpperCase() + '</div>' +
      '<div class="bvn-ru-desc">New power unlocked!</div>';
    overlay.appendChild(box);

    document.body.appendChild(overlay);

    setTimeout(function () {
      var stopPfx = spawnCanvasParticles(cnv, {
        count: 200,
        colors: [color, '#fff', '#fee783', '#fff', color],
        maxSpeed: 11,
        upBias: 3,
        gravity: 0.1,
        sizes: [4,6,8,12]
      });
      setTimeout(function () {
        stopPfx();
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(function () { overlay.remove(); }, 350);
      }, 2800);
    }, 60);
  }

  /**
   * BVNotify.itemEarned(key)
   * key: 'eraser' | 'freeze' | 'retry' | 'xp'
   * Shows item popup with SVG and particle scatter — click or auto-dismiss 3.5s
   */
  function itemEarned(key) {
    var def = ITEM_DEFS[key];
    if (!def) {
      // Relic item — no full SVG definition, show a simple toast instead
      var relicName = key.charAt(0).toUpperCase() + key.slice(1) + ' Relic';
      toast('Acquired: ' + relicName, 'item', '🏺');
      return;
    }

    var overlay = document.createElement('div');
    overlay.id = 'bvn-item-popup';

    // Get current stock from localStorage
    var stock = 0;
    if (typeof BVUser !== 'undefined') {
      var u = BVUser.load();
      stock = (u.items && u.items[key]) || 0;
    }

    var card = document.createElement('div');
    card.className = 'bvn-ip-card';
    card.style.borderColor = def.color;
    card.style.boxShadow = '6px 6px 0 #0a0015, 0 0 30px ' + def.color + '55';
    card.innerHTML =
      '<div class="bvn-ip-eyebrow" style="color:' + def.color + '">✦ ITEM ACQUIRED ✦</div>' +
      '<div class="bvn-ip-icon">' + def.svg + '</div>' +
      '<div class="bvn-ip-name">' + def.name + '</div>' +
      '<div class="bvn-ip-desc">' + def.desc.replace(/\n/g, '<br>') + '</div>' +
      '<div class="bvn-ip-count">Stock: ×' + stock + '</div>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Small scatter around the card
    setTimeout(function () {
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top  + rect.height / 2;

      // Create mini canvas for particle burst
      var cnv = document.createElement('canvas');
      cnv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999';
      document.body.appendChild(cnv);

      var stopPfx = spawnCanvasParticles(cnv, {
        count: 60,
        colors: [def.color, '#fff', def.color, '#fee783'],
        maxSpeed: 5,
        upBias: 1.5,
        gravity: 0.08,
        cx: cx, cy: cy,
        sizes: [3,4,6]
      });
      setTimeout(function () { stopPfx(); cnv.remove(); }, 1400);
    }, 80);

    // Dismiss on click or auto
    function dismiss() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.25s';
      setTimeout(function () { overlay.remove(); }, 280);
    }
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 3500);
  }

  // ─── Export ──────────────────────────────────────────────────────────────────
  global.BVNotify = { toast: toast, levelUp: levelUp, rankUp: rankUp, itemEarned: itemEarned };

})(window);
