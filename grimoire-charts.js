/* ═══════════════════════════════════════════════
   grimoire-charts.js  — v3  Dynamic Line Charts
   XP Track  & Battle Performance
   Positions follow actual weekly data.
   Pixel-star aesthetic preserved.
═══════════════════════════════════════════════ */

(function () {

  /* ── seeded RNG for background stars ── */
  function rand32(seed) {
    let a = seed;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── draw a smooth pixel line chart ── */
  function drawLineChart(canvasId, data, color, boxId, tipId, unit, seed, constBadge) {
    const box = document.getElementById(boxId);
    const cvs = document.getElementById(canvasId);
    const tip = document.getElementById(tipId);
    if (!box || !cvs) return;

    const W = box.clientWidth;
    const H = box.clientHeight;
    cvs.width  = W;
    cvs.height = H;
    const ctx = cvs.getContext('2d');

    /* padding */
    const PL = 52, PR = 32, PT = 48, PB = 40;
    const cW = W - PL - PR;
    const cH = H - PT - PB;

    /* data range */
    const maxVal = Math.max(...data, unit === ' XP' ? 100 : 10) * 1.15;
    const minVal = 0;

    /* map data point to canvas coords */
    const N = data.length;
    const pts = data.map(function(v, i) {
      return {
        x: PL + (N <= 1 ? cW / 2 : (i / (N - 1)) * cW),
        y: PT + cH - ((v - minVal) / (maxVal - minVal)) * cH,
        val: v,
        label: 'WK' + (i + 1),
      };
    });

    ctx.clearRect(0, 0, W, H);

    /* ── background pixel stars ── */
    const rng = rand32(seed);
    for (let i = 0; i < 80; i++) {
      const sx = rng() * W;
      const sy = rng() * H;
      const sz = rng() > 0.9 ? 2 : 1;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.04 + rng() * 0.16) + ')';
      ctx.fillRect(~~sx, ~~sy, sz, sz);
    }

    /* ── Y-axis grid + labels ── */
    const gridLines = 4;
    for (let g = 0; g <= gridLines; g++) {
      const gy = PT + (cH / gridLines) * g;
      const gv = Math.round(maxVal - (maxVal / gridLines) * g);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      ctx.moveTo(PL, gy);
      ctx.lineTo(W - PR, gy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(gv + (unit === '%' ? '%' : ''), PL - 6, gy + 3);
      ctx.restore();
    }

    /* ── area fill under line ── */
    if (pts.length >= 2) {
      ctx.save();
      const grad = ctx.createLinearGradient(0, PT, 0, PT + cH);
      grad.addColorStop(0, color + '28');
      grad.addColorStop(1, color + '04');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, PT + cH);
      pts.forEach(function(p) { ctx.lineTo(p.x, p.y); });
      ctx.lineTo(pts[pts.length - 1].x, PT + cH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /* ── glow shadow line (blur pass) ── */
    if (pts.length >= 2) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = 14;
      ctx.strokeStyle = color + '55';
      ctx.lineWidth   = 4;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.beginPath();
      pts.forEach(function(p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.restore();
    }

    /* ── main line ── */
    if (pts.length >= 2) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.beginPath();
      pts.forEach(function(p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.restore();
    }

    /* ── data point nodes ── */
    pts.forEach(function(p) {
      const r = 5;

      /* glow ring */
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = 18;
      ctx.fillStyle   = color;
      ctx.fillRect(~~(p.x - r / 2), ~~(p.y - r / 2), r, r);
      ctx.restore();

      /* white core */
      ctx.fillStyle = '#fff';
      ctx.fillRect(~~(p.x - 1), ~~(p.y - 1), 2, 2);

      /* pixel cross sparkle */
      ctx.fillStyle = color;
      ctx.fillRect(~~p.x, ~~(p.y - r - 3), 1, 3);
      ctx.fillRect(~~p.x, ~~(p.y + r), 1, 3);
      ctx.fillRect(~~(p.x - r - 3), ~~p.y, 3, 1);
      ctx.fillRect(~~(p.x + r), ~~p.y, 3, 1);
    });

    /* ── hover tooltip ── */
    box.onmousemove = function(e) {
      const rect = box.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let hit = null;
      pts.forEach(function(p) {
        const dx = mx - p.x, dy = my - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) hit = p;
      });
      if (hit) {
        if (tip.querySelector('.tt-week'))  tip.querySelector('.tt-week').textContent  = hit.label;
        if (tip.querySelector('.tt-val'))   tip.querySelector('.tt-val').textContent   = hit.val + (unit === ' XP' ? ' XP' : '%');
        let tx = hit.x - 48;
        let ty = hit.y - 68;
        if (ty < 8) ty = hit.y + 20;
        if (tx < 4) tx = 4;
        if (tx + 110 > W) tx = W - 114;
        tip.style.left    = tx + 'px';
        tip.style.top     = ty + 'px';
        tip.style.opacity = '1';
      } else {
        tip.style.opacity = '0';
      }
    };
    box.onmouseleave = function() { tip.style.opacity = '0'; };
  }

  /* ══ main ══ */
  function init() {
    var weekXP = window._BV_WEEKLY_XP || [0, 0, 0, 0, 0, 0];
    var weekWR = window._BV_WEEKLY_WR || [0, 0, 0, 0, 0, 0];

    drawLineChart('cvs-xp', weekXP, '#fee783', 'box-xp', 'tip-xp', ' XP', 42);
    drawLineChart('cvs-bp', weekWR, '#ff3bff', 'box-bp', 'tip-bp', '%',   99);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    requestAnimationFrame(init);

  window.addEventListener('resize', init);

})();
