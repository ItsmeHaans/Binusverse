document.addEventListener('DOMContentLoaded', function () {
  var splashContent = document.getElementById('splash-content');
  var startBtn      = document.getElementById('start-btn');
  var authPanel     = document.getElementById('auth-panel');
  var authError     = document.getElementById('auth-error');
  var wrap          = document.querySelector('.splash-container');

  // Tabs
  var tabLogin    = document.getElementById('tab-login');
  var tabRegister = document.getElementById('tab-register');
  var formLogin   = document.getElementById('form-login');
  var formRegister = document.getElementById('form-register');

  // If already logged in, skip to index
  if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
    goToIndex();
    return;
  }

  setTimeout(function () {
    splashContent.classList.remove('hidden');
  }, 100);

  startBtn.addEventListener('click', function () {
    startBtn.style.display = 'none';
    authPanel.style.display = 'block';
    setTimeout(function () {
      var el = document.getElementById('login-email');
      if (el) el.focus();
    }, 100);
  });

  // Tab switching
  tabLogin.addEventListener('click', function () {
    tabLogin.classList.add('active-tab');
    tabRegister.classList.remove('active-tab');
    formLogin.style.display = '';
    formRegister.style.display = 'none';
    hideError();
  });

  tabRegister.addEventListener('click', function () {
    tabRegister.classList.add('active-tab');
    tabLogin.classList.remove('active-tab');
    formRegister.style.display = '';
    formLogin.style.display = 'none';
    hideError();
  });

  // ── Login ──
  document.getElementById('login-submit').addEventListener('click', doLogin);
  document.getElementById('login-pass').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') doLogin();
  });

  function doLogin() {
    var email = document.getElementById('login-email').value.trim();
    var pass  = document.getElementById('login-pass').value;
    if (!email || !pass) { showError('Please fill all fields.'); return; }

    setLoading('login-submit', true);
    BVAPI.login(email, pass)
      .then(function (data) {
        syncAndGo(data.user);
      })
      .catch(function (err) {
        showError(err.message || 'Login failed.');
        setLoading('login-submit', false);
      });
  }

  // ── Register ──
  document.getElementById('reg-submit').addEventListener('click', doRegister);
  document.getElementById('reg-pass').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') doRegister();
  });

  function doRegister() {
    var name  = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var pass  = document.getElementById('reg-pass').value;
    if (!name || !email || !pass) { showError('Please fill all fields.'); return; }
    if (pass.length < 8) { showError('Password min 8 characters.'); return; }

    setLoading('reg-submit', true);
    BVAPI.register(name, email, pass)
      .then(function (data) {
        syncAndGo(data.user);
      })
      .catch(function (err) {
        showError(err.message || 'Registration failed.');
        setLoading('reg-submit', false);
      });
  }

  function syncAndGo(user) {
    // Initialize/reset localStorage state for this account.
    // bv_user_v1 is a single global key, so wipe it whenever the logged-in
    // account differs from the one that last owned local data — otherwise the
    // new account inherits the previous user's battles/rank/skills/items.
    if (typeof BVUser !== 'undefined') {
      var prevOwner = null;
      try { prevOwner = localStorage.getItem('bv_user_owner'); } catch (e) {}
      if (prevOwner !== user.id) {
        BVUser.reset();
      }
      try { localStorage.setItem('bv_user_owner', user.id); } catch (e) {}
      var u = BVUser.load();
      u.name = user.name || u.name;
      BVUser.save(u);
    }
    // Hydrate real stats (xp/level/rank/streak) from the backend before entering.
    if (typeof BVAPI !== 'undefined') {
      BVAPI.getProfile()
        .then(function (profile) {
          if (typeof BVUser !== 'undefined') BVUser.syncFromBackend(profile);
        })
        .catch(function () {})
        .then(goToIndex);
    } else {
      goToIndex();
    }
  }

  function goToIndex() {
    var veil = document.createElement('div');
    veil.id = 'bv-launch-veil';
    document.body.appendChild(veil);
    if (wrap) wrap.classList.add('bv-zoom-launch');
    sessionStorage.setItem('bv_entering', '1');
    sessionStorage.setItem('bv_started', '1');
    setTimeout(function () { window.location.href = 'index.html'; }, 900);
  }

  function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }
  function hideError() {
    authError.style.display = 'none';
  }
  function setLoading(btnId, loading) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'LOADING...' : (btnId === 'login-submit' ? 'LOGIN ▶' : 'REGISTER ▶');
  }
});
