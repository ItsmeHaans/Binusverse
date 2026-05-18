/* ═══════════════════════════════════════════════
   grimoire-charts.js  — v2
   Garis utama MEMBENTUK pola rasi bintang beneran.
   ORION  → XP Track      (kuning emas)
   SCORPIUS → Battle Perf  (magenta)

   Koordinat rx/ry: 0–1 dalam canvas area.
   ry=0 = atas, ry=1 = bawah.
   Range Y dibuat dramatis (0.08 – 0.88)
   biar bentuk rasi bintang jelas terlihat.
═══════════════════════════════════════════════ */

(function () {

  /* ── seeded RNG ── */
  function rand32(seed) {
    let a = seed;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ══════════════════════════════════════════
     ORION — 9 bintang utama
     Pola: kaki kiri-kanan (bawah), sabuk 3 bintang
     (tengah), bahu kiri-kanan (atas-kiri), kepala
     (atas-kanan), mahkota.
     Dibaca kiri→kanan secara XP timeline.
  ══════════════════════════════════════════ */
  const ORION_PTS = [
    //          rx     ry      nama            xp   sz
    { rx: 0.05, ry: 0.82, name: "Saiph",      val: 180, sz: 5 },  // kaki kiri — bawah kiri
    { rx: 0.18, ry: 0.55, name: "Rigel",      val: 340, sz: 7 },  // kaki kanan — naik
    { rx: 0.30, ry: 0.35, name: "Belt-W",     val: 480, sz: 5 },  // sabuk kiri
    { rx: 0.47, ry: 0.40, name: "Alnilam",    val: 520, sz: 6 },  // sabuk tengah
    { rx: 0.62, ry: 0.32, name: "Belt-E",     val: 490, sz: 5 },  // sabuk kanan
    { rx: 0.70, ry: 0.12, name: "Bellatrix",  val: 620, sz: 6 },  // bahu kiri — paling atas
    { rx: 0.80, ry: 0.08, name: "Betelgeuse", val: 750, sz: 9 },  // bahu kanan — paling atas, paling terang
    { rx: 0.88, ry: 0.22, name: "Head",       val: 680, sz: 5 },  // kepala — turun sedikit
    { rx: 0.96, ry: 0.45, name: "Meissa",     val: 590, sz: 5 },  // mahkota — turun lagi
  ];

  /* edge = garis penghubung antar bintang */
  const ORION_EDGES = [
    [0, 1],  // Saiph → Rigel          (kaki)
    [1, 2],  // Rigel → Belt-W         (naik ke sabuk)
    [2, 3],  // Belt-W → Alnilam       (sabuk)
    [3, 4],  // Alnilam → Belt-E       (sabuk)
    [4, 5],  // Belt-E → Bellatrix     (naik ke bahu)
    [5, 6],  // Bellatrix → Betelgeuse (bahu kiri-kanan)
    [3, 6],  // Alnilam → Betelgeuse   (diagonal badan)
    [2, 1],  // Belt-W → Rigel         (diagonal badan kiri) — double edge OK
    [6, 7],  // Betelgeuse → Head
    [7, 8],  // Head → Meissa
  ];

  /* ══════════════════════════════════════════
     SCORPIUS — 11 bintang
     Kepala (kiri), dada Antares (terang, atas),
     badan turun ke kanan, ekor melengkung
     dari kanan-bawah ke atas (sengat kanan).
  ══════════════════════════════════════════ */
  const SCORPIUS_PTS = [
    //          rx     ry      nama           pct  sz
    { rx: 0.04, ry: 0.55, name: "Graffias",  val: 42, sz: 5 },  // kepala kiri
    { rx: 0.11, ry: 0.42, name: "Dschubba",  val: 55, sz: 7 },  // dahi — naik
    { rx: 0.18, ry: 0.55, name: "Pi-Sco",    val: 48, sz: 5 },  // kepala kanan
    { rx: 0.28, ry: 0.20, name: "Antares",   val: 72, sz: 9 },  // dada — paling atas, paling terang
    { rx: 0.38, ry: 0.45, name: "Tau-Sco",   val: 65, sz: 5 },  // badan atas — turun
    { rx: 0.47, ry: 0.62, name: "Epsilon",   val: 58, sz: 5 },  // badan tengah
    { rx: 0.57, ry: 0.78, name: "Mu-1",      val: 70, sz: 6 },  // badan bawah — paling bawah
    { rx: 0.66, ry: 0.70, name: "Zeta",      val: 78, sz: 6 },  // ekor mulai naik
    { rx: 0.75, ry: 0.52, name: "Eta",       val: 74, sz: 5 },  // ekor naik
    { rx: 0.84, ry: 0.35, name: "Theta",     val: 82, sz: 6 },  // ekor lebih naik
    { rx: 0.94, ry: 0.18, name: "Shaula",    val: 88, sz: 8 },  // sengat — paling atas kanan, terang
  ];

  const SCORPIUS_EDGES = [
    [0, 1],   // Graffias → Dschubba
    [1, 2],   // Dschubba → Pi-Sco  (kepala)
    [1, 3],   // Dschubba → Antares (leher ke dada)
    [0, 3],   // Graffias → Antares (diagonal kepala)
    [3, 4],   // Antares → Tau-Sco
    [4, 5],   // Tau-Sco → Epsilon
    [5, 6],   // Epsilon → Mu-1     (ke bawah)
    [6, 7],   // Mu-1 → Zeta        (ekor mulai naik)
    [7, 8],   // Zeta → Eta
    [8, 9],   // Eta → Theta
    [9, 10],  // Theta → Shaula     (sengat)
  ];

  /* ══════════════════════════════════════════
     DRAW FUNCTION
  ══════════════════════════════════════════ */
  function drawChart(canvasId, pts, edges, color, boxId, tipId, unit, seed) {
    const box = document.getElementById(boxId);
    const cvs = document.getElementById(canvasId);
    const tip = document.getElementById(tipId);
    if (!box || !cvs) return;

    const W = box.clientWidth;
    const H = box.clientHeight;
    cvs.width  = W;
    cvs.height = H;
    const ctx  = cvs.getContext('2d');

    /* padding dalam canvas */
    const PL = 52, PR = 52, PT = 54, PB = 46;
    const cW = W - PL - PR;
    const cH = H - PT - PB;

    /* rx/ry → pixel */
    const px = rx => PL + rx * cW;
    const py = ry => PT + ry * cH;

    ctx.clearRect(0, 0, W, H);

    /* ── background pixel stars ── */
    const rng = rand32(seed);
    for (let i = 0; i < 90; i++) {
      const sx = rng() * W;
      const sy = rng() * H;
      const sz = rng() > 0.88 ? 2 : 1;
      ctx.fillStyle = `rgba(255,255,255,${0.05 + rng() * 0.2})`;
      ctx.fillRect(~~sx, ~~sy, sz, sz);
    }

    /* ── faint grid ── */
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([2, 7]);
    for (let g = 0; g <= 3; g++) {
      const gy = PT + (cH / 3) * g;
      ctx.beginPath(); ctx.moveTo(PL, gy); ctx.lineTo(W - PR, gy); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    /* ── glow dashed lines (shadow pass) ── */
    edges.forEach(([a, b]) => {
      ctx.save();
      ctx.shadowColor  = color;
      ctx.shadowBlur   = 12;
      ctx.strokeStyle  = color + '40';
      ctx.lineWidth    = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(px(pts[a].rx), py(pts[a].ry));
      ctx.lineTo(px(pts[b].rx), py(pts[b].ry));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    /* ── main constellation lines ── */
    edges.forEach(([a, b]) => {
      ctx.save();
      ctx.shadowColor  = color;
      ctx.shadowBlur   = 7;
      ctx.strokeStyle  = color;
      ctx.lineWidth    = 2;
      ctx.beginPath();
      ctx.moveTo(px(pts[a].rx), py(pts[a].ry));
      ctx.lineTo(px(pts[b].rx), py(pts[b].ry));
      ctx.stroke();
      ctx.restore();
    });

    /* ── subtle area fill under the "main path" (sorted L→R) ── */
    const sorted = [...pts].sort((a, b) => a.rx - b.rx);
    ctx.save();
    const grad = ctx.createLinearGradient(0, PT, 0, PT + cH);
    grad.addColorStop(0, color + '15');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px(sorted[0].rx), PT + cH);
    sorted.forEach(p => ctx.lineTo(px(p.rx), py(p.ry)));
    ctx.lineTo(px(sorted[sorted.length - 1].rx), PT + cH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    /* ── bintang (star nodes) ── */
    pts.forEach(p => {
      const x = px(p.rx), y = py(p.ry);
      const r = p.sz;

      /* outer pixel block + glow */
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = 16 + r * 3;
      ctx.fillStyle   = color;
      ctx.fillRect(~~(x - r / 2), ~~(y - r / 2), r, r);
      ctx.restore();

      /* hot white core */
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(~~(x - 1), ~~(y - 1), 2, 2);

      /* pixel cross sparkle — panjang proporsional ke brightness */
      const sl = Math.ceil(r * 1.1);
      ctx.fillStyle = color;
      ctx.fillRect(~~x,           ~~(y - r - sl), 1, sl);
      ctx.fillRect(~~x,           ~~(y + r),      1, sl);
      ctx.fillRect(~~(x - r - sl), ~~y,           sl, 1);
      ctx.fillRect(~~(x + r),     ~~y,            sl, 1);

      /* diagonal sparkle untuk bintang besar (sz >= 7) */
      if (r >= 7) {
        const ds = Math.ceil(r * 0.6);
        ctx.fillStyle = color + 'aa';
        ctx.fillRect(~~(x - r - ds + 1), ~~(y - r - ds + 1), ds, ds);  // kiri atas — 1 pixel blok
        ctx.fillRect(~~(x + r - 1),      ~~(y - r - ds + 1), ds, ds);  // kanan atas
        ctx.fillRect(~~(x - r - ds + 1), ~~(y + r - 1),      ds, ds);  // kiri bawah
        ctx.fillRect(~~(x + r - 1),      ~~(y + r - 1),      ds, ds);  // kanan bawah
      }
    });

    /* ── bintang nama labels (kecil, muncul hover) ── */
    box.onmousemove = function (e) {
      const rect = box.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const my   = e.clientY - rect.top;
      let hit = null;
      pts.forEach(p => {
        const dx = mx - px(p.rx), dy = my - py(p.ry);
        if (Math.sqrt(dx * dx + dy * dy) < 24) hit = p;
      });
      if (hit) {
        const tWeek = tip.querySelector('.tt-week');
        const tVal  = tip.querySelector('.tt-val');
        if (tWeek) tWeek.textContent = hit.name;
        if (tVal)  tVal.textContent  = unit === ' XP' ? hit.val + ' XP' : hit.val + '%';

        let tx = px(hit.rx) - 48;
        let ty = py(hit.ry) - 70;
        if (ty < 8) ty = py(hit.ry) + 20;
        if (tx < 4) tx = 4;
        if (tx + 100 > W) tx = W - 104;
        tip.style.left    = tx + 'px';
        tip.style.top     = ty + 'px';
        tip.style.opacity = '1';
      } else {
        tip.style.opacity = '0';
      }
    };
    box.onmouseleave = () => { tip.style.opacity = '0'; };
  }

  /* ══ main ══ */
  function init() {
    drawChart('cvs-xp', ORION_PTS,    ORION_EDGES,    '#fee783', 'box-xp', 'tip-xp', ' XP', 42);
    drawChart('cvs-bp', SCORPIUS_PTS, SCORPIUS_EDGES, '#ff3bff', 'box-bp', 'tip-bp', '%',   99);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    requestAnimationFrame(init);

  window.addEventListener('resize', init);

})();