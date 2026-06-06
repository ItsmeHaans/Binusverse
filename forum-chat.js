/* forum-chat.js — Backend API integration for forum posts
   Falls back to localStorage when API is unavailable.
   Loaded AFTER user-data.js and api.js. */
(function () {
  var ROOM = (typeof BV_FORUM_ROOM !== 'undefined') ? BV_FORUM_ROOM : 'global';
  var STORE_KEY = 'bv_forum_' + ROOM;
  var MAX_MSG = 200;

  // Backend channel IDs
  var BACKEND_CHANNELS = { 'global': 'global', 'cs-guild': 'cs-guild', 'engineering': 'engineering' };
  var backendChannel = BACKEND_CHANNELS[ROOM] || 'global';
  var currentPage = 1;
  var isLoadingMore = false;
  var hasMorePosts = true;

  var RANK_COLORS = {
    'Unranked':'#888888','Bronze':'#cd7f32','Silver':'#a8a9ad',
    'Gold':'#ffd700','Platinum':'#e5e4e2','Diamond':'#b9f2ff','Legend':'#fee783'
  };

  function escHtml(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── localStorage fallback ──
  function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch(e) { return []; }
  }
  function storeMessages(msgs) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-MAX_MSG))); } catch(e) {}
  }

  // ── Build message row from backend post ──
  function buildRowFromPost(post) {
    var userName = (post.user && post.user.name) ? post.user.name : 'Explorer';
    var division = (post.user && post.user.division) ? post.user.division : 'Unranked';
    var rankColor = RANK_COLORS[division] || '#888';
    var level = (post.user && post.user.level) ? post.user.level : 1;
    var time = post.createdAt ? new Date(post.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '';

    var row = document.createElement('div');
    row.className = 'msg me';
    row.dataset.postId = post.id || '';
    row.innerHTML =
      '<div class="msg-av2" style="background:rgba(0,229,255,.15);color:#00e5ff;">' +
        escHtml(userName.slice(0,2).toUpperCase()) +
      '</div>' +
      '<div class="msg-body">' +
        '<div class="msg-meta">' +
          '<span class="msg-nm" style="color:' + rankColor + ';">' + escHtml(userName) + '</span>' +
          '<span class="msg-lv2" style="border-color:' + rankColor + '44;color:' + rankColor + ';">LV' + level + '</span>' +
          '<span class="msg-ts">' + escHtml(time) + '</span>' +
          (post.id ? '<button class="msg-like-btn" data-post-id="' + post.id + '" style="margin-left:8px;background:none;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.4);font-size:.5rem;cursor:pointer;padding:2px 6px;" title="Like">♥ ' + (post._count && post._count.likes ? post._count.likes : 0) + '</button>' : '') +
        '</div>' +
        '<div class="msg-txt">' + escHtml(post.content || post.text || '') + '</div>' +
      '</div>';
    return row;
  }

  // ── Build message row from localStorage msg ──
  function buildRowFromLocal(msg) {
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

  function showLoading(show) {
    var el = document.getElementById('chat-loading');
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
  }

  // ── Load posts from backend ──
  function loadPosts(page, prepend) {
    if (typeof BVAPI === 'undefined' || !BVAPI.isLoggedIn()) {
      hydrateFromLocal();
      return;
    }
    if (page === 1) showLoading(true);
    BVAPI.getForumPosts(backendChannel, page)
      .then(function (posts) {
        showLoading(false);
        var container = document.getElementById('chatMessages');
        if (!container) return;
        if (!posts || posts.length === 0) {
          hasMorePosts = false;
          if (page === 1) {
            container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.3);font-family:\'Press Start 2P\',monospace;font-size:0.761rem;padding:32px 0;">No messages yet.<br>Be the first!</div>';
          }
          return;
        }
        // Posts come newest-first from server, reverse to show oldest-first
        var ordered = posts.slice().reverse();
        var frag = document.createDocumentFragment();
        ordered.forEach(function (post) { frag.appendChild(buildRowFromPost(post)); });
        if (prepend) {
          container.insertBefore(frag, container.firstChild);
        } else {
          container.appendChild(frag);
          container.scrollTop = container.scrollHeight;
        }
        hasMorePosts = posts.length >= 20;
      })
      .catch(function () {
        showLoading(false);
        hydrateFromLocal();
      });
  }

  function hydrateFromLocal() {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    var stored = loadStored();
    if (!stored.length) return;
    var frag = document.createDocumentFragment();
    stored.forEach(function(msg) { frag.appendChild(buildRowFromLocal(msg)); });
    container.insertBefore(frag, container.firstChild);
    container.scrollTop = container.scrollHeight;
  }

  // ── Send message ──
  function wrapSend() {
    var _orig = window.sendMessage;
    if (typeof _orig !== 'function') return;

    window.sendMessage = function () {
      var ta   = document.getElementById('chatInput');
      var text = ta ? ta.value.trim() : '';
      if (!text) return;

      // Optimistic local render via original handler
      if (_orig) _orig();

      if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
        BVAPI.createPost(backendChannel, text)
          .then(function (post) {
            // Replace last local-rendered message with server-confirmed post
            var container = document.getElementById('chatMessages');
            if (!container || !post) return;
            var lastRow = container.lastElementChild;
            var serverRow = buildRowFromPost(post);
            if (lastRow) container.replaceChild(serverRow, lastRow);
          })
          .catch(function () {
            // Keep local render, persist to localStorage as fallback
            var now  = new Date();
            var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
            var sender = 'Explorer', rank = 'Unranked';
            if (typeof BVUser !== 'undefined') {
              var u = BVUser.load();
              sender = u.name || 'Explorer';
              rank   = u.rank || 'Unranked';
            }
            var stored = loadStored();
            stored.push({ text: text, time: time, sender: sender, rank: rank });
            storeMessages(stored);
          });
      } else {
        // localStorage fallback
        var now  = new Date();
        var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
        var sender = 'Explorer', rank = 'Unranked';
        if (typeof BVUser !== 'undefined') {
          var u = BVUser.load();
          sender = u.name || 'Explorer';
          rank   = u.rank || 'Unranked';
        }
        var stored = loadStored();
        stored.push({ text: text, time: time, sender: sender, rank: rank });
        storeMessages(stored);
      }
    };
  }

  // ── Inject loading indicator into chat ──
  function injectLoadingEl() {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    var el = document.createElement('div');
    el.id = 'chat-loading';
    el.style.cssText = 'display:none;text-align:center;color:rgba(0,229,255,.5);font-family:"Press Start 2P",monospace;font-size:0.585rem;padding:16px 0;';
    el.textContent = 'LOADING...';
    container.parentNode.insertBefore(el, container);
  }

  // ── Like button handler ──
  function bindLikes() {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.msg-like-btn');
      if (!btn) return;
      var postId = btn.dataset.postId;
      if (!postId || typeof BVAPI === 'undefined') return;
      BVAPI.likePost(postId).then(function (res) {
        btn.style.color = res.liked ? '#ff6b6b' : 'rgba(255,255,255,.4)';
      }).catch(function () {});
    });
  }

  // ── Channel switching ──
  function bindChannelSwitch() {
    document.querySelectorAll('.ch-item[data-channel]').forEach(function (el) {
      el.addEventListener('click', function () {
        var ch = el.dataset.channel;
        if (!BACKEND_CHANNELS[ch]) return; // not connected
        backendChannel = ch;
        currentPage = 1;
        hasMorePosts = true;
        var container = document.getElementById('chatMessages');
        if (container) container.innerHTML = '';
        document.querySelectorAll('.ch-item').forEach(function(x) { x.classList.remove('active'); });
        el.classList.add('active');
        var breadcrumb = document.querySelector('.bc-cur');
        if (breadcrumb) breadcrumb.textContent = '# ' + ch;
        loadPosts(1, false);
      });
    });
  }

  // ── Load more on scroll to top ──
  function bindScrollLoad() {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    container.addEventListener('scroll', function () {
      if (container.scrollTop < 60 && hasMorePosts && !isLoadingMore) {
        isLoadingMore = true;
        currentPage++;
        loadPosts(currentPage, true);
        setTimeout(function () { isLoadingMore = false; }, 1500);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectLoadingEl();
    loadPosts(1, false);
    wrapSend();
    bindLikes();
    bindChannelSwitch();
    bindScrollLoad();
  });
})();
