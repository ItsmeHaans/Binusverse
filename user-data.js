/* ═══════════════════════════════════════════════════════
   BINUSVERSE — user-data.js  v2
   localStorage singleton. Include BEFORE page scripts.
   Usage: BVUser.load() / BVUser.save(u) / BVUser.recordBattle({...}) / BVUser.reset()
═══════════════════════════════════════════════════════ */
(function (global) {

  var KEY = 'bv_user_v1';

  /* ── Rank thresholds ── */
  var RANKS = [
    [100,      'Bronze'],
    [500,      'Silver'],
    [1200,     'Gold'],
    [2500,     'Platinum'],
    [4500,     'Diamond'],
    [7000,     'Legend'],
    [Infinity, 'Legend'],
  ];

  /* ── All 28 battle items ── */
  var ALL_ITEMS = [
    'eraser','freeze','retry','xp','shield','gem','warp','focus',
    'mirror','storm','oracle','vortex','prism','nova','echo',
    'compass','anchor','lantern','tome','cipher',
    'dust','coin','badge','rune','glitch',
    'pouch','scroll','spark',
  ];

  /* ── Default fresh-user state (all zeros) ── */
  var DEFAULT = {
    name:          'Explorer',
    level:         1,
    totalXP:       0,
    xpProgress:    0,
    rank:          'Unranked',
    streak:        0,
    lastBattleDate: null,
    totalBattles:  0,
    totalWins:     0,
    totalLosses:   0,
    winRate:       0,

    /* 3 main skills: 0–100 each */
    skills: { ai: 0, cyber: 0, data: 0 },

    /* 6 topics: 0–100 mastery each */
    topics: {
      algorithms:        0,
      oop:               0,
      aiFundamentals:    0,
      dynamicProgramming:0,
      graphTheory:       0,
      recursion:         0,
    },

    /* 28 battle items — stock count */
    items: {
      eraser:0, freeze:0, retry:0, xp:0, shield:0, gem:0, warp:0, focus:0,
      mirror:0, storm:0, oracle:0, vortex:0, prism:0, nova:0, echo:0,
      compass:0, anchor:0, lantern:0, tome:0, cipher:0,
      dust:0, coin:0, badge:0, rune:0, glitch:0,
      pouch:0, scroll:0, spark:0,
    },

    /* tracks which item keys have ever been earned (for collection page) */
    discoveredItems: [],

    weeklyXP:           [0, 0, 0, 0, 0, 0],
    weeklyWinRate:      [0, 0, 0, 0, 0, 0],
    dailyCompletedDate: null,
    lastResult:         null,
  };

  /* ── Helpers ── */
  function computeRank(totalXP) {
    for (var i = 0; i < RANKS.length; i++) {
      if (totalXP < RANKS[i][0]) return RANKS[i][1];
    }
    return 'Legend';
  }

  /**
   * getSkillLevel(skillXP) → 1–5
   * Lv1: 0–19  Lv2: 20–39  Lv3: 40–59  Lv4: 60–79  Lv5: 80–100
   */
  function getSkillLevel(xp) {
    return Math.min(5, Math.floor((xp || 0) / 20) + 1);
  }

  /**
   * getSkillPassive(skill, level) → description string
   */
  var SKILL_PASSIVES = {
    ai: [
      '',
      'Lv1: No passive yet',
      'Lv2: +2s timer per question',
      'Lv3: +2s timer + 1 wrong answer dimmed as hint',
      'Lv4: +4s timer + 1 wrong answer dimmed',
      'Lv5: +4s timer + 2 wrong answers dimmed',
    ],
    cyber: [
      '',
      'Lv1: No passive yet',
      'Lv2: +10% XP from every answer',
      'Lv3: +10% XP + first wrong = no penalty',
      'Lv4: +15% XP + first wrong = no penalty',
      'Lv5: +15% XP + first timeout = auto-retry',
    ],
    data: [
      '',
      'Lv1: No passive yet',
      'Lv2: Streak XP bonus ×1.2',
      'Lv3: Streak XP bonus ×1.2 + answer log shown',
      'Lv4: Streak XP bonus ×1.5 + item reward ×2',
      'Lv5: Streak XP bonus ×1.5 + item reward ×2 + S-Rank +30 XP',
    ],
  };

  function getSkillPassive(skill, level) {
    var arr = SKILL_PASSIVES[skill];
    if (!arr) return '';
    return arr[Math.min(level, arr.length - 1)] || '';
  }

  /**
   * getStrongestTopic(u) → { name, value } or null
   */
  function getStrongestTopic(u) {
    var best = null, bestVal = -1;
    Object.keys(u.topics).forEach(function(k) {
      if (u.topics[k] > bestVal) { bestVal = u.topics[k]; best = k; }
    });
    return best ? { key: best, name: _topicLabel(best), value: bestVal } : null;
  }

  function getWeakestTopic(u) {
    var worst = null, worstVal = 101;
    Object.keys(u.topics).forEach(function(k) {
      if (u.topics[k] < worstVal) { worstVal = u.topics[k]; worst = k; }
    });
    return worst ? { key: worst, name: _topicLabel(worst), value: worstVal } : null;
  }

  function getOverallMastery(u) {
    var total = 0, count = 0;
    Object.keys(u.topics).forEach(function(k) { total += u.topics[k]; count++; });
    return count ? Math.round(total / count) : 0;
  }

  var TOPIC_LABELS = {
    algorithms:         'Algorithms',
    oop:                'OOP',
    aiFundamentals:     'AI Fundamentals',
    dynamicProgramming: 'Dynamic Programming',
    graphTheory:        'Graph Theory',
    recursion:          'Recursion',
  };
  function _topicLabel(k) { return TOPIC_LABELS[k] || k; }

  /* ── load / save / reset ── */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULT);
      var saved = JSON.parse(raw);
      var merged = Object.assign({}, DEFAULT, saved);
      merged.skills         = Object.assign({}, DEFAULT.skills,  saved.skills  || {});
      merged.topics         = Object.assign({}, DEFAULT.topics,  saved.topics  || {});
      merged.items          = Object.assign({}, DEFAULT.items,   saved.items   || {});
      merged.discoveredItems = Array.isArray(saved.discoveredItems) ? saved.discoveredItems.slice() : [];
      return merged;
    } catch (e) {
      return Object.assign({}, DEFAULT);
    }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return Object.assign({}, DEFAULT);
  }

  /* ─────────────────────────────────────────────────────
     recordBattle — call after every battle session
     params: {
       correct, total, won, earnedXP, mode,
       questionLog: [{skill:'ai'|'cyber'|'data', topic:'algorithms'|..., correct:bool}]
     }
     returns: updated user object
  ───────────────────────────────────────────────────── */
  function recordBattle(params) {
    var correct     = params.correct     || 0;
    var total       = params.total       || 1;
    var won         = params.won         || false;
    var earnedXP    = params.earnedXP    || 0;
    var mode        = params.mode        || 'daily';
    var difficulty  = params.difficulty  || null;
    var battleRank  = params.rank        || 'D';
    var questionLog = params.questionLog || [];

    var u = load();

    /* snapshot before changes for lastResult diff */
    var levelBefore = u.level || 1;
    var rankBefore  = u.rank  || 'Unranked';

    /* battles & record */
    u.totalBattles++;
    if (won) u.totalWins++; else u.totalLosses++;
    u.winRate = u.totalBattles > 0
      ? Math.round((u.totalWins / u.totalBattles) * 100) : 0;

    /* streak */
    var today     = new Date().toDateString();
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (u.lastBattleDate !== today) {
      u.streak = (u.lastBattleDate === yesterday) ? (u.streak + 1) : 1;
      u.lastBattleDate = today;
    }

    /* streak XP multiplier */
    var streakMult = 1.0;
    if (u.streak >= 14) streakMult = 1.3;
    else if (u.streak >= 7) streakMult = 1.2;
    else if (u.streak >= 3) streakMult = 1.1;
    earnedXP = Math.round(earnedXP * streakMult);

    /* XP & level */
    u.totalXP    = (u.totalXP || 0) + earnedXP;
    u.level      = Math.floor(u.totalXP / 100) + 1;
    u.xpProgress = u.totalXP % 100;
    u.rank       = computeRank(u.totalXP);

    /* skills gain from question log (tagged per question) */
    var skillGains = { ai: 0, cyber: 0, data: 0 };
    if (questionLog.length > 0) {
      questionLog.forEach(function(q) {
        if (q.skill && skillGains.hasOwnProperty(q.skill)) {
          var gain = q.correct ? Math.floor(4 + Math.random() * 4) : Math.floor(1 + Math.random() * 2);
          skillGains[q.skill] += gain;
        }
      });
    } else {
      /* fallback: distribute equally based on accuracy */
      var acc = correct / total;
      ['ai', 'cyber', 'data'].forEach(function(k) {
        skillGains[k] = Math.floor(acc * 6 * (0.5 + Math.random() * 0.8));
      });
    }
    ['ai', 'cyber', 'data'].forEach(function(k) {
      u.skills[k] = Math.min(100, (u.skills[k] || 0) + skillGains[k]);
    });

    /* topic mastery from question log */
    if (questionLog.length > 0) {
      questionLog.forEach(function(q) {
        if (q.topic && u.topics.hasOwnProperty(q.topic)) {
          var gain = q.correct ? Math.floor(5 + Math.random() * 8) : Math.floor(1 + Math.random() * 3);
          u.topics[q.topic] = Math.min(100, (u.topics[q.topic] || 0) + gain);
        }
      });
    } else {
      /* fallback */
      var acc2 = correct / total;
      var topicKeys   = Object.keys(u.topics);
      var gainTopics  = Math.max(1, Math.ceil(acc2 * 3));
      for (var i = 0; i < gainTopics; i++) {
        var t = topicKeys[Math.floor(Math.random() * topicKeys.length)];
        u.topics[t] = Math.min(100, (u.topics[t] || 0) + Math.floor(acc2 * 10));
      }
    }

    /* daily completion */
    if (mode === 'daily') {
      u.dailyCompletedDate = new Date().toDateString();
    }

    /* item reward on win — Data Lv4+ doubles chance */
    var earnedItem = null;
    var dataLv = getSkillLevel(u.skills.data);
    var itemChance = (won) ? (dataLv >= 4 ? 0.85 : 0.6) : 0.15;
    if (Math.random() < itemChance) {
      var itemPool = ALL_ITEMS;
      earnedItem = itemPool[Math.floor(Math.random() * itemPool.length)];
      u.items[earnedItem] = (u.items[earnedItem] || 0) + 1;
      /* track discovery */
      if (!Array.isArray(u.discoveredItems)) u.discoveredItems = [];
      if (u.discoveredItems.indexOf(earnedItem) === -1) {
        u.discoveredItems.push(earnedItem);
      }
    }

    /* weekly data */
    u.weeklyXP      = u.weeklyXP      || [0,0,0,0,0,0];
    u.weeklyWinRate = u.weeklyWinRate || [0,0,0,0,0,0];
    u.weeklyXP[5]      = (u.weeklyXP[5] || 0) + earnedXP;
    u.weeklyWinRate[5] = u.winRate;

    /* last result — full snapshot for battle-result.html */
    u.lastResult = {
      correct:     correct,
      total:       total,
      won:         won,
      earnedXP:    earnedXP,
      mode:        mode,
      difficulty:  difficulty,
      rank:        battleRank,
      earnedItem:  earnedItem,
      levelBefore: levelBefore,
      levelAfter:  u.level,
      rankBefore:  rankBefore,
      rankAfter:   u.rank,
    };

    save(u);
    return u;
  }

  /* ── Export ── */
  global.BVUser = {
    load:             load,
    save:             save,
    reset:            reset,
    recordBattle:     recordBattle,
    computeRank:      computeRank,
    getSkillLevel:    getSkillLevel,
    getSkillPassive:  getSkillPassive,
    getStrongestTopic:getStrongestTopic,
    getWeakestTopic:  getWeakestTopic,
    getOverallMastery:getOverallMastery,
    ALL_ITEMS:        ALL_ITEMS,
  };

})(window);
