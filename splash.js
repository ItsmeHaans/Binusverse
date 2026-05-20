document.addEventListener('DOMContentLoaded', function () {
  var splashContent = document.getElementById('splash-content');
  var startBtn      = document.getElementById('start-btn');
  var nameForm      = document.getElementById('name-form');
  var nameInput     = document.getElementById('name-input');
  var nameSubmit    = document.getElementById('name-submit');
  var wrap          = document.querySelector('.splash-container');

  setTimeout(function () {
    splashContent.classList.remove('hidden');
  }, 100);

  startBtn.addEventListener('click', function () {
    if (typeof BVUser === 'undefined') {
      goToIndex();
      return;
    }
    var u = BVUser.load();
    if (u.name && u.name !== 'Explorer') {
      goToIndex();
    } else {
      startBtn.style.display = 'none';
      nameForm.style.display = 'block';
      setTimeout(function () { if (nameInput) nameInput.focus(); }, 100);
    }
  });

  function submitName() {
    var val = nameInput ? nameInput.value.trim() : '';
    if (!val) { if (nameInput) nameInput.style.borderColor = '#ff6b6b'; return; }
    if (typeof BVUser !== 'undefined') {
      var u = BVUser.load();
      u.name = val;
      BVUser.save(u);
    }
    goToIndex();
  }

  if (nameSubmit) nameSubmit.addEventListener('click', submitName);
  if (nameInput) {
    nameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') submitName();
    });
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
});
