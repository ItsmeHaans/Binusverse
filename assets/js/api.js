/* ═══════════════════════════════════════════════════════
   BINUSVERSE — api.js
   Global BV client. Talks to the Express backend.
   Include FIRST, before user-data.js and any page script.

   Token storage (localStorage):
     bv_access  — JWT access token
     bv_refresh — refresh token
     bv_user    — { id, name, email, role }
═══════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // Backend origin. Override by setting window.BV_API_BASE before this script.
  var BASE = global.BV_API_BASE || 'http://localhost:3000/api';

  var LS = {
    access:  'bv_access',
    refresh: 'bv_refresh',
    user:    'bv_user',
  };

  function getAccess()  { try { return localStorage.getItem(LS.access);  } catch (e) { return null; } }
  function getRefresh() { try { return localStorage.getItem(LS.refresh); } catch (e) { return null; } }

  function setTokens(access, refresh) {
    try {
      if (access)  localStorage.setItem(LS.access, access);
      if (refresh) localStorage.setItem(LS.refresh, refresh);
    } catch (e) {}
  }

  function setUser(user) {
    try { localStorage.setItem(LS.user, JSON.stringify(user || {})); } catch (e) {}
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(LS.user) || 'null'); } catch (e) { return null; }
  }

  function clear() {
    try {
      localStorage.removeItem(LS.access);
      localStorage.removeItem(LS.refresh);
      localStorage.removeItem(LS.user);
    } catch (e) {}
  }

  function isLoggedIn() { return !!getAccess(); }

  // ─── core request w/ one-shot refresh on 401 ─────────────────────────────────
  function rawFetch(method, path, body, token) {
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(BASE + path, {
      method: method,
      headers: headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  function parse(res) {
    return res.json().catch(function () { return {}; }).then(function (json) {
      if (!res.ok) {
        var msg = (json && (json.message || json.error)) || ('HTTP ' + res.status);
        var err = new Error(msg);
        err.status = res.status;
        err.body = json;
        throw err;
      }
      // backend wraps as { success, data }
      return (json && Object.prototype.hasOwnProperty.call(json, 'data')) ? json.data : json;
    });
  }

  var _refreshing = null;

  function doRefresh() {
    if (_refreshing) return _refreshing;
    var rt = getRefresh();
    if (!rt) return Promise.reject(new Error('No refresh token'));
    _refreshing = rawFetch('POST', '/auth/refresh', { refreshToken: rt }, null)
      .then(parse)
      .then(function (data) {
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      })
      .catch(function (e) { clear(); throw e; })
      .finally(function () { _refreshing = null; });
    return _refreshing;
  }

  function request(method, path, body) {
    return rawFetch(method, path, body, getAccess()).then(function (res) {
      if (res.status !== 401) return parse(res);
      // try refresh once, then retry
      return doRefresh().then(function (newToken) {
        return rawFetch(method, path, body, newToken).then(parse);
      });
    });
  }

  // ─── auth ─────────────────────────────────────────────────────────────────────
  var auth = {
    isLoggedIn: isLoggedIn,
    user: getUser,

    register: function (payload) {
      return rawFetch('POST', '/auth/register', payload, null).then(parse).then(function (data) {
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        return data;
      });
    },

    login: function (email, password) {
      return rawFetch('POST', '/auth/login', { email: email, password: password }, null)
        .then(parse).then(function (data) {
          setTokens(data.accessToken, data.refreshToken);
          setUser(data.user);
          return data;
        });
    },

    logout: function () {
      var token = getAccess();
      var done = token ? rawFetch('POST', '/auth/logout', { refreshToken: getRefresh() }, token).catch(function () {})
                       : Promise.resolve();
      return done.then(function () { clear(); });
    },
  };

  // Redirect to auth page when not logged in. Returns true if logged in.
  function requireAuth() {
    if (isLoggedIn()) return true;
    var here = location.pathname.split('/').pop();
    if (here !== 'auth.html' && here !== 'splash.html') {
      location.href = 'auth.html';
    }
    return false;
  }

  // ─── domain API ─────────────────────────────────────────────────────────────
  var api = {
    getProfile: function () { return request('GET', '/user/profile'); },
    getState:   function () { return request('GET', '/user/state'); },
    putState:   function (state) { return request('PUT', '/user/state', state); },

    forum: {
      channels: function () { return request('GET', '/forum/channels'); },
      posts:    function (channel) { return request('GET', '/forum/posts?channel=' + encodeURIComponent(channel)); },
      post:     function (channel, content) { return request('POST', '/forum/posts', { channel: channel, content: content }); },
    },
  };

  global.BV = {
    base: BASE,
    request: request,
    auth: auth,
    api: api,
    requireAuth: requireAuth,
    isLoggedIn: isLoggedIn,
    user: getUser,
    clear: clear,
  };

})(window);
