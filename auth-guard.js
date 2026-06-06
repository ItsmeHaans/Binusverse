/* auth-guard.js — Redirect to splash if not logged in.
   Include AFTER api.js, BEFORE page script. */
(function () {
  if (typeof BVAPI === 'undefined' || !BVAPI.isLoggedIn()) {
    window.location.replace('splash.html');
  }
})();
