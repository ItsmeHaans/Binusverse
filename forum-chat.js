/* forum-chat.js — backend-backed forum (real multi-user).
   Falls back to localStorage when offline / not authenticated.
   Wraps the inline sendMessage() defined in each forum page.
   Loaded AFTER the inline <script> block and after api.js + user-data.js. */
(function () {
  var ROOM      = (typeof BV_FORUM_ROOM !== 'undefined') ? BV_FORUM_ROOM : 'global';
  var STORE_KEY = 'bv_forum_' + ROOM;
  var MAX_MSG   = 200;

  function online() { return !!(window.BV && BV.isLoggedIn()); }

  function escHtml(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmtTime(iso) {
    var d = iso ? new Date(iso) : new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  /* ── localStorage fallback ── */
  function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch(e) { return []; }
  }
  function storeMessages(msgs) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-MAX_MSG))); } catch(e) {}
  }

  /* ── row builder. msg = { sender, text, time, level } ── */
  function buildMsgRow(msg) {
    var lv  = msg.level != null ? ('LV' + msg.level) : (msg.rank || 'Unranked');
    var row = document.createElement('div');
    row.className = 'msg';
    row.innerHTML =
      '<div class="msg-av2" style="background:rgba(0,229,255,.15);color:#00e5ff;">' +
        escHtml((msg.sender || 'Explorer').slice(0,2).toUpperCase()) +
      '</div>' +
      '<div class="msg-body">' +
        '<div class="msg-meta">' +
          '<span class="msg-nm" style="color:#00e5ff;">' + escHtml(msg.sender || 'Explorer') + '</span>' +
          '<span class="msg-lv2" style="border-color:rgba(0,229,255,.35);color:#00e5ff;">' + escHtml(lv) + '</span>' +
          '<span class="msg-ts">' + escHtml(msg.time) + '</span>' +
        '</div>' +
        '<div class="msg-txt">' + escHtml(msg.text) + '</div>' +
      '</div>';
    return row;
  }

  function renderAll(container, list) {
    container.innerHTML = '';
    var frag = document.createDocumentFragment();
    list.forEach(function (m) { frag.appendChild(buildMsgRow(m)); });
    container.appendChild(frag);
    container.scrollTop = container.scrollHeight;
  }

  function hydrate() {
    var container = document.getElementById('chatMessages');
    if (!container) return;

    if (online()) {
      BV.api.forum.posts(ROOM).then(function (posts) {
        // backend returns newest-first → show oldest-first
        var list = (posts || []).slice().reverse().map(function (p) {
          return {
            sender: p.user ? p.user.name : 'Explorer',
            level:  p.user ? p.user.level : 1,
            text:   p.content,
            time:   fmtTime(p.createdAt),
          };
        });
        if (list.length) renderAll(container, list);
      }).catch(function () { hydrateLocal(container); });
    } else {
      hydrateLocal(container);
    }
  }

  function hydrateLocal(container) {
    var stored = loadStored();
    if (!stored.length) return;
    var frag = document.createDocumentFragment();
    stored.forEach(function(msg) { frag.appendChild(buildMsgRow(msg)); });
    container.insertBefore(frag, container.firstChild);
    container.scrollTop = container.scrollHeight;
  }

  /* Wrap the global sendMessage defined inline in each page */
  function wrapSend() {
    var _orig = window.sendMessage;
    if (typeof _orig !== 'function') return;

    window.sendMessage = function () {
      var ta   = document.getElementById('chatInput');
      var text = ta ? ta.value.trim() : '';
      if (!text) { if (_orig) _orig(); return; }

      var sender = 'Explorer', rank = 'Unranked', level = 1;
      if (typeof BVUser !== 'undefined') {
        var u  = BVUser.load();
        sender = u.name || 'Explorer';
        rank   = u.rank || 'Unranked';
        level  = u.level || 1;
      }

      /* Optimistic render via the page's original renderer (+ clears input) */
      if (_orig) _orig();

      if (online()) {
        BV.api.forum.post(ROOM, text).catch(function () {
          /* network failed → keep a local copy so it is not lost */
          var s = loadStored(); s.push({ text: text, time: fmtTime(), sender: sender, level: level }); storeMessages(s);
        });
      } else {
        var stored = loadStored();
        stored.push({ text: text, time: fmtTime(), sender: sender, rank: rank, level: level });
        storeMessages(stored);
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrate();
    wrapSend();
  });
})();
