/* forum-chat.js — localStorage persistence layer
   Wraps the inline sendMessage() defined in each forum page.
   Loaded AFTER the inline <script> block. */
(function () {
  var ROOM      = (typeof BV_FORUM_ROOM !== 'undefined') ? BV_FORUM_ROOM : 'global';
  var STORE_KEY = 'bv_forum_' + ROOM;
  var MAX_MSG   = 200;

  var RANK_COLORS = {
    'Unranked':'#888888', 'Bronze':'#cd7f32', 'Silver':'#a8a9ad',
    'Gold':'#ffd700', 'Platinum':'#e5e4e2', 'Diamond':'#b9f2ff', 'Legend':'#fee783'
  };

  function escHtml(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch(e) { return []; }
  }

  function storeMessages(msgs) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-MAX_MSG))); } catch(e) {}
  }

  function buildMsgRow(msg) {
    var rankColor = RANK_COLORS[msg.rank] || '#888';
    var row = document.createElement('div');
    row.className = 'msg me';
    row.innerHTML =
      '<div class="msg-av2" style="background:rgba(0,229,255,.15);color:#00e5ff;">' +
        escHtml((msg.sender || 'Explorer').slice(0,2).toUpperCase()) +
      '</div>' +
      '<div class="msg-body">' +
        '<div class="msg-meta">' +
          '<span class="msg-nm" style="color:' + rankColor + ';">' + escHtml(msg.sender || 'Explorer') + '</span>' +
          '<span class="msg-lv2" style="border-color:' + rankColor + '44;color:' + rankColor + ';">' + escHtml(msg.rank || 'Unranked') + '</span>' +
          '<span class="msg-ts">' + escHtml(msg.time) + '</span>' +
        '</div>' +
        '<div class="msg-txt">' + escHtml(msg.text) + '</div>' +
      '</div>';
    return row;
  }

  function hydrate() {
    var container = document.getElementById('chatMessages');
    if (!container) return;
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

      var now  = new Date();
      var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      var sender = 'Explorer', rank = 'Unranked';
      if (typeof BVUser !== 'undefined') {
        var u  = BVUser.load();
        sender = u.name || 'Explorer';
        rank   = u.rank || 'Unranked';
      }

      /* Call original to render the message in DOM */
      if (_orig) _orig();

      /* Persist */
      var stored = loadStored();
      stored.push({ text: text, time: time, sender: sender, rank: rank });
      storeMessages(stored);
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrate();
    wrapSend();
  });
})();
