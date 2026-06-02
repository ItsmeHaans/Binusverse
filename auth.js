/* auth.js — login / register entry point. Needs api.js (BV) loaded first. */
(function () {
  'use strict';

  // Already logged in? skip straight to the realm.
  if (window.BV && BV.isLoggedIn()) {
    location.href = 'index.html';
    return;
  }

  var sub      = document.getElementById('auth-sub');
  var tabs     = document.querySelectorAll('.auth-tab');
  var loginF   = document.getElementById('login-form');
  var regF     = document.getElementById('register-form');
  var msg      = document.getElementById('auth-msg');

  function showMsg(text, kind) {
    msg.textContent = text;
    msg.className = 'auth-msg ' + (kind || 'err');
  }
  function hideMsg() { msg.className = 'auth-msg hidden'; }

  // ─── tabs ───
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      hideMsg();
      var isLogin = t.dataset.tab === 'login';
      loginF.classList.toggle('hidden', !isLogin);
      regF.classList.toggle('hidden', isLogin);
      sub.textContent = isLogin ? '⟢ SIGN IN TO CONTINUE ⟣' : '⟢ FORGE A NEW HERO ⟣';
    });
  });

  // After auth: seed the local BVUser name, push it to the server, then enter.
  function enterRealm(user) {
    sessionStorage.setItem('bv_entering', '1');
    var go = function () { location.href = 'index.html'; };

    if (typeof BVUser === 'undefined') return go();

    // Pull whatever the server already has, then ensure name is set.
    var after = function () {
      var u = BVUser.load();
      if (user && user.name) u.name = user.name;
      BVUser.save(u);
      if (BVUser.persist) { BVUser.persist().finally(go); } else { go(); }
    };

    if (BVUser.syncFromServer) {
      BVUser.syncFromServer().then(after).catch(after);
    } else {
      after();
    }
  }

  // ─── login ───
  loginF.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMsg();
    var btn = document.getElementById('login-btn');
    btn.disabled = true;
    BV.auth.login(
      document.getElementById('login-email').value.trim(),
      document.getElementById('login-password').value
    ).then(function (data) {
      showMsg('Welcome back, ' + (data.user ? data.user.name : 'Explorer') + '!', 'ok');
      enterRealm(data.user);
    }).catch(function (err) {
      btn.disabled = false;
      showMsg(err.message || 'Login failed', 'err');
    });
  });

  // ─── register ───
  regF.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMsg();
    var btn = document.getElementById('register-btn');
    var payload = {
      name:     document.getElementById('reg-name').value.trim(),
      email:    document.getElementById('reg-email').value.trim(),
      password: document.getElementById('reg-password').value,
    };
    var fac = document.getElementById('reg-faculty').value.trim();
    var bat = document.getElementById('reg-batch').value.trim();
    if (fac) payload.faculty = fac;
    if (bat) payload.batch = bat;

    if (payload.password.length < 8) { showMsg('Password needs at least 8 characters.', 'err'); return; }
    if (!/@binus\.ac\.id$/i.test(payload.email)) {
      showMsg('Use your BINUS email (@binus.ac.id).', 'err'); return;
    }

    btn.disabled = true;
    BV.auth.register(payload).then(function (data) {
      showMsg('Hero created! Entering…', 'ok');
      enterRealm(data.user);
    }).catch(function (err) {
      btn.disabled = false;
      showMsg(err.message || 'Registration failed', 'err');
    });
  });

  // ─── tiny pixel starfield background ───
  var cnv = document.getElementById('auth-bg');
  if (cnv) {
    var ctx = cnv.getContext('2d');
    var W, H, stars;
    function resize() {
      W = cnv.width = window.innerWidth;
      H = cnv.height = window.innerHeight;
      stars = [];
      for (var i = 0; i < 90; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          s: [1, 2, 2, 3][0 | Math.random() * 4],
          v: 0.15 + Math.random() * 0.5,
          c: ['#00e5ff', '#c084fc', '#fee783', '#ffffff'][0 | Math.random() * 4],
        });
      }
    }
    function tick() {
      ctx.fillStyle = '#06040f';
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        st.y += st.v;
        if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
        ctx.fillStyle = st.c;
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
        ctx.fillRect(0 | st.x, 0 | st.y, st.s, st.s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize);
    resize(); tick();
  }
})();
