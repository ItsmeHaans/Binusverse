/* ============================================================
   music.js — Background music for Binusverse.

   USAGE: set the track BEFORE loading this file, e.g.
     <script>window.BV_MUSIC_TRACK = 'lobby';</script>
     <script src="music.js"></script>
   Accepted tracks: 'lobby' (default) | 'battle'

   >>> REPLACE THE PLACEHOLDER FILE PATHS BELOW with your own
       music files (put them in an assets/audio/ folder). <<<
   ============================================================ */
(function () {
  'use strict';

  /* ===== PLACEHOLDER MUSIC FILE PATHS — change these ===== */
  var TRACKS = {
    lobby:  'assets/audio/lobby-music.mp3',   // TODO: lobby / menu background music
    battle: 'assets/audio/battle-music.mp3',  // TODO: in-battle background music
  };
  /* ======================================================= */

  var VOLUME   = 0.35;
  var MUTE_KEY = 'bv_music_muted';

  var trackName = window.BV_MUSIC_TRACK || 'lobby';
  var src = TRACKS[trackName] || TRACKS.lobby;

  var audio = new Audio(src);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = 'auto';

  var muted = localStorage.getItem(MUTE_KEY) === '1';

  function tryPlay() {
    if (muted) return;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked until a gesture */ });
  }

  /* Browsers block autoplay until the user interacts — kick it off then. */
  function onFirstInteract() {
    if (!muted) tryPlay();
    window.removeEventListener('pointerdown', onFirstInteract);
    window.removeEventListener('keydown', onFirstInteract);
  }
  window.addEventListener('pointerdown', onFirstInteract);
  window.addEventListener('keydown', onFirstInteract);

  function buildToggle() {
    if (document.getElementById('bv-music-toggle')) return;

    var st = document.createElement('style');
    st.textContent =
      '#bv-music-toggle{position:fixed;left:18px;bottom:18px;z-index:9000;' +
      'width:48px;height:48px;border:2px solid #00e5ff;background:#0d0f20;' +
      "color:#00e5ff;font-size:1.3rem;cursor:pointer;border-radius:8px;" +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 0 12px rgba(0,229,255,.35);transition:transform .15s,box-shadow .15s;}' +
      '#bv-music-toggle:hover{transform:scale(1.08);box-shadow:0 0 18px rgba(0,229,255,.6);}' +
      '#bv-music-toggle.muted{border-color:#555;color:#777;box-shadow:none;}';
    document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.id = 'bv-music-toggle';
    btn.type = 'button';
    btn.title = 'Toggle music';
    btn.textContent = muted ? '🔇' : '🔊';
    if (muted) btn.classList.add('muted');
    btn.addEventListener('click', function () {
      muted = !muted;
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      btn.textContent = muted ? '🔇' : '🔊';
      btn.classList.toggle('muted', muted);
      if (muted) { audio.pause(); } else { tryPlay(); }
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { buildToggle(); tryPlay(); });
  } else {
    buildToggle();
    tryPlay();
  }

  window.BVMusic = {
    play: tryPlay,
    pause: function () { audio.pause(); },
    setVolume: function (v) { audio.volume = v; },
  };
})();
