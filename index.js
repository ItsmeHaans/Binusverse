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
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  });

  // =============================================
  // HOME — Hamburger menu toggle
  // =============================================
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
});