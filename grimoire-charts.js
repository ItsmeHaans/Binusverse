(function () {
  const XP_DATA = [320, 580, 210, 750, 490, 660];
  const BP_DATA = [45,  72,  38,  85,  61,  78];
  const WEEKS   = ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6'];

  /* seeded RNG */
  function rand32(seed) {
    let a = seed;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function drawBgStars(ctx, W, H, seed) {
    const rng = rand32(seed);
    for (let i = 0; i < 70; i++) {
      const sx = rng() * W, sy = rng() * H;
      const sz = rng() > 0.88 ? 2 : 1;
      ctx.fillStyle = `rgba(255,255,255,${0.07 + rng() * 0.28})`;
      ctx.fillRect(~~sx, ~~sy, sz, sz);
    }
  }

  function drawStar(ctx, x, y, color, big) {
    const r = big ? 4 : 3;
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = big ? 20 : 12;
    ctx.fillStyle = color;
    ctx.fillRect(~~(x - r), ~~(y - r), r * 2, r * 2);
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(~~(x - 1), ~~(y - 1), 2, 2);
    ctx.fillStyle = color;
    ctx.fillRect(~~x,       ~~(y - r - 2), 1, 2);
    ctx.fillRect(~~x,       ~~(y + r),     1, 2);
    ctx.fillRect(~~(x-r-2), ~~y,           2, 1);
    ctx.fillRect(~~(x+r),   ~~y,           2, 1);
  }

  /* ── ORION shape (kiri-tengah canvas sebagai overlay dekoratif) ─ */
  /* titik: bahu kiri, bahu kanan, sabuk kiri/tengah/kanan, kaki kiri, kaki kanan, ujung pedang */
  const ORION_LINES = [
    [[.08,.22],[.25,.18]],  // bahu kiri → kanan
    [[.08,.22],[.16,.52]],  // bahu kiri → pinggang kiri
    [[.25,.18],[.30,.52]],  // bahu kanan → pinggang kanan
    [[.16,.52],[.23,.50]],  // belt kiri → tengah
    [[.23,.50],[.30,.52]],  // belt tengah → kanan
    [[.16,.52],[.10,.80]],  // pinggang kiri → kaki kiri
    [[.30,.52],[.35,.78]],  // pinggang kanan → kaki kanan
    [[.23,.50],[.24,.70]],  // belt tengah → ujung pedang
  ];
  const ORION_STARS = [
    [.08,.22],[.25,.18],
    [.16,.52],[.23,.50],[.30,.52],
    [.10,.80],[.35,.78],[.24,.70],
  ];

  /* ── SCORPIUS shape (kanan-tengah canvas, ekor melengkung) ── */
  const SCORPIUS_LINES = [
    [[.55,.14],[.62,.11]],  // kepala kiri → kanan
    [[.62,.11],[.70,.14]],  // kepala kanan
    [[.62,.11],[.63,.26]],  // kepala → leher
    [[.63,.26],[.65,.40]],  // leher → dada
    [[.65,.40],[.63,.54]],  // dada → perut
    [[.63,.54],[.58,.66]],  // perut → ekor atas
    [[.58,.66],[.52,.74]],  // ekor → tekukan
    [[.52,.74],[.47,.70]],  // tekukan balik
    [[.47,.70],[.44,.60]],  // sengat atas
    [[.44,.60],[.42,.52]],  // sengat bawah (ujung)
  ];
  const SCORPIUS_STARS = [
    [.55,.14],[.62,.11],[.70,.14],
    [.63,.26],[.65,.40],[.63,.54],
    [.58,.66],[.52,.74],[.47,.70],
    [.44,.60],[.42,.52],
  ];

  function drawOverlay(ctx, W, H, lines, stars, color) {
    ctx.save();
    ctx.strokeStyle = color + '28';
    ctx.lineWidth   = 1;
    ctx.setLineDash([2, 5]);
    lines.forEach(([f, t]) => {
      ctx.beginPath();
      ctx.moveTo(f[0]*W, f[1]*H);
      ctx.lineTo(t[0]*W, t[1]*H);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();
    stars.forEach(([rx, ry]) => {
      ctx.save();
      ctx.shadowColor = color; ctx.shadowBlur = 6;
      ctx.fillStyle = color + '50';
      ctx.fillRect(~~(rx*W-1), ~~(ry*H-1), 2, 2);
      ctx.restore();
    });
  }

  function drawChart(canvasId, data, color, boxId, tipId, unit, lines, stars, seed) {
    const box = document.getElementById(boxId);
    const cvs = document.getElementById(canvasId);
    const tip = document.getElementById(tipId);
    if (!box || !cvs) return;

    const W = box.clientWidth, H = box.clientHeight;
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    const PL=44, PR=44, PT=50, PB=44;
    const cW = W-PL-PR, cH = H-PT-PB;
    const mn = Math.min(...data), mx = Math.max(...data);
    const pts = data.map((v, i) => ({
      x: PL + i * (cW / (data.length - 1)),
      y: PT + cH - ((v - mn) / (mx - mn || 1)) * cH,
      v, i
    }));

    ctx.clearRect(0, 0, W, H);
    drawBgStars(ctx, W, H, seed);
    drawOverlay(ctx, W, H, lines, stars, color);

    /* grid */
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
    for (let g = 0; g <= 3; g++) {
      const gy = PT + (cH / 3) * g;
      ctx.beginPath(); ctx.moveTo(PL, gy); ctx.lineTo(W-PR, gy); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.restore();

    /* glow dashed */
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.strokeStyle = color + '40'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    /* main line */
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 6;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke(); ctx.restore();

    /* area fill */
    ctx.save();
    const grad = ctx.createLinearGradient(0, PT, 0, PT+cH);
    grad.addColorStop(0, color + '20'); grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, PT+cH);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, PT+cH);
    ctx.closePath(); ctx.fill(); ctx.restore();

    /* data stars — besar kalau nilai tinggi */
    const range = mx - mn || 1;
    pts.forEach(p => drawStar(ctx, p.x, p.y, color, (p.v - mn)/range > 0.6));

    /* hover */
    box.onmousemove = function (e) {
      const r = box.getBoundingClientRect();
      const mx2 = e.clientX - r.left, my2 = e.clientY - r.top;
      let hit = null;
      pts.forEach(p => { if (Math.abs(mx2-p.x) < 22 && Math.abs(my2-p.y) < 22) hit = p; });
      if (hit) {
        tip.querySelector('.tt-week').textContent = WEEKS[hit.i];
        tip.querySelector('.tt-val').textContent  = hit.v + unit;
        let tx = hit.x - 44, ty = hit.y - 68;
        if (ty < 8)      ty = hit.y + 18;
        if (tx < 4)      tx = 4;
        if (tx+96 > W)   tx = W - 100;
        tip.style.left = tx + 'px'; tip.style.top = ty + 'px'; tip.style.opacity = '1';
      } else tip.style.opacity = '0';
    };
    box.onmouseleave = () => tip.style.opacity = '0';
  }

  function init() {
    drawChart('cvs-xp', XP_DATA, '#fee783', 'box-xp', 'tip-xp', ' XP',
      ORION_LINES,    ORION_STARS,    42);
    drawChart('cvs-bp', BP_DATA, '#ff3bff', 'box-bp', 'tip-bp', '%',
      SCORPIUS_LINES, SCORPIUS_STARS, 99);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    requestAnimationFrame(init);

  window.addEventListener('resize', init);
})();
