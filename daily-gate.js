/* daily-gate.js
   Intercepts any link to battle-play.html?mode=daily.
   If daily already completed today, shows a blocking popup instead of navigating.
   Requires user-data.js (BVUser) to be loaded first.
*/
(function () {
  function isCompletedToday() {
    if (typeof BVUser === 'undefined') return false;
    var u = BVUser.load();
    return u.dailyCompletedDate === new Date().toDateString();
  }

  function showDonePopup() {
    var existing = document.getElementById('dg-overlay');
    if (existing) { existing.classList.add('dg-visible'); return; }

    var overlay = document.createElement('div');
    overlay.id = 'dg-overlay';
    overlay.className = 'dg-overlay';
    overlay.innerHTML =
      '<div class="dg-modal">' +
        '<div class="dg-corner tl"></div><div class="dg-corner tr"></div>' +
        '<div class="dg-corner bl"></div><div class="dg-corner br"></div>' +
        '<div class="dg-icon">✓</div>' +
        '<h2 class="dg-title">ALREADY DONE</h2>' +
        '<p class="dg-sub">You have already completed today\'s Daily Mission.<br>Come back tomorrow, adventurer!</p>' +
        '<button class="dg-btn" id="dg-close">[ OK ]</button>' +
      '</div>';

    /* inline styles — no external CSS needed */
    var style = document.createElement('style');
    style.textContent =
      '.dg-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:9999;align-items:center;justify-content:center;}' +
      '.dg-overlay.dg-visible{display:flex;animation:dgFadeIn .15s ease-out;}' +
      '@keyframes dgFadeIn{from{opacity:0}to{opacity:1}}' +
      '.dg-modal{position:relative;background:#0d0f2a;border:3px solid #00ff88;padding:40px 48px;text-align:center;min-width:280px;max-width:380px;animation:dgPop .2s cubic-bezier(.22,1,.36,1);}' +
      '@keyframes dgPop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}' +
      '.dg-corner{position:absolute;width:8px;height:8px;background:#00ff88;}' +
      '.dg-corner.tl{top:-3px;left:-3px}.dg-corner.tr{top:-3px;right:-3px}.dg-corner.bl{bottom:-3px;left:-3px}.dg-corner.br{bottom:-3px;right:-3px}' +
      '.dg-icon{font-size:2rem;color:#00ff88;margin-bottom:10px;text-shadow:0 0 16px rgba(0,255,136,.7);}' +
      '.dg-title{font-family:"Press Start 2P",monospace;font-size:1rem;color:#00ff88;margin-bottom:12px;text-shadow:2px 2px 0 #003322;}' +
      '.dg-sub{font-family:"Pixelify Sans",sans-serif;font-size:.88rem;color:rgba(200,240,220,.7);line-height:1.7;margin-bottom:24px;}' +
      '.dg-btn{font-family:"Press Start 2P",monospace;font-size:0.78rem;background:#00ff88;color:#0d0f2a;border:none;padding:10px 28px;cursor:pointer;box-shadow:4px 4px 0 #00994d;}' +
      '.dg-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #00994d;}' +
      '.dg-btn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #00994d;}';

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    overlay.classList.add('dg-visible');

    function close() { overlay.classList.remove('dg-visible'); }
    document.getElementById('dg-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function hookLinks() {
    document.querySelectorAll('a[href*="battle-play.html?mode=daily"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (isCompletedToday()) {
          e.preventDefault();
          showDonePopup();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookLinks);
  } else {
    hookLinks();
  }
})();
