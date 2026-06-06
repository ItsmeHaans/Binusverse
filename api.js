/* ═══════════════════════════════════════════════════════
   BINUSVERSE — api.js
   Central API module. Include BEFORE any page script.
   Handles JWT storage, auto-refresh, and all endpoints.
═══════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var API_URL = 'http://localhost:3000';

  var TOKEN_KEY   = 'bv_access_token';
  var REFRESH_KEY = 'bv_refresh_token';

  // ── Topic → Skill mapping ──
  var TOPIC_SKILL = {
    'Algorithms': 'data', 'Data Structures': 'data', 'Programming': 'data',
    'OOP': 'data', 'Database': 'data', 'Web Development': 'data',
    'Computer Basics': 'data', 'Number Systems': 'data', 'DevOps': 'data',
    'Networking': 'cyber', 'Operating Systems': 'cyber', 'Distributed Systems': 'cyber',
    'Security': 'cyber', 'Cybersecurity': 'cyber',
    'Artificial Intelligence': 'ai', 'Machine Learning': 'ai',
    'AI Fundamentals': 'ai', 'Deep Learning': 'ai',
  };

  // Topic → frontend topic key
  var TOPIC_KEY = {
    'Algorithms': 'algorithms', 'OOP': 'oop',
    'AI Fundamentals': 'aiFundamentals', 'Artificial Intelligence': 'aiFundamentals',
    'Machine Learning': 'aiFundamentals', 'Deep Learning': 'aiFundamentals',
    'Dynamic Programming': 'dynamicProgramming', 'Graph Theory': 'graphTheory',
    'Recursion': 'recursion',
  };

  // Backend item name → frontend item key
  var ITEM_NAME_TO_KEY = {
    'Phantom Eraser': 'eraser', 'Time Freeze Orb': 'freeze',
    '2nd Chance Scroll': 'retry', 'XP Magnet': 'xp',
    'Aegis Shield': 'shield', 'Soul Gem': 'gem',
    'Time Warp': 'warp', 'Focus Potion': 'focus',
    'Mirror Relic': 'mirror', 'Storm Relic': 'storm',
    'Oracle Relic': 'oracle', 'Vortex Relic': 'vortex',
    'Prism Relic': 'prism', 'Nova Relic': 'nova',
    'Echo Relic': 'echo', 'Compass Relic': 'compass',
    'Anchor Relic': 'anchor', 'Lantern Relic': 'lantern',
    'Tome Relic': 'tome', 'Cipher Relic': 'cipher',
    'Dust Relic': 'dust', 'Coin Relic': 'coin',
    'Badge Relic': 'badge', 'Rune Relic': 'rune',
    'Glitch Relic': 'glitch', 'Pouch Relic': 'pouch',
    'Scroll Relic': 'scroll', 'Spark Relic': 'spark',
  };

  // ── Token helpers ──
  function getToken()    { return localStorage.getItem(TOKEN_KEY); }
  function getRefresh()  { return localStorage.getItem(REFRESH_KEY); }
  function setTokens(access, refresh) {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  }
  function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  // ── Refresh access token ──
  var _refreshPromise = null;
  function refreshAccessToken() {
    if (_refreshPromise) return _refreshPromise;
    var rt = getRefresh();
    if (!rt) return Promise.reject(new Error('No refresh token'));
    _refreshPromise = fetch(API_URL + '/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _refreshPromise = null;
        if (!data.data) throw new Error('Refresh failed');
        setTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
      })
      .catch(function (err) {
        _refreshPromise = null;
        clearTokens();
        throw err;
      });
    return _refreshPromise;
  }

  // ── Core fetch with auto-refresh ──
  function apiFetch(path, opts, _retried) {
    opts = opts || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    return fetch(API_URL + path, Object.assign({}, opts, { headers: headers }))
      .then(function (res) {
        if (res.status === 401 && !_retried) {
          return refreshAccessToken().then(function () {
            return apiFetch(path, opts, true);
          });
        }
        return res.json().then(function (body) {
          if (!res.ok) {
            var msg = body.error || body.message || 'Request failed';
            if (body.errors) {
              var details = Object.entries(body.errors).map(function(e) { return e[0] + ': ' + e[1].join(', '); }).join(' | ');
              msg = msg + ' (' + details + ')';
            }
            throw new Error(msg);
          }
          return body;
        });
      });
  }

  // ── Transform question from backend to frontend format ──
  function transformQuestion(q) {
    var skill = TOPIC_SKILL[q.topic] || 'data';
    var topicKey = TOPIC_KEY[q.topic] || 'algorithms';
    return {
      id: q.id,
      text: q.text,
      opts: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
      correct: q.correctOption,
      skill: skill,
      topic: topicKey,
      difficulty: (q.difficulty || 'normal').toLowerCase(),
    };
  }

  // ═══════════════════════════════
  // AUTH
  // ═══════════════════════════════
  function register(name, email, password, faculty, batch) {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: name, email: email, password: password, faculty: faculty || null, batch: batch || null }),
    }).then(function (data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data;
    });
  }

  function login(email, password) {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password }),
    }).then(function (data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data;
    });
  }

  function logout() {
    var rt = getRefresh();
    return apiFetch('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: rt }),
    }).finally(function () {
      clearTokens();
    });
  }

  function isLoggedIn() {
    return !!getToken();
  }

  // ═══════════════════════════════
  // USER
  // ═══════════════════════════════
  function getProfile() {
    return apiFetch('/api/user/profile').then(function (d) { return d.data; });
  }

  // ═══════════════════════════════
  // QUIZ / DAILY
  // ═══════════════════════════════
  function getDailyQuiz() {
    return apiFetch('/api/quiz/daily').then(function (d) {
      var quiz = d.data;
      quiz.questions = quiz.questions.map(transformQuestion);
      return quiz;
    });
  }

  function submitDailyQuiz(quizId, answers) {
    return apiFetch('/api/quiz/daily/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: quizId, answers: answers }),
    }).then(function (d) { return d.data; });
  }

  // ═══════════════════════════════
  // BATTLE / RAID
  // ═══════════════════════════════
  function getRaidQuestions(difficulty) {
    return apiFetch('/api/battle/raid/questions?difficulty=' + difficulty.toUpperCase())
      .then(function (d) { return d.data.map(transformQuestion); });
  }

  function submitRaid(difficulty, answers, totalTimeMs) {
    return apiFetch('/api/battle/raid/submit', {
      method: 'POST',
      body: JSON.stringify({ difficulty: difficulty.toUpperCase(), answers: answers, totalTimeMs: totalTimeMs }),
    }).then(function (d) { return d.data; });
  }

  function getBattleHistory() {
    return apiFetch('/api/battle/history').then(function (d) { return d.data; });
  }

  // ═══════════════════════════════
  // ITEMS
  // ═══════════════════════════════
  function getInventory() {
    return apiFetch('/api/items').then(function (d) { return d.data; });
  }

  function useItemOnServer(itemName) {
    return apiFetch('/api/items/use', {
      method: 'POST',
      body: JSON.stringify({ itemName: itemName }),
    }).then(function (d) { return d.data; });
  }

  // Convert backend inventory array to frontend items object { key: quantity }
  function inventoryToLocal(inventoryArr) {
    var out = {};
    (inventoryArr || []).forEach(function (entry) {
      var key = ITEM_NAME_TO_KEY[entry.item.name];
      if (key) out[key] = entry.quantity;
    });
    return out;
  }

  // Convert backend item name to frontend key
  function itemNameToKey(name) {
    return ITEM_NAME_TO_KEY[name] || null;
  }

  // ═══════════════════════════════
  // FORUM
  // ═══════════════════════════════
  function getForumPosts(channel, page) {
    return apiFetch('/api/forum/posts?channel=' + encodeURIComponent(channel) + '&page=' + (page || 1))
      .then(function (d) { return d.data; });
  }

  function createPost(channel, content) {
    return apiFetch('/api/forum/posts', {
      method: 'POST',
      body: JSON.stringify({ channel: channel, content: content }),
    }).then(function (d) { return d.data; });
  }

  function likePost(postId) {
    return apiFetch('/api/forum/posts/' + postId + '/like', {
      method: 'POST',
    }).then(function (d) { return d.data; });
  }

  // ═══════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════
  function getLeaderboard(mode, limit) {
    return apiFetch('/api/leaderboard?mode=' + (mode || 'pvp') + '&limit=' + (limit || 20))
      .then(function (d) { return d.data; });
  }

  // ═══════════════════════════════
  // Export
  // ═══════════════════════════════
  global.BVAPI = {
    // Auth
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getToken: getToken,
    clearTokens: clearTokens,
    // User
    getProfile: getProfile,
    // Quiz
    getDailyQuiz: getDailyQuiz,
    submitDailyQuiz: submitDailyQuiz,
    // Battle
    getRaidQuestions: getRaidQuestions,
    submitRaid: submitRaid,
    getBattleHistory: getBattleHistory,
    // Items
    getInventory: getInventory,
    useItemOnServer: useItemOnServer,
    inventoryToLocal: inventoryToLocal,
    itemNameToKey: itemNameToKey,
    // Forum
    getForumPosts: getForumPosts,
    createPost: createPost,
    likePost: likePost,
    // Leaderboard
    getLeaderboard: getLeaderboard,
  };

})(window);
