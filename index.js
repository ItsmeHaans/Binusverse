document.addEventListener("DOMContentLoaded", () => {

  // =============================================
  // SPLASH — reveal content after overlay dissolve
  // =============================================
  const splashContent = document.getElementById("splash-content");
  setTimeout(() => {
    splashContent.classList.remove("hidden");
  }, 500);

  // =============================================
  // SPLASH — Start button scrolls to home
  // =============================================
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", () => {
    const splashH = document.getElementById("splash")
                        .offsetHeight;
window.scrollTo({ top: splashH, behavior: "smooth" });
  });

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
  // ARMORY TOOLTIP — global fixed tooltip
  // Tidak kena clip-path karena position:fixed
  // =============================================
  const RARITY_COLORS = {
    'r-legendary': '#ff9500',
    'r-epic':      '#c084fc',
    'r-rare':      '#00e5ff',
    'r-uncommon':  '#00ff88',
    'r-common':    '#94a3b8'
  };

  const armoryTip = document.getElementById('armory-global-tooltip');

  if (armoryTip) {
    document.querySelectorAll('.armory-box').forEach(box => {

      box.addEventListener('mouseenter', function (e) {
        const r = this.dataset.tipRarity || 'r-common';
        const c = RARITY_COLORS[r] || '#94a3b8';

        armoryTip.innerHTML = `
          <div class="tip-name">${this.dataset.tipName || ''}</div>
          <div class="tip-type">${this.dataset.tipType || ''}</div>
          <div class="tip-divider"></div>
          <div class="tip-stat">
            <span class="tip-stat-name">${this.dataset.tipS1}</span>
            <span class="tip-stat-val" style="color:${c}">${this.dataset.tipV1}</span>
          </div>
          <div class="tip-stat">
            <span class="tip-stat-name">${this.dataset.tipS2}</span>
            <span class="tip-stat-val" style="color:${c}">${this.dataset.tipV2}</span>
          </div>
          <div class="tip-stat">
            <span class="tip-stat-name">${this.dataset.tipS3}</span>
            <span class="tip-stat-val" style="color:${c}">${this.dataset.tipV3}</span>
          </div>
          <div class="tip-ability">
            <b>✦ QUIZ ABILITY</b>${this.dataset.tipAbility}
          </div>
          <div class="tip-arrow" style="border-top-color:${c}"></div>
        `;

        armoryTip.style.outline = `2px solid ${c}`;
        armoryTip.style.display = 'block';
        positionArmoryTip(e);
      });

      box.addEventListener('mousemove', positionArmoryTip);

      box.addEventListener('mouseleave', () => {
        armoryTip.style.display = 'none';
      });
    });
  }

  function positionArmoryTip(e) {
    if (!armoryTip) return;
    const tw = armoryTip.offsetWidth;
    const th = armoryTip.offsetHeight;
    let x = e.clientX - tw / 2;
    let y = e.clientY - th - 20;
    if (x < 8) x = 8;
    if (x + tw > window.innerWidth - 8) x = window.innerWidth - tw - 8;
    if (y < 8) y = e.clientY + 20;
    armoryTip.style.left = x + 'px';
    armoryTip.style.top  = y + 'px';
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

});