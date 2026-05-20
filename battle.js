document.addEventListener("DOMContentLoaded", () => {
  // ── Populate player card from BVUser ──
  if (typeof BVUser !== 'undefined') {
    var u = BVUser.load();
    var RANK_COLORS = {
      'Unranked':'#888', 'Bronze':'#cd7f32', 'Silver':'#a8a9ad',
      'Gold':'#ffd700', 'Platinum':'#e5e4e2', 'Diamond':'#b9f2ff', 'Legend':'#fee783'
    };
    var nameEl  = document.getElementById('player-name');
    var rankEl  = document.getElementById('player-rank');
    var levelEl = document.getElementById('player-level');
    if (nameEl)  nameEl.textContent  = u.name  || 'Explorer';
    if (rankEl)  { rankEl.textContent = u.rank || 'Unranked'; rankEl.style.color = RANK_COLORS[u.rank] || '#888'; }
    if (levelEl) levelEl.textContent = u.level || 1;

    // ── Daily Quiz gate ──
    var today      = new Date().toDateString();
    var dailyBtn   = document.getElementById('dailyBtn');
    if (dailyBtn && u.dailyCompletedDate === today) {
      dailyBtn.textContent = 'Completed Today ✓';
      dailyBtn.disabled    = true;
      dailyBtn.style.opacity = '0.5';
      dailyBtn.style.cursor  = 'not-allowed';
    }
  }

  // ── Daily Quiz ──
  document.getElementById("dailyBtn").addEventListener("click", () => {
    window.location.href = "battle-play.html?mode=daily";
  });

  // ── Raid ──
  document.querySelectorAll(".raid-card").forEach((card) => {
    card.addEventListener("click", () => {
      const difficulty = card.classList.contains("easy")
        ? "easy"
        : card.classList.contains("normal")
          ? "normal"
          : "hard";
      window.location.href = `battle-play.html?mode=raid&difficulty=${difficulty}`;
    });
  });

  // ── PvP (Coming Soon) ──
  const searchBtn = document.getElementById("searchBtn");
  searchBtn.disabled = true;
  searchBtn.textContent = "Coming Soon...";
  searchBtn.title = "PvP mode is under development";
});