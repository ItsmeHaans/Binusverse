/* logout.js — wires the navbar (hamburger + Logout link) on every page.
   Requires api.js (BVAPI) to be loaded first. */
(function () {
  // Inject a small consistent style for the logout link on every page.
  var st = document.createElement('style');
  st.textContent =
    '.nav-logout{color:#ff6b6b !important;}' +
    '.nav-logout:hover{background:rgba(255,107,107,.15) !important;color:#ff8a8a !important;}';
  document.head.appendChild(st);

  // Hamburger toggle via event delegation on document.
  // One listener per page load (each navigation = fresh document). Uses
  // delegation so it works no matter when the navbar markup appears.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    // Click on hamburger (or one of its inner .bar spans) → toggle menu.
    if (t.closest('#hamburger')) {
      var nav = document.getElementById('navLinks');
      if (nav) nav.classList.toggle('active');
      return;
    }
    // Click a nav link → close the open menu.
    if (t.closest('#navLinks a')) {
      var nav2 = document.getElementById('navLinks');
      if (nav2) nav2.classList.remove('active');
    }
  });

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
