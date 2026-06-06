document.addEventListener("DOMContentLoaded", () => {
  var RANK_COLORS = {
    'Unranked':'#888', 'Bronze':'#cd7f32', 'Silver':'#a8a9ad',
    'Gold':'#ffd700', 'Platinum':'#e5e4e2', 'Diamond':'#b9f2ff', 'Legend':'#fee783'
  };

  function populatePlayerCard() {
    if (typeof BVUser === 'undefined') return;
    var u = BVUser.load();
    var nameEl  = document.getElementById('player-name');
    var rankEl  = document.getElementById('player-rank');
    var levelEl = document.getElementById('player-level');
    if (nameEl) nameEl.textContent = u.name || 'Explorer';
    if (rankEl) {
      var rc = RANK_COLORS[u.rank] || '#888';
      rankEl.textContent    = (u.rank || 'Unranked').toUpperCase();
      rankEl.style.color       = rc;
      rankEl.style.borderColor = rc;
      rankEl.style.background  = rc + '22';
      rankEl.style.boxShadow   = '0 0 10px ' + rc + '55';
    }
    if (levelEl) {
      levelEl.innerHTML = '<span class="level-num">' + (u.level || 1) + '</span>';
    }
    // ── Daily Quiz gate ──
    var today    = new Date().toDateString();
    var dailyBtn = document.getElementById('dailyBtn');
    if (dailyBtn && u.dailyCompletedDate === today) {
      dailyBtn.textContent = 'Completed Today ✓';
      dailyBtn.disabled    = true;
      dailyBtn.style.opacity = '0.5';
      dailyBtn.style.cursor  = 'not-allowed';
    }
  }

  // Sync from backend first, then populate
  if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
    BVAPI.getProfile()
      .then(function(profile) {
        if (typeof BVUser !== 'undefined') BVUser.syncFromBackend(profile);
        populatePlayerCard();
      })
      .catch(function() { populatePlayerCard(); });
  } else {
    populatePlayerCard();
  }

  // ── Daily Quiz ──
  const _dailyClickBtn = document.getElementById("dailyBtn");
  if (_dailyClickBtn) _dailyClickBtn.addEventListener("click", () => {
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

  // ── PvP (Coming Soon) — button removed from HTML, guard prevents crash ──
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Coming Soon...";
    searchBtn.title = "PvP mode is under development";
  }
});