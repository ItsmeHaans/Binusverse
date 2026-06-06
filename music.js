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
  var POS_KEY  = 'bv_music_pos';   // { lobby: seconds, battle: seconds } — resume per track across pages
  var LAST_KEY = 'bv_music_last';  // track that was playing on the previous page

  var trackName = window.BV_MUSIC_TRACK || 'lobby';
  var src = TRACKS[trackName] || TRACKS.lobby;

  var audio = new Audio(src);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = 'auto';

  var muted = localStorage.getItem(MUTE_KEY) === '1';

  /* ===== Resume position across page navigations =====
     Full page reloads reset <audio> to 0. We save the playback position to
     localStorage and seek back to it on the next page so the SAME track
     continues instead of restarting. Switching tracks (lobby<->battle)
     starts fresh — a different song shouldn't inherit the other's position. */
  function readPos() {
    try { return JSON.parse(localStorage.getItem(POS_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }

  var lastTrack = null;
  try { lastTrack = localStorage.getItem(LAST_KEY); } catch (e) { /* blocked */ }

  // Resume only when the SAME track was playing on the previous page. If the
  // track changed since the last page (lobby <-> battle), start fresh at 00:00
  // and clear this track's stored position so re-entry always begins at 0.
  var resumeAt = 0;
  if (lastTrack === trackName) {
    var _p = readPos();
    if (typeof _p[trackName] === 'number') resumeAt = _p[trackName];
  } else {
    try {
      var _cp = readPos();
      delete _cp[trackName];
      localStorage.setItem(POS_KEY, JSON.stringify(_cp));
    } catch (e) { /* storage blocked */ }
  }

  // Mark this page's track as the active one for the next navigation.
  try { localStorage.setItem(LAST_KEY, trackName); } catch (e) { /* blocked */ }

  function applyResume() {
    if (resumeAt > 0 && isFinite(audio.duration) && resumeAt < audio.duration) {
      try { audio.currentTime = resumeAt; } catch (e) { /* not seekable yet */ }
    }
  }
  audio.addEventListener('loadedmetadata', applyResume);
  if (audio.readyState >= 1) applyResume(); // metadata already available (cached)

  function savePos() {
    try {
      var p = readPos();
      p[trackName] = audio.currentTime || 0;
      localStorage.setItem(POS_KEY, JSON.stringify(p));
    } catch (e) { /* storage full / blocked */ }
  }
  setInterval(savePos, 1000);
  window.addEventListener('beforeunload', savePos);
  window.addEventListener('pagehide', savePos);

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
