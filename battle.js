document.addEventListener("DOMContentLoaded", () => {
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