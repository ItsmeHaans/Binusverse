/* ══════════════════════════════════════════
   BINUSVERSE — battle-play.js  v2
   Mode: ?mode=daily | ?mode=raid&difficulty=easy|normal|hard
══════════════════════════════════════════ */

// ─── QUESTION BANK — loaded from backend ───
let ALL_QUESTIONS = [];

const RAID_STYLE = {
  easy:   { border:"#00ff88", shadow:"#005c28", diffClass:"easy",   label:"EASY"   },
  normal: { border:"#ffd000", shadow:"#664d00", diffClass:"normal", label:"NORMAL" },
  hard:   { border:"#ff2a2a", shadow:"#660000", diffClass:"hard",   label:"HARD"   },
};

const CONFIG = {
  daily: { totalQ:10, timePerQ:15, passMark:0 },
  raid: {
    easy:   { totalQ:8,  timePerQ:25, passMark:5  },
    normal: { totalQ:10, timePerQ:15, passMark:7  },
    hard:   { totalQ:12, timePerQ:8,  passMark:9  },
  },
};
const XP = { perCorrect:10, speedBonus:5, completion:20, raidClear:40, perfect:50 };

/* ── Battle items — derived from ITEMS_REGISTRY (items-data.js) ── */
const ITEMS = (function() {
  var out = {};
  var SVG_WRAP = function(inner) {
    return '<svg width="28" height="28" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' + inner + '</svg>';
  };
  if (typeof ITEMS_REGISTRY !== 'undefined') {
    Object.keys(ITEMS_REGISTRY).forEach(function(k) {
      var r = ITEMS_REGISTRY[k];
      if (r.itemType !== 'battle') return;
      out[k] = {
        name:   r.name,
        color:  r.color   || '#888',
        rarity: (r.rarity || 'common').toUpperCase(),
        desc:   r.desc    || r.ability || '',
        svg:    SVG_WRAP(r.svgContent || ''),
      };
    });
  }
  return out;
})();

const state = {
  mode:"daily", difficulty:"easy", cfg:null,
  questions:[], current:0, correct:0, wrong:0,
  totalMs:0, qStart:0, answered:false,
  timerInt:null, timeLeft:15, streak:0,
  exitTarget:"battle.html",
  items: Object.keys(ITEMS).reduce(function(acc, k){ acc[k]=0; return acc; }, {}),
  xpMultiplier:1, retryPending:false,
  passives:{ aiTimeBonus:0, aiHints:0, cyberXP:1, cyberShield:false, cyberShieldUsed:false, cyberTimeoutRetry:false, cyberTimeoutRetryUsed:false, dataStreakMult:1, dataItemDouble:false, dataSRankBonus:0 },
  shieldActive:false, focusActive:false, warpUsed:false,
  warpPenalty:0,
  questionLog:[],
  // For backend submission: track per-question answers with IDs
  answerLog:[],       // [{questionId, answer, timeTaken}]
  dailyQuizId: null,  // quizId from backend for daily submission
  battleStartMs: 0,   // for totalTimeMs on raid submit
};

const $ = id => document.getElementById(id);
const RING_C = 213.6;

// ═══════════════ PARTICLES ═══════════════
let pCtx = null, ptcls = [];
function initParticles() {
  const cvs = $('arenaParticles');
  if (!cvs) return;
  pCtx = cvs.getContext('2d');
  function resize() { cvs.width = cvs.offsetWidth; cvs.height = cvs.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  ptcls = [];
  for (let i = 0; i < 60; i++) {
    ptcls.push({
      x:Math.random()*cvs.width, y:Math.random()*cvs.height,
      r:Math.random()>.82?2:1,
      vx:0, vy:-(0.12+Math.random()*0.25),
      a:0.08+Math.random()*0.22,
      color:['#00c3ff','#fee783','#00ff88','#c084fc'][0|Math.random()*4],
      burst:false, life:0,
    });
  }
  animateP();
}
function animateP() {
  const cvs = $('arenaParticles');
  if (!cvs || !pCtx) return;
  pCtx.clearRect(0, 0, cvs.width, cvs.height);
  ptcls = ptcls.filter(p => !p.burst || p.life > 0);
  ptcls.forEach(p => {
    if (p.burst) { p.x += p.vx; p.y += p.vy; p.life--; p.a *= 0.96; }
    else { p.y += p.vy; if (p.y < -4) { p.y = cvs.height + 4; p.x = Math.random()*cvs.width; } }
    pCtx.globalAlpha = Math.max(0, p.a);
    pCtx.fillStyle = p.color;
    pCtx.fillRect(~~p.x, ~~p.y, p.r, p.r);
  });
  pCtx.globalAlpha = 1;
  requestAnimationFrame(animateP);
}
function burstP(good) {
  const cvs = $('arenaParticles');
  if (!cvs) return;
  const cx = cvs.width/2, cy = cvs.height/2;
  for (let i = 0; i < 20; i++) {
    const a = (Math.PI*2/20)*i;
    ptcls.push({ x:cx, y:cy, r:2, vx:Math.cos(a)*(2+Math.random()*3), vy:Math.sin(a)*(2+Math.random()*3), a:0.9, color:good?'#00ff88':'#ff4d4d', burst:true, life:45 });
  }
}

// ═══════════════ INIT ═══════════════
function init() {
  const ham = $('hamburger');
  if (ham) ham.addEventListener('click', () => $('navLinks').classList.toggle('active'));

  const p = new URLSearchParams(window.location.search);
  state.mode       = p.get('mode')       || 'daily';
  state.difficulty = p.get('difficulty') || 'easy';

  if (state.mode === 'daily')     state.cfg = CONFIG.daily;
  else if (state.mode === 'raid') state.cfg = CONFIG.raid[state.difficulty];
  else return;

  if (state.mode === 'daily') {
    // Questions already loaded from backend in loadAndInit
    state.questions = ALL_QUESTIONS.slice(0, state.cfg.totalQ);
  } else {
    // Raid: questions already filtered by difficulty from backend
    state.questions = shuffle([...ALL_QUESTIONS]).slice(0, state.cfg.totalQ);
  }
  state.questionLog = [];
  state.answerLog = [];
  state.warpPenalty = 0;

  if (state.questions.length === 0) {
    // Reveal the screen first — otherwise the error is invisible (blank page).
    $('battle-screen').classList.remove('hidden');
    const card = $('battle-card');
    if (card) card.innerHTML = '<div style="padding:2rem;text-align:center;color:#ff4d4d;font-family:\'Press Start 2P\',monospace;font-size:0.78rem;line-height:2.2">FAILED TO LOAD<br>QUESTIONS<br><br>Question bank may be<br>short for this difficulty.<br><br><a href="battle.html" style="color:#fee783;text-decoration:none;font-size:0.65rem">[ BACK ]</a></div>';
    return;
  }

  $('battle-screen').classList.remove('hidden');
  ['pvp-section','daily-section','raid-section'].forEach(id => { const e=$(id); if(e) e.style.display='none'; });

  // Mode badge
  const badge = $('hud-mode-badge');
  if (state.mode === 'daily') {
    badge.textContent = 'DAILY MISSION';
    badge.style.cssText += ';border-color:rgba(0,229,255,.3);color:#00e5ff;';
  } else {
    const rs = RAID_STYLE[state.difficulty];
    badge.textContent = 'RAID - ' + rs.label;
    badge.style.cssText += `;border-color:${rs.border}55;color:${rs.border};`;
    $('battle-card').style.borderColor = rs.border;
    $('battle-card').style.boxShadow = `0 0 40px ${rs.border}18,6px 6px 0 ${rs.shadow}`;
    const db = $('bc-diff-badge');
    db.textContent = rs.label;
    db.className = `bc-diff-badge ${rs.diffClass}`;
    db.classList.remove('hidden');
  }

  // Load items from localStorage
  if (typeof BVUser !== 'undefined') {
    const saved = BVUser.load();
    Object.keys(state.items).forEach(k => {
      state.items[k] = (saved.items && saved.items[k]) || 0;
    });

    // Apply skill passives
    applySkillPassives(saved);

  }

  buildDots();
  renderItemsBar();
  loadQ();
  bindAnswers();
  initParticles();
  lockToMode();
  bindExitModal();
}

// ─── SKILL PASSIVES ───
function applySkillPassives(u) {
  const aiLv    = typeof BVUser !== 'undefined' ? BVUser.getSkillLevel(u.skills.ai)    : 1;
  const cyberLv = typeof BVUser !== 'undefined' ? BVUser.getSkillLevel(u.skills.cyber) : 1;
  const dataLv  = typeof BVUser !== 'undefined' ? BVUser.getSkillLevel(u.skills.data)  : 1;

  // AI passives
  if (aiLv >= 4) { state.passives.aiTimeBonus = 4; state.passives.aiHints = 1; }
  else if (aiLv >= 3) { state.passives.aiTimeBonus = 2; state.passives.aiHints = 1; }
  else if (aiLv >= 2) { state.passives.aiTimeBonus = 2; state.passives.aiHints = 0; }
  if (aiLv >= 5) state.passives.aiHints = 2;

  // Cyber passives
  if (cyberLv >= 5) { state.passives.cyberXP = 1.15; state.passives.cyberTimeoutRetry = true; }
  else if (cyberLv >= 4) { state.passives.cyberXP = 1.15; state.passives.cyberShield = true; }
  else if (cyberLv >= 3) { state.passives.cyberXP = 1.10; state.passives.cyberShield = true; }
  else if (cyberLv >= 2) { state.passives.cyberXP = 1.10; }

  // Data passives
  if (dataLv >= 5) { state.passives.dataStreakMult = 1.5; state.passives.dataItemDouble = true; state.passives.dataSRankBonus = 30; }
  else if (dataLv >= 4) { state.passives.dataStreakMult = 1.5; state.passives.dataItemDouble = true; }
  else if (dataLv >= 3) { state.passives.dataStreakMult = 1.2; }
  else if (dataLv >= 2) { state.passives.dataStreakMult = 1.2; }
}

// ─── RENDER ITEMS BAR (dynamic from localStorage) ───
function renderItemsBar() {
  const container = $('items-bar-slots');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(ITEMS).forEach(k => {
    const def = ITEMS[k];
    const count = state.items[k] || 0;
    if (count <= 0) return; // only show items the player actually owns
    const slot = document.createElement('div');
    slot.className = 'item-slot';
    slot.id = `item-${k}`;
    slot.dataset.item = k;
    slot.title = def.name;
    slot.innerHTML = `
      <div class="item-slot-inner">${def.svg}</div>
      <div class="item-slot-name">${k.toUpperCase()}</div>
      <div class="item-slot-count" id="${k}-count">×${count}</div>
      <div class="item-tooltip-box">
        <div class="itb-name">${def.name}</div>
        <div class="itb-rarity" style="color:${def.color};font-size:0.5rem;font-family:'Press Start 2P',monospace;margin-bottom:3px;">${def.rarity}</div>
        <div class="itb-desc">${def.desc}</div>
      </div>
    `;
    slot.addEventListener('click', () => useItem(k));
    container.appendChild(slot);
  });
}

// ─── DOTS ───
function buildDots() {
  const w = $('hud-progress-dots'); w.innerHTML = '';
  for (let i = 0; i < state.cfg.totalQ; i++) {
    const d = document.createElement('div');
    d.className = 'hpd' + (i===0?' cur':'');
    d.id = `hpd-${i}`;
    w.appendChild(d);
  }
}
function dotResult(idx, ok) {
  const p = $(`hpd-${idx}`); if(p){p.classList.remove('cur');p.classList.add(ok?'done':'wrong');}
  const n = $(`hpd-${idx+1}`); if(n) n.classList.add('cur');
}

// ─── ITEMS ───
function refreshItem(k) {
  const c = $(`${k}-count`); if(c) c.textContent=`×${state.items[k]}`;
  const s = $(`item-${k}`); if(s) s.classList.toggle('used', state.items[k]<=0);
}

function useItem(k) {
  if (state.items[k] <= 0) return;
  if (state.answered && k !== 'retry') return;
  // shield can only be used when not answered
  if (k === 'shield' && state.answered) return;
  // focus can only be used when not answered
  if (k === 'focus' && state.answered) return;

  state.items[k]--;
  refreshItem(k);
  flashItem(ITEMS[k].name);

  // Save to localStorage + backend
  if (typeof BVUser !== 'undefined') {
    const u = BVUser.load();
    u.items[k] = Math.max(0, (u.items[k] || 0) - 1);
    BVUser.save(u);
  }
  if (typeof BVAPI !== 'undefined') {
    BVAPI.useItemOnServer(ITEMS[k].name).catch(() => {/* ignore — local already updated */});
  }

  // ── Item effects ──
  if (k === 'eraser') {
    // Eliminate 2 wrong choices
    const q = state.questions[state.current]; let n = 0;
    document.querySelectorAll('.bc-ans').forEach(b => {
      if (b.dataset.key !== q.correct && n < 2) {
        b.classList.add('eraser-eliminated');
        b.disabled = true;
        b.style.pointerEvents = 'none';
        spawnEraserDust(b);
        setTimeout(() => { b.style.visibility = 'hidden'; }, 360);
        n++;
      }
    });
    if (typeof BVNotify !== 'undefined') BVNotify.toast('2 wrong choices eliminated!', 'warn', '🧹');

  } else if (k === 'freeze') {
    state.timeLeft = Math.min(state.timeLeft+10, state.cfg.timePerQ);
    updateRing(state.timeLeft, state.cfg.timePerQ);
    $('hud-timer-num').textContent = state.timeLeft;
    $('battle-timer-fill').style.width = (state.timeLeft/state.cfg.timePerQ*100)+'%';
    // Ice overlay
    const ring = $('hud-timer-ring');
    if (ring && !ring.querySelector('.freeze-ring-overlay')) {
      const ov = document.createElement('div'); ov.className='freeze-ring-overlay';
      const lb = document.createElement('div'); lb.className='freeze-label'; lb.textContent='+10s';
      ring.appendChild(ov); ring.appendChild(lb);
      setTimeout(() => { ov.remove(); lb.remove(); }, 2000);
    }
    if (typeof BVNotify !== 'undefined') BVNotify.toast('+10 seconds added!', 'item', '❄');

  } else if (k === 'retry') {
    if (!state.answered) return;
    state.answered = false;
    state.wrong = Math.max(0, state.wrong-1);
    $('hud-wrong').textContent = state.wrong;
    document.querySelectorAll('.bc-ans').forEach(b => {
      b.disabled=false; b.className='bc-ans'; b.style.opacity=''; b.style.pointerEvents='';
    });
    hideFB();
    const rf = document.createElement('div'); rf.className='retry-flash-el'; rf.textContent='↩ RETRY!';
    document.body.appendChild(rf); rf.addEventListener('animationend', () => rf.remove());
    state.retryPending = true;
    startTimer();
    if (typeof BVNotify !== 'undefined') BVNotify.toast('Second chance — no penalty!', 'success', '↩');

  } else if (k === 'xp') {
    state.xpMultiplier = 1.5;
    const card = $('battle-card');
    if (card) {
      card.classList.add('xp-magnet-active');
      const ft = document.createElement('div'); ft.className='xp-float-text'; ft.textContent='× 1.5 XP';
      card.appendChild(ft); ft.addEventListener('animationend', () => ft.remove());
    }
    if (typeof BVNotify !== 'undefined') BVNotify.toast('XP ×1.5 active!', 'xp', '🧲');

  } else if (k === 'shield') {
    // Absorb next wrong answer
    state.shieldActive = true;
    const card = $('battle-card');
    if (card) { card.classList.add('shield-active'); }
    // Show shield overlay on card
    showShieldOverlay();
    if (typeof BVNotify !== 'undefined') BVNotify.toast('Shield up — next wrong absorbed!', 'success', '🛡');

  } else if (k === 'gem') {
    // Peek correct answer for 2s
    const q = state.questions[state.current];
    document.querySelectorAll('.bc-ans').forEach(b => {
      if (b.dataset.key === q.correct) {
        b.classList.add('gem-peek');
        setTimeout(() => b.classList.remove('gem-peek'), 2000);
      }
    });
    // Sparkle overlay
    const peek = document.createElement('div'); peek.className='gem-peek-overlay';
    peek.innerHTML = '✦ SOUL GEM ✦'; $('battle-arena').appendChild(peek);
    setTimeout(() => peek.remove(), 2200);
    if (typeof BVNotify !== 'undefined') BVNotify.toast('Correct answer revealed for 2s!', 'item', '💎');

  } else if (k === 'warp') {
    // Skip question — counts as correct, 50% XP, advance
    if (state.answered) return;
    state.answered = true;
    clearTimer();
    state.correct++;
    state.streak++;
    $('hud-correct').textContent = state.correct;
    updateStreak();
    dotResult(state.current, true);
    state.questionLog.push({ skill: state.questions[state.current].skill, topic: state.questions[state.current].topic, correct: true });
    // Warp flash
    const wf = document.createElement('div'); wf.className='warp-flash-el';
    wf.textContent = '⌖ TIME WARP!'; document.body.appendChild(wf);
    wf.addEventListener('animationend', () => wf.remove());
    if (typeof BVNotify !== 'undefined') BVNotify.toast('Skipped — counted correct! (50% XP)', 'xp', '⌖');
    // 50% XP penalty for this one skipped question (tracked separately, not session-wide)
    state.warpPenalty += Math.floor(XP.perCorrect / 2);
    setTimeout(advance, 900);

  } else if (k === 'focus') {
    // Pause timer until answered
    state.focusActive = true;
    clearTimer();
    const fc = $('hud-timer-num'); if(fc) fc.style.color='#00e5ff';
    const fb = $('battle-timer-fill'); if(fb) fb.style.background='linear-gradient(90deg,#00e5ff,#c084fc)';
    // Freeze ring visual
    const ring = $('hud-timer-ring');
    if (ring && !ring.querySelector('.freeze-ring-overlay')) {
      const ov = document.createElement('div'); ov.className='freeze-ring-overlay'; ov.style.borderColor='#00e5ff';
      const lb = document.createElement('div'); lb.className='freeze-label'; lb.textContent='FOCUSED'; lb.style.color='#00e5ff';
      ring.appendChild(ov); ring.appendChild(lb);
      state._focusOverlay = [ov, lb];
    }
    if (typeof BVNotify !== 'undefined') BVNotify.toast('Timer paused — think freely!', 'item', '🧪');
  }
}

function showShieldOverlay() {
  const card = $('battle-card');
  if (!card || card.querySelector('.shield-overlay')) return;
  const ov = document.createElement('div');
  ov.className = 'shield-overlay';
  ov.innerHTML = '<span class="shield-icon">🛡</span>';
  card.appendChild(ov);
  state._shieldOverlayEl = ov;
}
function removeShieldOverlay() {
  if (state._shieldOverlayEl) { state._shieldOverlayEl.remove(); state._shieldOverlayEl = null; }
  const card = $('battle-card'); if(card) card.classList.remove('shield-active');
}

function spawnEraserDust(btn) {
  const rect = btn.getBoundingClientRect();
  const colors = ['#ff9500','#ffb700','#fff','#ff4d4d'];
  for (let i = 0; i < 8; i++) {
    const dust = document.createElement('div');
    dust.className = 'eraser-dust';
    const dx = (-20 + Math.random() * 40).toFixed(0) + 'px';
    const dy = (-30 + Math.random() * -20).toFixed(0) + 'px';
    dust.style.cssText = `left:${rect.left + Math.random()*rect.width}px;top:${rect.top + Math.random()*rect.height}px;background:${colors[0|Math.random()*colors.length]};position:fixed;z-index:9999;--dx:${dx};--dy:${dy};`;
    document.body.appendChild(dust);
    dust.addEventListener('animationend', () => dust.remove());
  }
}

function flashItem(name) {
  const el = $('item-use-flash'); if(!el) return;
  el.textContent = `✦ ${name} ACTIVATED!`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 700);
}

// ─── AI HINT (passive) ───
function applyAIHint() {
  if (state.passives.aiHints <= 0) return;
  const q = state.questions[state.current];
  let n = 0;
  document.querySelectorAll('.bc-ans').forEach(b => {
    if (b.dataset.key !== q.correct && n < state.passives.aiHints && !b.classList.contains('eraser-eliminated')) {
      b.classList.add('ai-hint-dim');
      n++;
    }
  });
}

// ─── LOAD QUESTION ───
function loadQ() {
  const q = state.questions[state.current];
  state.answered = false; state.qStart = Date.now(); state.xpMultiplier = 1;
  state.shieldActive = false; state.focusActive = false;
  // Clear XP aura + shield
  const card = $('battle-card');
  if (card) { card.classList.remove('xp-magnet-active', 'shield-active'); }
  removeShieldOverlay();
  // Clear focus overlay
  if (state._focusOverlay) { state._focusOverlay.forEach(e => e.remove()); state._focusOverlay = null; }
  const fc = $('hud-timer-num'); if(fc) fc.style.color='';
  const fb = $('battle-timer-fill'); if(fb) fb.style.background='';

  $('bc-q-num').textContent = `QUESTION ${state.current+1} / ${state.cfg.totalQ}`;
  $('bc-q-text').textContent = q.text;
  ['A','B','C','D'].forEach(k => {
    const b = document.querySelector(`.bc-ans[data-key="${k}"]`);
    if (!b) return;
    b.className='bc-ans'; b.disabled=false; b.style.opacity=''; b.style.pointerEvents=''; b.style.visibility='';
    $(`ans-${k}`).textContent = q.opts[k];
  });
  hideFB();
  clearTimer();
  // AI time bonus applied here
  state.timeLeft = (state.cfg.timePerQ || 15) + state.passives.aiTimeBonus;
  startTimer(true);
  // Card bounce-in
  const crd = $('battle-card');
  crd.style.animation='none';
  requestAnimationFrame(() => crd.style.animation='card-enter .3s cubic-bezier(.34,1.56,.64,1)');
  // Skill badge overlay (small)
  showSkillTag(q.skill);
}

function showSkillTag(skill) {
  const arena = $('battle-arena'); if(!arena) return;
  const old = arena.querySelector('.skill-tag-badge');
  if (old) old.remove();
  const badge = document.createElement('div');
  badge.className = 'skill-tag-badge';
  const SKILL_COLORS = { ai:'#00e5ff', cyber:'#ff3bff', data:'#00ff88' };
  const SKILL_LABELS = { ai:'AI & ML', cyber:'CYBER', data:'DATA' };
  badge.style.color = SKILL_COLORS[skill] || '#fff';
  badge.textContent = SKILL_LABELS[skill] || skill.toUpperCase();
  arena.appendChild(badge);
}

// ─── BIND ANSWERS ───
function bindAnswers() {
  document.querySelectorAll('.bc-ans').forEach(b => {
    b.addEventListener('click', () => {
      if (b.classList.contains('eraser-eliminated')) return;
      handleAnswer(b.dataset.key);
    });
  });
}

// ─── TIMER ───
function startTimer(reset) {
  const total = state.cfg.timePerQ + state.passives.aiTimeBonus;
  if (reset) state.timeLeft = total;
  state.retryPending = false;
  clearTimer();
  if (state.focusActive) return; // focus potion pauses timer
  $('hud-timer-num').textContent = state.timeLeft;
  $('hud-timer-num').classList.remove('urgent');
  $('battle-timer-fill').classList.remove('urgent');
  document.querySelector('.timer-ring-fill')?.classList.remove('urgent');
  updateRing(state.timeLeft, total);
  $('battle-timer-fill').style.width=(state.timeLeft/total*100)+'%';

  state.timerInt = setInterval(() => {
    state.timeLeft--;
    updateRing(state.timeLeft, total);
    $('hud-timer-num').textContent = Math.max(0,state.timeLeft);
    $('battle-timer-fill').style.width=Math.max(0,state.timeLeft/total*100)+'%';
    if (state.timeLeft <= 5) {
      $('hud-timer-num').classList.add('urgent');
      $('battle-timer-fill').classList.add('urgent');
      document.querySelector('.timer-ring-fill')?.classList.add('urgent');
    }
    if (state.timeLeft <= 0) { clearTimer(); handleTimeout(); }
  }, 1000);
}
function updateRing(left, total) {
  const c = document.querySelector('.timer-ring-fill'); if(!c) return;
  c.style.strokeDashoffset = RING_C * (1 - Math.max(0,left)/total);
}
function clearTimer() { clearInterval(state.timerInt); state.timerInt=null; }

// ─── HANDLE ANSWER ───
function handleAnswer(chosen) {
  if (state.answered) return;
  const chosenBtn = document.querySelector(`.bc-ans[data-key="${chosen}"]`);
  if (chosenBtn && chosenBtn.classList.contains('eraser-eliminated')) return;
  state.answered = true;
  // Clear focus potion
  if (state.focusActive) {
    state.focusActive = false;
    if (state._focusOverlay) { state._focusOverlay.forEach(e => e.remove()); state._focusOverlay = null; }
    const fc = $('hud-timer-num'); if(fc) fc.style.color='';
    const fb = $('battle-timer-fill'); if(fb) fb.style.background='';
  }
  clearTimer();

  const q = state.questions[state.current];
  const elapsed = Date.now() - state.qStart;
  const ok = chosen === q.correct;
  state.totalMs += elapsed;

  // Log for skill XP (local)
  state.questionLog.push({ skill: q.skill, topic: q.topic, correct: ok });
  // Log for backend submission
  if (q.id) state.answerLog.push({ questionId: q.id, answer: chosen, timeTaken: elapsed });

  document.querySelectorAll('.bc-ans').forEach(b => b.disabled=true);

  setTimeout(() => {
    document.querySelectorAll('.bc-ans').forEach(b => {
      if (b.dataset.key === q.correct) b.classList.add('correct');
      if (b.dataset.key === chosen && !ok) b.classList.add('wrong');
    });

    let absorbed = false;
    if (ok) {
      state.correct++; state.streak++;
      $('hud-correct').textContent = state.correct;
      showFB('✓ CORRECT!','correct-fb');
      burstP(true);
      removeShieldOverlay();
    } else {
      // Check shield (item) or Cyber passive shield
      const shieldAbsorb = state.shieldActive || (state.passives.cyberShield && !state.passives.cyberShieldUsed);
      if (shieldAbsorb) {
        absorbed = true;
        if (state.shieldActive) { state.shieldActive = false; }
        else { state.passives.cyberShieldUsed = true; }
        removeShieldOverlay();
        showFB('🛡 ABSORBED!','correct-fb');
        // Show absorbed flash
        const af = document.createElement('div'); af.className='shield-absorb-flash';
        af.textContent='🛡 SHIELDED'; document.body.appendChild(af);
        af.addEventListener('animationend', () => af.remove());
        burstP(true);
        if (typeof BVNotify !== 'undefined') BVNotify.toast('Wrong absorbed by shield!', 'success', '🛡');
      } else {
        state.wrong++; state.streak=0;
        $('hud-wrong').textContent = state.wrong;
        showFB('✗ WRONG','wrong-fb');
        burstP(false);
        removeShieldOverlay();
      }
    }
    updateStreak();
    dotResult(state.current, ok || absorbed);
    setTimeout(advance, 1100);
  }, 300);
}

function handleTimeout() {
  if (state.answered) return;
  // Cyber Lv5: first timeout = auto-retry
  if (state.passives.cyberTimeoutRetry && !state.passives.cyberTimeoutRetryUsed) {
    state.passives.cyberTimeoutRetryUsed = true;
    state.retryPending = true;
    state.answered = false;
    if (typeof BVNotify !== 'undefined') BVNotify.toast('Cyber passive: auto-retry!', 'success', '⚡');
    startTimer(true);
    return;
  }
  state.answered=true; state.wrong++; state.streak=0;
  $('hud-wrong').textContent = state.wrong;
  updateStreak();
  const q = state.questions[state.current];
  document.querySelectorAll('.bc-ans').forEach(b => { b.disabled=true; if(b.dataset.key===q.correct) b.classList.add('reveal'); });
  showFB('⏱ TIME UP!','timeout-fb');
  dotResult(state.current, false);
  state.questionLog.push({ skill: q.skill, topic: q.topic, correct: false });
  if (q.id) state.answerLog.push({ questionId: q.id, answer: '', timeTaken: (state.cfg.timePerQ + state.passives.aiTimeBonus) * 1000 });
  setTimeout(advance, 1300);
}

function updateStreak() {
  $('streak-count').textContent = state.streak;
  $('hud-streak')?.classList.toggle('active', state.streak >= 3);
}
function showFB(txt, cls) {
  const el=$('bc-feedback'); if(!el) return;
  el.textContent=txt; el.className=`bc-feedback ${cls}`;
}
function hideFB() {
  const el=$('bc-feedback'); if(el) el.className='bc-feedback hidden';
}

// ─── ADVANCE ───
function advance() {
  state.current++;
  if (state.current >= state.cfg.totalQ) showResult();
  else loadQ();
}

// ─── RESULT ───
function showResult() {
  clearTimer();
  const avgMs = state.totalMs / Math.max(1, state.cfg.totalQ);
  const ratio  = state.correct / state.cfg.totalQ;
  let xp = 0;

  if (state.correct > 0) {
    xp = state.correct * XP.perCorrect;

    // Speed bonus only if answered something correctly AND was fast
    if (avgMs < 5000) xp += XP.speedBonus;

    // Daily completion bonus only if passed at least half
    if (state.mode === 'daily' && ratio >= 0.5) xp += XP.completion;

    // Raid clear bonus (already gated by passMark)
    if (state.mode === 'raid' && state.correct >= state.cfg.passMark) xp += XP.raidClear;

    // Perfect bonus
    if (state.correct === state.cfg.totalQ) xp += XP.perfect;

    // Apply Cyber XP passive and item multiplier
    xp = Math.round(xp * state.xpMultiplier * state.passives.cyberXP);

    // Streak bonus for Data passive
    if (state.streak >= 3) xp = Math.round(xp * state.passives.dataStreakMult);

    // Deduct Time Warp penalty: each warp skips a question at 50% XP
    xp = Math.max(0, xp - state.warpPenalty);
  }

  let title='COMPLETED!', titleClass='';
  if (state.mode==='daily') {
    if (ratio >= 0.5) { title='DAILY CLEARED!'; titleClass='cleared'; }
    else              { title='MISSION FAILED';  titleClass='lose'; }
  } else if (state.mode==='raid') {
    const pass = state.correct>=state.cfg.passMark;
    title=pass?'RAID CLEARED!':'RAID FAILED'; titleClass=pass?'cleared':'lose';
  }
  const [rank,rankCls] = ratio===1?['★ S RANK','s']:ratio>=.85?['★ A RANK','a']:ratio>=.7?['★ B RANK','b']:ratio>=.5?['★ C RANK','c']:['★ D RANK','d'];

  // S-Rank Data bonus (only if actually S rank)
  if (ratio===1 && state.passives.dataSRankBonus > 0) xp += state.passives.dataSRankBonus;

  const rankLetter = ratio===1?'S':ratio>=.85?'A':ratio>=.7?'B':ratio>=.5?'C':'D';
  const won = state.mode==='daily' ? (ratio >= 0.5) : (state.correct >= state.cfg.passMark);

  // ── Submit to backend, then save & redirect ──
  function finalize(serverXP, earnedItem) {
    const finalXP = serverXP !== null ? serverXP : xp;
    const earnedItemKey = earnedItem && typeof BVAPI !== 'undefined'
      ? BVAPI.itemNameToKey(earnedItem) : null;

    if (typeof BVUser !== 'undefined') {
      BVUser.recordBattle({
        correct:     state.correct,
        total:       state.cfg.totalQ,
        won:         won,
        earnedXP:    finalXP,
        mode:        state.mode,
        difficulty:  state.difficulty,
        rank:        rankLetter,
        questionLog: state.questionLog,
        earnedItem:  earnedItemKey,
      });
    }
    setTimeout(() => { window.location.href = 'battle-result.html'; }, 400);
  }

  if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
    const submitPromise = state.mode === 'daily'
      ? BVAPI.submitDailyQuiz(state.dailyQuizId, state.answerLog)
      : BVAPI.submitRaid(state.difficulty, state.answerLog, state.totalMs);

    submitPromise
      .then(function(res) { finalize(res.xpGained, res.earnedItem || null); })
      .catch(function()   { finalize(null, null); });
  } else {
    finalize(null, null);
  }
}

function spawnStars() {
  const w=$('result-stars'); if(!w) return; w.innerHTML='';
  const colors=['#fee783','#00ff88','#00e5ff','#ff9500'];
  for (let i=0;i<28;i++) {
    const s=document.createElement('div');
    s.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:3px;height:3px;background:${colors[0|Math.random()*4]};animation:rs-float ${1.5+Math.random()*2}s ease-in-out ${Math.random()*1.5}s infinite;opacity:0;`;
    w.appendChild(s);
  }
}

// ─── LOCK ───
function lockToMode() {
  document.body.style.overflow='hidden';
  history.pushState(null,null,window.location.href);
  window.addEventListener('popstate',()=>{ showExitModal(); history.pushState(null,null,window.location.href); });
  document.querySelectorAll('.nav-links a, .logo-left a').forEach(l => l.addEventListener('click',e=>{ e.preventDefault(); state.exitTarget=l.href; showExitModal(); }));
}
function showExitModal() { $('exit-modal').classList.remove('hidden'); }
function hideExitModal() { $('exit-modal').classList.add('hidden'); }
function bindExitModal() {
  $('btn-keep').addEventListener('click', hideExitModal);
  $('btn-leave').addEventListener('click', ()=>{ document.body.style.overflow=''; window.location.href=state.exitTarget||'battle.html'; });
}

// ─── UTILS ───
function shuffle(arr) {
  for(let i=arr.length-1;i>0;i--){const j=0|Math.random()*(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr;
}

function seededRng(seed) {
  let s = seed >>> 0;
  return function() {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

function dailyQuestions(n) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rng = seededRng(seed);
  const pool = [...ALL_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// inject result star animation
const _sty=document.createElement('style');
_sty.textContent=`
@keyframes rs-float{0%,100%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:1;transform:translateY(-10px) scale(1)}80%{opacity:.6;transform:translateY(-20px) scale(.7)}}

/* Soul Gem peek */
.bc-ans.gem-peek { background:rgba(255,59,255,.3) !important; border-color:#ff3bff !important; box-shadow:0 0 20px rgba(255,59,255,.5),0 3px 0 #660066 !important; animation:gem-glow .4s steps(2) infinite !important; }
@keyframes gem-glow { 0%,100%{box-shadow:0 0 10px rgba(255,59,255,.4)} 50%{box-shadow:0 0 24px rgba(255,59,255,.8)} }

.gem-peek-overlay {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  font-family:'Press Start 2P',monospace; font-size:0.78rem;
  color:#ff3bff; text-shadow:0 0 20px rgba(255,59,255,.8),2px 2px 0 #440044;
  pointer-events:none; z-index:20;
  animation:gem-peek-txt .4s steps(3) forwards, bvnFlicker .3s steps(2) 0.4s infinite;
}
@keyframes gem-peek-txt { from{opacity:0;transform:translate(-50%,-50%) scale(.6)} to{opacity:1;transform:translate(-50%,-60%) scale(1)} }

/* Shield overlay on card */
.shield-overlay {
  position:absolute; inset:0; z-index:8; pointer-events:none;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,255,136,.06); border:2px solid rgba(0,255,136,.4);
  animation:shield-pulse .6s steps(2) infinite;
}
@keyframes shield-pulse { 0%,100%{border-color:rgba(0,255,136,.3)} 50%{border-color:rgba(0,255,136,.7);box-shadow:inset 0 0 20px rgba(0,255,136,.1)} }
.shield-icon { font-size:2.5rem; animation:mascotBob 1s steps(4) infinite; }

/* Shield absorbed flash */
.shield-absorb-flash {
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  font-family:'Press Start 2P',monospace; font-size:clamp(.9rem,2.5vw,1.4rem);
  color:#00ff88; text-shadow:0 0 20px rgba(0,255,136,.8),4px 4px 0 #003322;
  pointer-events:none; z-index:60;
  animation:retry-pop .9s steps(6) forwards;
}

/* Time Warp flash */
.warp-flash-el {
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  font-family:'Press Start 2P',monospace; font-size:clamp(.9rem,2.5vw,1.5rem);
  color:#fee783; text-shadow:0 0 20px rgba(254,231,131,.9),4px 4px 0 #604010;
  pointer-events:none; z-index:60;
  animation:retry-pop .9s steps(6) forwards;
}

/* AI hint dim */
.bc-ans.ai-hint-dim { opacity:.35 !important; border-color:rgba(0,195,255,.15) !important; }

/* Skill tag badge */
.skill-tag-badge {
  position:absolute; top:14px; left:50%; transform:translateX(-50%);
  font-family:'Press Start 2P',monospace; font-size:clamp(.5rem,1.2vw,.7rem);
  letter-spacing:1.5px; padding:5px 16px;
  background:rgba(0,0,0,.55); border:1px solid currentColor;
  box-shadow:0 0 12px currentColor;
  z-index:3; pointer-events:none; white-space:nowrap;
  animation:skillTagPop .35s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes skillTagPop {
  from { opacity:0; transform:translateX(-50%) scale(.7); }
  to   { opacity:1; transform:translateX(-50%) scale(1); }
}

/* Battle item rarity label */
.itb-rarity { margin-bottom:3px; }
`;
document.head.appendChild(_sty);

async function loadAndInit() {
  const p = new URLSearchParams(window.location.search);
  const mode = p.get('mode') || 'daily';
  const difficulty = p.get('difficulty') || 'easy';

  try {
    if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
      if (mode === 'daily') {
        const quiz = await BVAPI.getDailyQuiz();
        if (quiz.alreadySubmitted) {
          const card = $('battle-card');
          if (card) card.innerHTML = '<div style="padding:2rem;text-align:center;color:#00ff88;font-family:\'Press Start 2P\',monospace;font-size:0.78rem;line-height:2.2">ALREADY<br>COMPLETED<br>TODAY<br><br><a href="battle.html" style="color:#fee783;text-decoration:none;font-size:0.65rem">[ BACK ]</a></div>';
          $('battle-screen').classList.remove('hidden');
          return;
        }
        state.dailyQuizId = quiz.quizId;
        ALL_QUESTIONS = quiz.questions;
      } else {
        ALL_QUESTIONS = await BVAPI.getRaidQuestions(difficulty);
      }
    } else {
      // Fallback to local questions.json
      const res = await fetch('questions.json');
      ALL_QUESTIONS = await res.json();
    }
  } catch(e) {
    ALL_QUESTIONS = [];
  }

  // Sync inventory from backend before init
  if (typeof BVAPI !== 'undefined' && BVAPI.isLoggedIn()) {
    try {
      const inv = await BVAPI.getInventory();
      if (typeof BVUser !== 'undefined') {
        const u = BVUser.load();
        u.items = Object.assign(u.items || {}, BVAPI.inventoryToLocal(inv));
        BVUser.save(u);
      }
    } catch(e) { /* use local */ }
  }

  state.battleStartMs = Date.now();
  init();
}
document.addEventListener('DOMContentLoaded', loadAndInit);
