/* ══════════════════════════════════════════
   BINUSVERSE — battle-play.js
   Mode: battle-play.html?mode=daily
         battle-play.html?mode=raid&difficulty=easy|normal|hard
         battle-play.html?mode=pvp  → shows Coming Soon
══════════════════════════════════════════ */

// ─────────────────────────────────────────
// QUESTION BANK
// ─────────────────────────────────────────
const QUESTIONS = [
  {
    text: "Apa time complexity dari Binary Search?",
    opts: { A: "O(n)", B: "O(log n)", C: "O(n²)", D: "O(1)" },
    correct: "B",
  },
  {
    text: "Struktur data mana yang menggunakan prinsip LIFO?",
    opts: { A: "Queue", B: "Linked List", C: "Stack", D: "Tree" },
    correct: "C",
  },
  {
    text: "Dalam OOP, apa yang dimaksud dengan Encapsulation?",
    opts: {
      A: "Mewarisi sifat dari class lain",
      B: "Menyembunyikan detail internal dan hanya expose interface",
      C: "Mengizinkan satu fungsi bekerja di banyak tipe data",
      D: "Membuat banyak implementasi dari satu interface",
    },
    correct: "B",
  },
  {
    text: "Sorting algorithm mana yang memiliki worst-case O(n log n)?",
    opts: {
      A: "Bubble Sort",
      B: "Insertion Sort",
      C: "Quick Sort",
      D: "Merge Sort",
    },
    correct: "D",
  },
  {
    text: "Apa yang terjadi jika rekursi tidak memiliki base case?",
    opts: {
      A: "Return null",
      B: "Stack Overflow",
      C: "Infinite loop di heap",
      D: "Compile error",
    },
    correct: "B",
  },
  {
    text: "Perbedaan BFS dan DFS pada graph?",
    opts: {
      A: "BFS pakai stack, DFS pakai queue",
      B: "BFS pakai queue, DFS pakai stack",
      C: "Keduanya pakai queue",
      D: "Keduanya pakai stack",
    },
    correct: "B",
  },
  {
    text: "Fungsi Primary Key dalam database relasional?",
    opts: {
      A: "Mengenkripsi data",
      B: "Menghubungkan dua tabel",
      C: "Mengidentifikasi setiap row secara unik",
      D: "Menyimpan foreign key",
    },
    correct: "C",
  },
  {
    text: "HTTP method yang digunakan untuk UPDATE data?",
    opts: { A: "GET", B: "POST", C: "DELETE", D: "PUT" },
    correct: "D",
  },
  {
    text: "Apa yang dimaksud dengan Deadlock dalam OS?",
    opts: {
      A: "Program crash karena memory leak",
      B: "Dua proses saling menunggu resource yang dipegang satu sama lain",
      C: "CPU usage mencapai 100%",
      D: "Thread berjalan terlalu lambat",
    },
    correct: "B",
  },
  {
    text: "Fungsi validation set dalam machine learning?",
    opts: {
      A: "Melatih model",
      B: "Menguji performa final model",
      C: "Tune hyperparameter dan mencegah overfitting",
      D: "Normalisasi data input",
    },
    correct: "C",
  },
  {
    text: "Apa itu polymorphism dalam OOP?",
    opts: {
      A: "Satu class memiliki banyak constructor",
      B: "Satu interface dapat memiliki banyak implementasi",
      C: "Class mewarisi seluruh property parent",
      D: "Object tidak bisa dimodifikasi setelah dibuat",
    },
    correct: "B",
  },
  {
    text: "Apa output dari fungsi berikut: f(n) = f(n-1) + f(n-2), f(0)=0, f(1)=1, f(5)?",
    opts: { A: "5", B: "6", C: "7", D: "8" },
    correct: "A",
  },
];

const RAID_STYLE = {
  easy: {
    bg: "url('assets/images/ez.png')",
    border: "#00ff88",
    shadow: "#005c28",
  },
  normal: {
    bg: "url('assets/images/mid.png')",
    border: "#ffd000",
    shadow: "#664d00",
  },
  hard: {
    bg: "url('assets/images/angel.png')",
    border: "#ff2a2a",
    shadow: "#660000",
  },
};

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────
const CONFIG = {
  daily: { totalQ: 10, timePerQ: 15, passMark: 0 },
  raid: {
    easy: {
      totalQ: 8,
      timePerQ: 25,
      passMark: 5,
      diffClass: "easy-text",
      label: "Easy",
    },
    normal: {
      totalQ: 10,
      timePerQ: 15,
      passMark: 7,
      diffClass: "mid-text",
      label: "Normal",
    },
    hard: {
      totalQ: 12,
      timePerQ: 8,
      passMark: 9,
      diffClass: "hard-text",
      label: "Hard",
    },
  },
};

const XP = {
  perCorrect: 10,
  speedBonus: 5, // jawab < 5 detik
  completion: 20, // daily selesai
  raidClear: 40, // raid berhasil
  perfect: 50, // semua benar
};

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const state = {
  mode: "daily",
  difficulty: "easy",
  cfg: null,
  questions: [],
  current: 0,
  correct: 0,
  wrong: 0,
  totalMs: 0,
  qStart: 0,
  answered: false,
  timerInt: null,
  timeLeft: 15,
  exitTarget: "battle.html",
};

// ─────────────────────────────────────────
// DOM HELPERS
// ─────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// Ambil semua tombol jawaban untuk mode tertentu
function getButtons(mode) {
  const rowId = mode === "daily" ? "daily-answers" : "raid-answers";
  return document.querySelectorAll(`#${rowId} .ans-btn`);
}

function lockToMode() {
  ["pvp-section", "daily-section", "raid-section"].forEach((id) => {
    if (id !== `${state.mode}-section`) {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    }
  });
  document
    .querySelectorAll(".divider")
    .forEach((d) => (d.style.display = "none"));
  const header = document.querySelector(".battle-header");
  const footer = document.querySelector(".footer-hero");
  if (header) header.style.display = "none";
  if (footer) footer.style.display = "none";
  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";

  history.pushState(null, null, window.location.href);
  window.addEventListener("popstate", () => {
    showExitModal();
    history.pushState(null, null, window.location.href);
  });
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      state.exitTarget = link.href;
      showExitModal();
    });
  });
}

function showExitModal() {
  $("exit-modal").classList.remove("hidden");
}
function hideExitModal() {
  $("exit-modal").classList.add("hidden");
}

function bindExitModal() {
  $("btn-keep").addEventListener("click", hideExitModal);
  $("btn-leave").addEventListener("click", () => {
    document.body.style.overflow = "";
    window.location.href = state.exitTarget || "battle.html";
  });
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
function init() {
  // Hamburger
  const hamburger = $("hamburger");
  const navLinks = $("navLinks");
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Baca URL params
  const params = new URLSearchParams(window.location.search);
  state.mode = params.get("mode") || "daily";
  state.difficulty = params.get("difficulty") || "easy";

  // Set config
  if (state.mode === "raid") {
    state.cfg = CONFIG.raid[state.difficulty];
    // Update difficulty label di panel
    const lbl = $("raid-diff-label");
    lbl.textContent = state.cfg.label;
    lbl.className = `raid-difficulty ${state.cfg.diffClass}`;

    const panel = document.querySelector(".raid-panel");
    const style = RAID_STYLE[state.difficulty];
    panel.style.backgroundImage = style.bg;
    panel.style.borderColor = style.border;
    panel.style.boxShadow = `5px 5px 0 ${style.shadow}, 10px 10px 0 rgba(0,0,0,0.35)`;
  } else if (state.mode === "daily") {
    state.cfg = CONFIG.daily;
  }

  // Scroll ke section yang relevan
  if (state.mode === "daily") {
    scrollToSection("daily-section");
  } else if (state.mode === "raid") {
    scrollToSection("raid-section");
  }
  // PvP: already has "Coming Soon" overlay, tidak ada logic

  // Mulai game untuk mode yang aktif
  if (state.mode === "daily" || state.mode === "raid") {
    state.questions = shuffle([...QUESTIONS]).slice(0, state.cfg.totalQ);
    loadQuestion();
    bindAnswers();
    lockToMode();
    bindExitModal();
  }
}

// ─────────────────────────────────────────
// SCROLL HELPER
// ─────────────────────────────────────────
function scrollToSection(id) {
  setTimeout(() => {
    const el = $(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 400);
}

// ─────────────────────────────────────────
// BIND ANSWER BUTTONS
// ─────────────────────────────────────────
function bindAnswers() {
  getButtons(state.mode).forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(btn.dataset.key));
  });
}

// ─────────────────────────────────────────
// LOAD QUESTION
// ─────────────────────────────────────────
function loadQuestion() {
  const q = state.questions[state.current];
  const mode = state.mode;

  state.answered = false;
  state.qStart = Date.now();

  const qNumId = mode === "daily" ? "daily-q-number" : "raid-q-number";
  const qTextId = mode === "daily" ? "daily-q-text" : "raid-q-text";

  $(qNumId).textContent =
    `Question #${state.current + 1} / ${state.cfg.totalQ}`;
  $(qTextId).textContent = q.text;

  // Update tombol jawaban
  const btns = getButtons(mode);
  const keys = ["A", "B", "C", "D"];
  btns.forEach((btn, i) => {
    const key = keys[i];
    btn.dataset.key = key;
    btn.textContent = `(${key}) ${q.opts[key]}`;
    btn.className = "ans-btn";
    btn.disabled = false;
  });

  // Reset & mulai timer
  clearTimer();
  startTimer();
}

// ─────────────────────────────────────────
// TIMER
// ─────────────────────────────────────────
function startTimer() {
  const total = state.cfg.timePerQ;
  state.timeLeft = total;
  const timerId = state.mode === "daily" ? "daily-timer" : "raid-timer";
  const timerEl = $(timerId);
  timerEl.style.width = "100%";
  timerEl.className = "timer-fill";

  state.timerInt = setInterval(() => {
    state.timeLeft--;
    const pct = (state.timeLeft / total) * 100;
    timerEl.style.width = `${Math.max(0, pct)}%`;

    if (state.timeLeft <= 5) timerEl.classList.add("urgent");
    if (state.timeLeft <= 0) {
      clearTimer();
      handleTimeout();
    }
  }, 1000);
}

function clearTimer() {
  clearInterval(state.timerInt);
  state.timerInt = null;
}

// ─────────────────────────────────────────
// HANDLE ANSWER
// ─────────────────────────────────────────
function handleAnswer(chosen) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();

  const q = state.questions[state.current];
  const elapsed = Date.now() - state.qStart;
  const isCorrect = chosen === q.correct;

  state.totalMs += elapsed;
  if (isCorrect) state.correct++;
  else state.wrong++;

  // Visual feedback
  // Ganti bagian visual feedback + setTimeout advance:
  getButtons(state.mode).forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.key === chosen) btn.classList.add("selected");
  });

  setTimeout(() => {
    getButtons(state.mode).forEach((btn) => {
      if (btn.dataset.key === q.correct) btn.classList.add("correct");
      if (btn.dataset.key === chosen && !isCorrect) btn.classList.add("wrong");
      btn.classList.remove("selected");
    });
    setTimeout(advance, 1000);
  }, 700);
}

function handleTimeout() {
  if (state.answered) return;
  state.answered = true;
  state.wrong++;

  const q = state.questions[state.current];
  getButtons(state.mode).forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.key === q.correct) btn.classList.add("reveal");
  });

  setTimeout(advance, 1300);
}

// ─────────────────────────────────────────
// ADVANCE
// ─────────────────────────────────────────
function advance() {
  state.current++;
  if (state.current >= state.cfg.totalQ) showResult();
  else loadQuestion();
}

// ─────────────────────────────────────────
// SHOW RESULT
// ─────────────────────────────────────────
function showResult() {
  clearTimer();

  let title = "COMPLETED!";
  let titleClass = "";

  if (state.mode === "raid") {
    const pass = state.correct >= state.cfg.passMark;
    title = pass ? "RAID CLEARED!" : "RAID FAILED";
    titleClass = pass ? "cleared" : "lose";
  }

  // XP
  const avgMs = state.totalMs / state.cfg.totalQ;
  let xp = state.correct * XP.perCorrect;
  if (avgMs < 5000) xp += XP.speedBonus;
  if (state.mode === "daily") xp += XP.completion;
  if (state.mode === "raid" && state.correct >= state.cfg.passMark)
    xp += XP.raidClear;
  if (state.correct === state.cfg.totalQ) xp += XP.perfect;

  // Isi result card
  const titleEl = $("result-title");
  titleEl.textContent = title;
  titleEl.className = `result-title ${titleClass}`;

  $("res-correct").textContent = state.correct;
  $("res-wrong").textContent = state.wrong;
  $("res-time").textContent = `${(avgMs / 1000).toFixed(1)}s`;
  $("res-xp").textContent = `+${xp} XP`;

  // Tampilkan overlay
  $("result-overlay").classList.remove("hidden");
}

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
