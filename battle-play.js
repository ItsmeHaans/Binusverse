/* ══════════════════════════════════════════
   BINUSVERSE — battle-play.js  (Redesigned)
   Mode: ?mode=daily | ?mode=raid&difficulty=easy|normal|hard
══════════════════════════════════════════ */

// ─── QUESTION BANK ───
const QUESTIONS = [
  { text:"Apa time complexity dari Binary Search?", opts:{A:"O(n)",B:"O(log n)",C:"O(n²)",D:"O(1)"}, correct:"B" },
  { text:"Struktur data mana yang menggunakan prinsip LIFO?", opts:{A:"Queue",B:"Linked List",C:"Stack",D:"Tree"}, correct:"C" },
  { text:"Dalam OOP, apa yang dimaksud dengan Encapsulation?", opts:{A:"Mewarisi sifat dari class lain",B:"Menyembunyikan detail internal dan hanya expose interface",C:"Mengizinkan satu fungsi bekerja di banyak tipe data",D:"Membuat banyak implementasi dari satu interface"}, correct:"B" },
  { text:"Sorting algorithm mana yang memiliki worst-case O(n log n)?", opts:{A:"Bubble Sort",B:"Insertion Sort",C:"Quick Sort",D:"Merge Sort"}, correct:"D" },
  { text:"Apa yang terjadi jika rekursi tidak memiliki base case?", opts:{A:"Return null",B:"Stack Overflow",C:"Infinite loop di heap",D:"Compile error"}, correct:"B" },
  { text:"Perbedaan BFS dan DFS pada graph?", opts:{A:"BFS pakai stack, DFS pakai queue",B:"BFS pakai queue, DFS pakai stack",C:"Keduanya pakai queue",D:"Keduanya pakai stack"}, correct:"B" },
  { text:"Fungsi Primary Key dalam database relasional?", opts:{A:"Mengenkripsi data",B:"Menghubungkan dua tabel",C:"Mengidentifikasi setiap row secara unik",D:"Menyimpan foreign key"}, correct:"C" },
  { text:"HTTP method yang digunakan untuk UPDATE data?", opts:{A:"GET",B:"POST",C:"DELETE",D:"PUT"}, correct:"D" },
  { text:"Apa yang dimaksud dengan Deadlock dalam OS?", opts:{A:"Program crash karena memory leak",B:"Dua proses saling menunggu resource yang dipegang satu sama lain",C:"CPU usage mencapai 100%",D:"Thread berjalan terlalu lambat"}, correct:"B" },
  { text:"Fungsi validation set dalam machine learning?", opts:{A:"Melatih model",B:"Menguji performa final model",C:"Tune hyperparameter dan mencegah overfitting",D:"Normalisasi data input"}, correct:"C" },
  { text:"Apa itu polymorphism dalam OOP?", opts:{A:"Satu class memiliki banyak constructor",B:"Satu interface dapat memiliki banyak implementasi",C:"Class mewarisi seluruh property parent",D:"Object tidak bisa dimodifikasi setelah dibuat"}, correct:"B" },
  { text:"Apa output dari fungsi berikut: f(n)=f(n-1)+f(n-2), f(0)=0, f(1)=1, f(5)?", opts:{A:"5",B:"6",C:"7",D:"8"}, correct:"A" },
];

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

const ITEMS = {
  eraser: { name:"Phantom Eraser", color:"#ff9500" },
  freeze: { name:"Time Freeze Orb", color:"#c084fc" },
  retry:  { name:"2nd Chance Scroll", color:"#00e5ff" },
  xp:     { name:"XP Magnet", color:"#00ff88" },
};

const state = {
  mode:"daily", difficulty:"easy", cfg:null,
  questions:[], current:0, correct:0, wrong:0,
  totalMs:0, qStart:0, answered:false,
  timerInt:null, timeLeft:15, streak:0,
  exitTarget:"battle.html",
  items:{ eraser:1, freeze:1, retry:2, xp:1 },
  xpMultiplier:1, retryPending:false,
};

const $ = id => document.getElementById(id);
const RING_C = 213.6; // 2π×34

// ═══════════════ PARTICLES ═══════════════
let pCtx = null, ptcls = [];
function initParticles() {
  const cvs = $('arenaParticles');
  if (!cvs) return;
  pCtx = cvs.getContext('2d');
  function resize() { cvs.width = cvs.offsetWidth; cvs.height = cvs.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  // seed ambient particles
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
    if (p.burst) {
      p.x += p.vx; p.y += p.vy; p.life--; p.a *= 0.96;
    } else {
      p.y += p.vy;
      if (p.y < -4) { p.y = cvs.height + 4; p.x = Math.random()*cvs.width; }
    }
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
    ptcls.push({
      x:cx, y:cy, r:2,
      vx:Math.cos(a)*(2+Math.random()*3),
      vy:Math.sin(a)*(2+Math.random()*3),
      a:0.9, color:good?'#00ff88':'#ff4d4d',
      burst:true, life:45,
    });
  }
}

// ═══════════════ INIT ═══════════════
function init() {
  const ham = $('hamburger');
  if (ham) ham.addEventListener('click', () => $('navLinks').classList.toggle('active'));

  const p = new URLSearchParams(window.location.search);
  state.mode       = p.get('mode')       || 'daily';
  state.difficulty = p.get('difficulty') || 'easy';

  if (state.mode === 'daily')       state.cfg = CONFIG.daily;
  else if (state.mode === 'raid')   state.cfg = CONFIG.raid[state.difficulty];
  else return; // PvP

  state.questions = shuffle([...QUESTIONS]).slice(0, state.cfg.totalQ);

  $('battle-screen').classList.remove('hidden');
  ['pvp-section','daily-section','raid-section'].forEach(id => { const e=$(id); if(e) e.style.display='none'; });

  // Mode badge
  const badge = $('hud-mode-badge');
  if (state.mode === 'daily') {
    badge.textContent = '📅 DAILY MISSION';
    badge.style.cssText += ';border-color:rgba(0,229,255,.3);color:#00e5ff;';
  } else {
    const rs = RAID_STYLE[state.difficulty];
    badge.textContent = '⚔ RAID — ' + rs.label;
    badge.style.cssText += `;border-color:${rs.border}55;color:${rs.border};`;
    $('battle-card').style.borderColor = rs.border;
    $('battle-card').style.boxShadow = `0 0 40px ${rs.border}18,6px 6px 0 ${rs.shadow}`;
    const db = $('bc-diff-badge');
    db.textContent = rs.label;
    db.className = `bc-diff-badge ${rs.diffClass}`;
    db.classList.remove('hidden');
  }

  buildDots();
  initItems();
  loadQ();
  bindAnswers();
  initParticles();
  lockToMode();
  bindExitModal();
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
function initItems() {
  Object.keys(ITEMS).forEach(k => {
    const slot = $(`item-${k}`);
    if (slot) slot.addEventListener('click', () => useItem(k));
    refreshItem(k);
  });
}
function refreshItem(k) {
  const c = $(`${k}-count`); if(c) c.textContent=`×${state.items[k]}`;
  const s = $(`item-${k}`); if(s) s.classList.toggle('used', state.items[k]<=0);
}
function useItem(k) {
  if (state.items[k] <= 0) return;
  if (state.answered && k !== 'retry') return;
  state.items[k]--;
  refreshItem(k);
  flashItem(ITEMS[k].name);

  if (k === 'eraser') {
    const q = state.questions[state.current]; let n = 0;
    document.querySelectorAll('.bc-ans').forEach(b => {
      if (b.dataset.key !== q.correct && n < 2) { b.style.opacity='.18'; b.style.pointerEvents='none'; n++; }
    });
  } else if (k === 'freeze') {
    state.timeLeft = Math.min(state.timeLeft+10, state.cfg.timePerQ);
    updateRing(state.timeLeft, state.cfg.timePerQ);
    $('hud-timer-num').textContent = state.timeLeft;
    $('battle-timer-fill').style.width = (state.timeLeft/state.cfg.timePerQ*100)+'%';
  } else if (k === 'retry') {
    if (!state.answered) return;
    state.answered = false;
    state.wrong = Math.max(0, state.wrong-1);
    $('hud-wrong').textContent = state.wrong;
    document.querySelectorAll('.bc-ans').forEach(b => {
      b.disabled=false; b.className='bc-ans'; b.style.opacity=''; b.style.pointerEvents='';
    });
    hideFB();
    state.retryPending = true;
    startTimer();
  } else if (k === 'xp') {
    state.xpMultiplier = 1.5;
  }
}
function flashItem(name) {
  const el = $('item-use-flash'); if(!el) return;
  el.textContent = `✦ ${name} ACTIVATED!`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 700);
}

// ─── LOAD QUESTION ───
function loadQ() {
  const q = state.questions[state.current];
  state.answered = false; state.qStart = Date.now(); state.xpMultiplier = 1;
  $('bc-q-num').textContent = `QUESTION ${state.current+1} / ${state.cfg.totalQ}`;
  $('bc-q-text').textContent = q.text;
  ['A','B','C','D'].forEach(k => {
    const b = document.querySelector(`.bc-ans[data-key="${k}"]`);
    if (!b) return;
    b.className='bc-ans'; b.disabled=false; b.style.opacity=''; b.style.pointerEvents='';
    $(`ans-${k}`).textContent = q.opts[k];
  });
  hideFB();
  clearTimer();
  startTimer();
  // card bounce-in
  const card = $('battle-card');
  card.style.animation='none';
  requestAnimationFrame(() => card.style.animation='card-enter .3s cubic-bezier(.34,1.56,.64,1)');
}

// ─── BIND ANSWERS ───
function bindAnswers() {
  document.querySelectorAll('.bc-ans').forEach(b => b.addEventListener('click', () => handleAnswer(b.dataset.key)));
}

// ─── TIMER ───
function startTimer() {
  const total = state.cfg.timePerQ;
  if (!state.retryPending) state.timeLeft = total;
  state.retryPending = false;
  clearTimer();
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
  state.answered = true;
  clearTimer();

  const q = state.questions[state.current];
  const elapsed = Date.now() - state.qStart;
  const ok = chosen === q.correct;
  state.totalMs += elapsed;

  document.querySelectorAll('.bc-ans').forEach(b => b.disabled=true);

  setTimeout(() => {
    document.querySelectorAll('.bc-ans').forEach(b => {
      if (b.dataset.key === q.correct) b.classList.add('correct');
      if (b.dataset.key === chosen && !ok) b.classList.add('wrong');
    });
    if (ok) {
      state.correct++; state.streak++;
      $('hud-correct').textContent = state.correct;
      showFB('✓ CORRECT!','correct-fb');
      burstP(true);
    } else {
      state.wrong++; state.streak=0;
      $('hud-wrong').textContent = state.wrong;
      showFB('✗ WRONG','wrong-fb');
      burstP(false);
    }
    updateStreak();
    dotResult(state.current, ok);
    setTimeout(advance, 1100);
  }, 300);
}
function handleTimeout() {
  if (state.answered) return;
  state.answered=true; state.wrong++; state.streak=0;
  $('hud-wrong').textContent = state.wrong;
  updateStreak();
  const q = state.questions[state.current];
  document.querySelectorAll('.bc-ans').forEach(b => { b.disabled=true; if(b.dataset.key===q.correct) b.classList.add('reveal'); });
  showFB('⏱ TIME UP!','timeout-fb');
  dotResult(state.current, false);
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
  const avgMs = state.totalMs / state.cfg.totalQ;
  let xp = state.correct * XP.perCorrect;
  if (avgMs < 5000) xp += XP.speedBonus;
  if (state.mode==='daily') xp += XP.completion;
  if (state.mode==='raid' && state.correct>=state.cfg.passMark) xp += XP.raidClear;
  if (state.correct===state.cfg.totalQ) xp += XP.perfect;
  xp = Math.round(xp * state.xpMultiplier);

  let title='COMPLETED!', titleClass='';
  if (state.mode==='raid') {
    const pass = state.correct>=state.cfg.passMark;
    title=pass?'RAID CLEARED!':'RAID FAILED'; titleClass=pass?'cleared':'lose';
  }
  const ratio = state.correct/state.cfg.totalQ;
  const [rank,rankCls] = ratio===1?['★ S RANK','s']:ratio>=.85?['★ A RANK','a']:ratio>=.7?['★ B RANK','b']:ratio>=.5?['★ C RANK','c']:['★ D RANK','d'];

  const te=$('result-title'); te.textContent=title; te.className=`result-title ${titleClass}`;
  const rb=$('result-rank-badge'); rb.textContent=rank; rb.className=`result-rank-badge ${rankCls}`;
  $('res-correct').textContent=state.correct;
  $('res-wrong').textContent=state.wrong;
  $('res-time').textContent=`${(avgMs/1000).toFixed(1)}s`;
  $('res-xp').textContent=`+${xp} XP`;
  spawnStars();
  $('result-overlay').classList.remove('hidden');
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
  document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click',e=>{ e.preventDefault(); state.exitTarget=l.href; showExitModal(); }));
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

// inject result star animation
const _sty=document.createElement('style');
_sty.textContent='@keyframes rs-float{0%,100%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:1;transform:translateY(-10px) scale(1)}80%{opacity:.6;transform:translateY(-20px) scale(.7)}}';
document.head.appendChild(_sty);

document.addEventListener('DOMContentLoaded', init);