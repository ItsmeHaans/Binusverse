/* logout.js — wires the navbar Logout link on every page.
   Requires api.js (BVAPI) to be loaded first. */
(function () {
  // Inject a small consistent style for the logout link on every page.
  var st = document.createElement('style');
  st.textContent =
    '.nav-logout{color:#ff6b6b !important;}' +
    '.nav-logout:hover{background:rgba(255,107,107,.15) !important;color:#ff8a8a !important;}';
  document.head.appendChild(st);

  function wire() {
    var link = document.getElementById('logout-link');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      function go() {
        // Wipe local per-account state so the next account on this browser
        // does not inherit this user's battles/rank/skills/items.
        if (typeof BVUser !== 'undefined') BVUser.reset();
        try { localStorage.removeItem('bv_user_owner'); } catch (err) {}
        window.location.replace('splash.html');
      }
      if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
        BVAPI.logout().then(go).catch(go);
      } else {
        go();
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
