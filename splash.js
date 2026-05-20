document.addEventListener("DOMContentLoaded", function () {
  var splashContent = document.getElementById('splash-content');
  var startBtn      = document.getElementById('start-btn');
  var wrap          = document.querySelector('.splash-container');

  // ── Reveal content immediately (no overlay) ──
  setTimeout(function () {
    splashContent.classList.remove('hidden');
  }, 100);

  // ── Start button → VR portal transition → index.html ──
  startBtn.addEventListener('click', function () {
    startBtn.disabled = true;

    // White veil flash
    var veil = document.createElement('div');
    veil.id = 'bv-launch-veil';
    document.body.appendChild(veil);

    // Scale-zoom container (VR portal effect)
    wrap.classList.add('bv-zoom-launch');

    // Signal index.html to play entrance animation
    sessionStorage.setItem('bv_entering', '1');
    sessionStorage.setItem('bv_started',  '1');

    // Navigate after animation completes
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 900);
  });
});
