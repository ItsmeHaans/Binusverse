# BINUSVERSE — Complete System Design Bible
**Date:** 2026-05-20  
**Type:** Frontend-only prototype · localStorage data layer · No backend  
**Theme:** Pixel art · Fantasy · Exploration · Academic RPG  
**Context:** BINUS Multimedia course project

---

## Table of Contents
1. [Game Concept](#1-game-concept)
2. [Page Map & Navigation Flow](#2-page-map--navigation-flow)
3. [Data Schema (localStorage)](#3-data-schema-localstorage)
4. [Game Mechanics](#4-game-mechanics)
5. [Battle System](#5-battle-system)
6. [Questions System](#6-questions-system)
7. [Items System](#7-items-system)
8. [Skills & Passives](#8-skills--passives)
9. [Forum System](#9-forum-system)
10. [SVG Assets Plan](#10-svg-assets-plan)
11. [File-by-File Changes](#11-file-by-file-changes)
12. [What NOT to Build](#12-what-not-to-build)
13. [Execution Order](#13-execution-order)

---

## 1. Game Concept

BINUSVERSE is a gamified academic RPG for BINUS students. You are an **Explorer** — a student navigating the Binusverse, mastering knowledge through battles, collecting relics, and leveling up your character.

**Core game loop:**
```
Enter Binusverse (splash)
  → Check your stats (grimoire)
  → Fight knowledge battles (battle → battle-play → battle-result)
  → Collect items from victories (items)
  → Connect with other explorers (the commons / forum)
  → Repeat daily for streak bonus
```

**Pillars:**
- **Knowledge battles** — answer CS questions, earn XP
- **Character growth** — level, rank, 3 skills, 6 topic masteries
- **Item collection** — 8 usable battle items + 20 collectible relics
- **Daily habit** — streak system rewards daily logins/battles
- **Community** — local-persisted forum chat per room

---

## 2. Page Map & Navigation Flow

```
[splash.html]
  First visit detection → name input form → VR portal transition → index.html
  Returning visit → immediately redirect to index.html

[index.html]  ← HOME
  Shows: welcome banner, level/XP bar, streak counter, today's daily status
  Nav → grimoire.html | battle.html | the_commons.html
  Items link in nav → items.html

[grimoire.html]  ← PROFILE / CHARACTER SHEET
  Shows: name, avatar, rank plate, level/XP, streak
  Shows: skill bars (AI / Cyber / Data) with level + passive description
  Shows: topic mastery constellation chart (grimoire-charts.js)
  Shows: battle stats (wins, losses, total battles, win rate)
  Shows: missions list (manual task tracker, localStorage)

[battle.html]  ← BATTLE MENU
  Shows: player card (dynamic from BVUser — name, rank, level, faculty)
  Shows: Daily Quiz card (disabled if already completed today)
  Shows: Raid cards (Easy / Normal / Hard)
  Shows: PvP card (disabled — "Coming Soon")
  Clicking mode → battle-play.html?mode=X&difficulty=Y

[battle-play.html]  ← GAMEPLAY
  Reads URL params: mode (daily|raid), difficulty (easy|normal|hard)
  Loads questions from questions.json
  Daily: date-seeded selection of 10 questions
  Raid: random shuffle from difficulty pool
  HUD: timer ring, score, streak, item bar (8 battle items)
  On finish: BVUser.recordBattle() → redirect to battle-result.html

[battle-result.html]  ← RESULT SCREEN  ← NEWLY WIRED
  Reads BVUser.lastResult on page load
  Shows: score (correct/wrong), XP earned, rank badge, mode
  Shows: item earned notification (if any)
  Shows: level-up banner (if level changed)
  Buttons: "Battle Again" → battle.html | "Return Home" → index.html
  Guard: if lastResult is null → redirect battle.html immediately

[items.html]  ← ITEM COLLECTION
  Reads BVUser.items (stock) + BVUser.discoveredItems (unlocked)
  8 BATTLE ITEMS: show "USABLE" green badge + effect description
  20 COLLECTIBLE RELICS: show "RELIC" amber badge + lore text
  Undiscovered items: locked mystery card (shows ??? name + silhouette)
  Filter buttons: All | Battle | Relic | Owned

[the_commons.html]  ← FORUM HUB
  Category cards → forum-chat.html?room=global | cs.html?room=cs
  (cs.html reuses forum-chat logic with room=cs param)

[forum-chat.html]  ← CHAT ROOM (Global)
[cs.html]          ← CHAT ROOM (CS Guild)
  Both use forum-chat.js with different localStorage key per room
  Shows: sender name (from BVUser), message, timestamp
  Persists to localStorage (max 200 messages per room)
  Sender badge shows user rank color
```

---

## 3. Data Schema (localStorage)

### Key: `bv_user_v1`
Primary user state. Single source of truth.

```json
{
  "name": "string — display name (set at splash)",
  "level": "number — floor(totalXP/100)+1, min 1",
  "totalXP": "number — cumulative XP earned",
  "xpProgress": "number — totalXP % 100 (progress toward next level)",
  "rank": "string — Bronze|Silver|Gold|Platinum|Diamond|Legend",
  "streak": "number — consecutive days with at least one battle",
  "lastBattleDate": "string|null — JS Date.toDateString() of last battle",
  "totalBattles": "number",
  "totalWins": "number",
  "totalLosses": "number",
  "winRate": "number — 0-100 integer",
  "skills": {
    "ai": "number 0-100",
    "cyber": "number 0-100",
    "data": "number 0-100"
  },
  "topics": {
    "algorithms": "number 0-100",
    "oop": "number 0-100",
    "aiFundamentals": "number 0-100",
    "dynamicProgramming": "number 0-100",
    "graphTheory": "number 0-100",
    "recursion": "number 0-100"
  },
  "items": {
    "(28 item keys, each a stock count number)"
  },
  "discoveredItems": ["array of item keys ever earned"],
  "weeklyXP": [0,0,0,0,0,0],
  "weeklyWinRate": [0,0,0,0,0,0],
  "dailyCompletedDate": "string|null — Date.toDateString() of last daily quiz",
  "lastResult": {
    "correct": "number",
    "total": "number",
    "won": "boolean",
    "earnedXP": "number",
    "mode": "daily|raid",
    "difficulty": "string|null",
    "rank": "S|A|B|C|D",
    "earnedItem": "string|null — item key",
    "levelBefore": "number",
    "levelAfter": "number",
    "rankBefore": "string",
    "rankAfter": "string"
  }
}
```

### Key: `bv_forum_global`
Forum messages for Global channel.

```json
[
  { "text": "string", "time": "HH:MM", "sender": "string", "rank": "string" }
]
```

### Key: `bv_forum_cs`
Forum messages for CS Guild channel. Same structure.

### SessionStorage: `bv_started`
Set to `'1'` by splash.js. Used by index.html guard.

---

## 4. Game Mechanics

### XP & Leveling
```
Level = floor(totalXP / 100) + 1
xpProgress = totalXP % 100
Next level in: 100 - xpProgress XP
```
- No level cap (prototype)
- Level shown as number in player card and nav

### Rank System (XP-based thresholds)
```
Unranked:  0 – 99 XP       (only at level 1 start)
Bronze:    100 – 499 XP
Silver:    500 – 1199 XP
Gold:      1200 – 2499 XP
Platinum:  2500 – 4499 XP
Diamond:   4500 – 6999 XP
Legend:    7000+ XP
```
- Rank color shown in rank plate, forum sender badge, battle player card
- Rank up triggers `BVNotify.rankUp()` notification

### Streak System
- Streak increments if `lastBattleDate` was yesterday
- Streak resets to 1 if gap > 1 day
- Streak stays same if already battled today
- Visual: streak flame counter on index.html and grimoire.html
- Streak multiplier considered in XP calculation:
  - Streak 3-6: ×1.1 XP bonus
  - Streak 7-13: ×1.2 XP bonus
  - Streak 14+: ×1.3 XP bonus

### Battle Rank (per-session performance)
```
S Rank: 100% correct
A Rank: 85-99% correct
B Rank: 70-84% correct
C Rank: 50-69% correct
D Rank: < 50% correct
```
Shown on `battle-result.html`. Stored in `lastResult.rank`.

---

## 5. Battle System

### Mode: Daily Quiz
- **Questions:** 10, selected from `questions.json` using date seed
- **Timer:** 15 seconds per question (+ AI passive bonus)
- **Daily gate:** once per day — if `dailyCompletedDate === today` → button disabled with "Completed ✓" label
- **Win condition:** always "complete" (daily is about habit, not pass/fail)
- **XP formula:**
  ```
  base = correct × 10
  completion bonus = 20
  speed bonus = +5 if avgTime < 5s
  perfect bonus = +30 if correct === 10
  streak multiplier = ×1.0|1.1|1.2|1.3
  cyber passive multiplier applied last
  ```
- **Item drop:** 50% chance on completion (Data Lv4+ → 70%)

### Mode: Raid
Three difficulties, repeatable (no daily limit):

| Difficulty | Questions | Timer | Pass Mark | Clear XP | Fail XP |
|------------|-----------|-------|-----------|----------|---------|
| Easy       | 8         | 25s   | 5/8       | +30      | +5      |
| Normal     | 10        | 15s   | 7/10      | +50      | +10     |
| Hard       | 12        | 8s    | 9/12      | +80      | +15     |

- **XP formula:**
  ```
  base = correct × 10
  clear bonus = 30|50|80 (if passed)
  perfect bonus = +40 if 100% correct
  speed bonus = +5 if avgTime < difficulty threshold
  streak multiplier applied
  cyber passive multiplier applied last
  ```
- **Item drop:** 40% on fail, 65% on clear (Data Lv4+ → 85%)

### Mode: PvP
- **Status:** Disabled — "Coming Soon"
- Button renders but is non-clickable
- Shows lock icon + "Requires Server" tooltip
- No implementation needed

### XP Rewards Summary
```
Daily Quiz:   20 base + 10×correct + bonuses
Raid Easy:    5-30+ base + 10×correct + bonuses
Raid Normal:  10-50+ base + 10×correct + bonuses
Raid Hard:    15-80+ base + 10×correct + bonuses
```

---

## 6. Questions System

### Migration Plan
Move questions from hardcoded `battle-play.js` array to `questions.json`.
Target: **60 questions** (20 easy, 20 normal, 20 hard).
Each question carries `skill` + `topic` tags for skill/mastery XP attribution.

### JSON Structure
File: `questions.json` (root dir, alongside HTML files)

```json
[
  {
    "id": "q001",
    "text": "What is the time complexity of Binary Search?",
    "opts": { "A": "O(n)", "B": "O(log n)", "C": "O(n²)", "D": "O(1)" },
    "correct": "B",
    "skill": "ai",
    "topic": "algorithms",
    "difficulty": "easy"
  }
]
```

### Daily Question Selection (date-seeded, deterministic)
Same date → same 10 questions for all local users. Makes "daily" feel consistent.

```js
function seedRNG(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickDailyQuestions(pool, dateStr) {
  // seed from date e.g. "20260520" → 20260520
  const seed = parseInt(dateStr.replace(/-/g, ''));
  const rng = seedRNG(seed);
  const shuffled = pool.slice().sort(() => rng() - 0.5);
  return shuffled.slice(0, 10);
}
```

### Raid Question Selection
Filter `questions.json` by `difficulty` field, then random shuffle, take N.

### Question Tagging Rules
- `skill: 'ai'` → AI/ML, algorithms, data structures questions
- `skill: 'cyber'` → networking, security, web, OOP questions
- `skill: 'data'` → databases, OS, systems, DP questions

### 60-Question Pool (brief outline, to be written into questions.json)

**Easy (20):** Basic algorithms, simple OOP concepts, fundamental data structures, web basics  
**Normal (20):** Intermediate algorithms, security concepts, database queries, OS fundamentals, DP intro  
**Hard (20):** Advanced algorithm analysis, complex security scenarios, system design, advanced DP/graph theory

---

## 7. Items System

### Split: 8 Battle Items vs 20 Collectible Relics

**How items are earned:** `BVUser.recordBattle()` already handles item drops randomly.
Any of the 28 keys can be earned. Battle items have in-game effects. Relics are display-only.

### 8 Battle Items (USABLE in gameplay)

| Key     | Name               | Rarity    | Effect                                    | When Usable     |
|---------|--------------------|-----------|-------------------------------------------|-----------------|
| eraser  | Phantom Eraser     | Legendary | Remove 2 wrong answer choices             | Before answering |
| freeze  | Time Freeze Orb    | Epic      | +10 seconds to timer                      | Before answering |
| retry   | 2nd Chance Scroll  | Rare      | Retry wrong answer, no score penalty      | After wrong answer |
| xp      | XP Magnet          | Uncommon  | ×1.5 XP for this question                 | Before answering |
| shield  | Aegis Shield       | Rare      | Absorb 1 wrong answer (no score penalty)  | Before answering |
| gem     | Soul Gem           | Epic      | Peek correct answer for 2 seconds         | Before answering |
| warp    | Time Warp          | Legendary | Skip question — counts correct, 50% XP   | Before answering |
| focus   | Focus Potion       | Uncommon  | Pause timer until you answer              | Before answering |

Display badge: `USABLE` (bright green)  
Collection page shows item effect + rarity

### 20 Collectible Relics (DISPLAY ONLY — "Expedition Trophies")

These are lore artifacts you collect during your journey. No gameplay effect.
Each appears as a pixel art card in items.html with a lore description.

| Key     | Name                 | Rarity    | Lore                                               |
|---------|----------------------|-----------|----------------------------------------------------|
| mirror  | Reflection Stone     | Uncommon  | A crystal that shows your past battles             |
| storm   | Storm Fragment       | Rare      | Captured from a hard-fought raid                   |
| oracle  | Oracle Shard         | Epic      | An ancient crystal humming with knowledge          |
| vortex  | Vortex Token         | Rare      | Swirling with learning energy you cannot yet master |
| prism   | Prism of Clarity     | Uncommon  | Splits complexity into its simplest parts          |
| nova    | Nova Core            | Legendary | Left behind after a perfect-score explosion        |
| echo    | Echo Crystal         | Common    | Resonates with memories of previous battles        |
| compass | Explorer's Compass   | Rare      | Points toward the knowledge you haven't found yet  |
| anchor  | Anchor Rune          | Uncommon  | Grants stability when the questions get hard       |
| lantern | Scholar's Lantern    | Rare      | Illuminates the path through dark algorithms       |
| tome    | Ancient Tome         | Epic      | Pages filled with forgotten recursive patterns     |
| cipher  | Cipher Tablet        | Rare      | Encrypted with wisdom only the worthy can decode   |
| dust    | Stardust             | Common    | Remnant energy from a streak of correct answers    |
| coin    | Guild Coin           | Common    | Currency of the knowledge economy                  |
| badge   | Achievement Badge    | Uncommon  | Marks a milestone in your academic expedition      |
| rune    | Mystery Rune         | Epic      | Its power is unknown — even to the rune itself     |
| glitch  | Glitch Fragment      | Legendary | A crack in the Binusverse matrix                   |
| pouch   | Explorer's Pouch     | Common    | Carries small treasures from your journey          |
| scroll  | Ancient Scroll       | Uncommon  | Contains riddles from semesters past               |
| spark   | Lightning Spark      | Common    | A residual charge from answering at lightning speed |

Display badge: `RELIC` (amber)  
Tooltip: "Expedition Trophy — Display only. Shows your exploration history."

### Collection Page Logic (`items.js`)

```
For each item in ITEMS_REGISTRY:
  - Check BATTLE_ITEMS list (8 keys): badge = USABLE
  - Else: badge = RELIC
  - Check BVUser.discoveredItems: if not found → show LOCKED mystery card
  - Check BVUser.items[key]: show stock count bar
  - Owned + discovered: full card display
  - Discovered + 0 stock: dimmed card (no stock)
  - Not discovered: locked card (??? name, silhouette SVG, lock icon)
```

Filter buttons:
- **All** — show all 28 slots
- **Battle** — show only 8 battle items
- **Relics** — show only 20 collectibles
- **Owned** — show only items with stock > 0

---

## 8. Skills & Passives

Three skills grow from answering tagged questions in battle.
Skill XP is capped at 100. Skill level = floor(skillXP / 20) + 1 (levels 1–5).

### Skill: AI (blue — #00e5ff)
Grows from questions tagged `skill: 'ai'`

| Level | Threshold | Passive in Battle                              |
|-------|-----------|------------------------------------------------|
| 1     | 0 XP      | No passive                                     |
| 2     | 20 XP     | +2 seconds per question                        |
| 3     | 40 XP     | +2 seconds + 1 wrong answer dimmed as hint     |
| 4     | 60 XP     | +4 seconds + 1 wrong answer dimmed             |
| 5     | 80 XP     | +4 seconds + 2 wrong answers dimmed            |

### Skill: Cyber (magenta — #ff3bff)
Grows from questions tagged `skill: 'cyber'`

| Level | Threshold | Passive in Battle                              |
|-------|-----------|------------------------------------------------|
| 1     | 0 XP      | No passive                                     |
| 2     | 20 XP     | +10% XP from every answer                     |
| 3     | 40 XP     | +10% XP + first wrong = no penalty            |
| 4     | 60 XP     | +15% XP + first wrong = no penalty            |
| 5     | 80 XP     | +15% XP + first timeout = auto-retry          |

### Skill: Data (green — #00ff88)
Grows from questions tagged `skill: 'data'`

| Level | Threshold | Passive in Battle                              |
|-------|-----------|------------------------------------------------|
| 1     | 0 XP      | No passive                                     |
| 2     | 20 XP     | Streak XP bonus ×1.2                           |
| 3     | 40 XP     | Streak XP bonus ×1.2 + answer log shown        |
| 4     | 60 XP     | Streak XP ×1.5 + item drop chance ×1.4        |
| 5     | 80 XP     | Streak XP ×1.5 + item drop ×1.4 + S-Rank +30 XP |

### Skill XP Gain (per question answered)
```
correct answer: +4 to +8 (random, tagged skill)
wrong answer:   +1 to +3 (random, tagged skill)
fallback (no tag): +2 to +5 split equally across all 3 skills
```

### Topic Mastery (shown in Grimoire constellation chart)
```
correct: +5 to +13 mastery for that topic
wrong:   +1 to +4 mastery for that topic (learning from mistakes)
cap: 100 mastery per topic
```
6 topics: `algorithms`, `oop`, `aiFundamentals`, `dynamicProgramming`, `graphTheory`, `recursion`

---

## 9. Forum System

### Structure
- `the_commons.html` — hub page, links to chat rooms
- `forum-chat.html` — Global channel
- `cs.html` — CS Guild channel
- Both chat pages use the same `forum-chat.js` logic

### localStorage Persistence
Each room has its own storage key:
- Global: `bv_forum_global`
- CS Guild: `bv_forum_cs`

Message object:
```json
{ "text": "string", "time": "HH:MM", "sender": "string", "rank": "string" }
```

### forum-chat.js Rewrite
```
ROOM_KEY = room param from URL (default: 'global')
STORAGE_KEY = 'bv_forum_' + ROOM_KEY
MAX_MESSAGES = 200

onDOMReady:
  1. Detect room: URLSearchParams.get('room') || 'global'
  2. Load messages from localStorage[STORAGE_KEY]
  3. Render each message into chat container
  4. Scroll to bottom

sendMessage():
  1. Read input value
  2. Read sender: BVUser.load().name
  3. Read rank: BVUser.load().rank
  4. Build message object { text, time, sender, rank }
  5. Append to DOM (with rank-colored sender badge)
  6. Load existing messages from storage
  7. Push new message, slice to MAX_MESSAGES
  8. Save back to localStorage
  9. Clear input, scroll to bottom
```

### Sender Badge
Each message shows sender name with rank color:
- Bronze: `#cd7f32`
- Silver: `#a8a9ad`
- Gold: `#ffd700`
- Platinum: `#e5e4e2`
- Diamond: `#b9f2ff`
- Legend: `#fee783`

---

## 10. SVG Assets Plan

### What Already Exists (keep)
- 8 battle item SVGs in `items-data.js` ✓
- Rank plate SVGs in `assets/js/rank.js` ✓
- Pixel background shapes in `index.html` ✓

### What Needs to Be Created

#### 20 Collectible Relic SVGs
Each is a 16×16 pixel grid SVG using `<rect>` elements only (pixel art style).
Colors match rarity: Legendary=#ff9500, Epic=#c084fc, Rare=#00e5ff, Uncommon=#00ff88, Common=#94a3b8

Design each as a distinct artifact shape — crystals, coins, tablets, scrolls, etc.

SVGs for: mirror, storm, oracle, vortex, prism, nova, echo, compass, anchor, lantern, tome, cipher, dust, coin, badge, rune, glitch, pouch, scroll, spark

These will be added to `items-data.js` ITEMS_REGISTRY as `svgContent` strings.

#### questions.json — No SVGs needed (text only)

#### battle-result.html — Animated rank badge
The rank badge (S/A/B/C/D) should use a pixel frame animation:
- S: gold glowing pulsing frame
- A: green frame
- B: blue frame  
- C: yellow frame
- D: red frame

Done via CSS classes + existing animation system.

#### Skill Icons for Grimoire (if not already rendered)
- AI: circuit/brain pixel icon (#00e5ff)
- Cyber: shield/lock pixel icon (#ff3bff)  
- Data: bar chart/crystal pixel icon (#00ff88)

These are small inline SVGs (24×24 viewBox) added directly in grimoire HTML.

---

## 11. File-by-File Changes

### NEW FILES to create

#### `questions.json` (root dir)
- 60 CS questions
- Format: array of question objects
- Tags: skill, topic, difficulty
- Replaces hardcoded QUESTIONS array in battle-play.js

#### `battle-result.css` (if not exists already, check)
- Styles for result page: rank badge frames, stat rows, item earned display

---

### MODIFY: `splash.js`
**Current:** Just transitions to index.html on button click  
**Change:** Before going to index.html, check if user has a name:
```js
// After sessionStorage set, before redirect:
var u = BVUser.load();
if (!u.name || u.name === 'Explorer') {
  // Show name input form
  // On submit: BVUser.save({ ...u, name: inputValue })
  // Then proceed to index.html
} else {
  window.location.href = 'index.html';
}
```
**Requires:** `user-data.js` must be loaded in splash.html before splash.js

### MODIFY: `splash.html`
- Add `<script src="user-data.js">` before splash.js
- Add name input form (hidden by default, shown if needed):
  ```html
  <div id="name-form" class="hidden">
    <p>Enter your explorer name:</p>
    <input id="name-input" maxlength="20" placeholder="Explorer...">
    <button id="name-submit">Begin Journey</button>
  </div>
  ```
- Style: pixel input box, matching theme

---

### MODIFY: `battle-play.js` — `showResult()` function
**Current:** Renders inline overlay with result data  
**Change:**
1. Keep XP calculation (unchanged)
2. Keep `BVUser.recordBattle()` call (unchanged)
3. **Before** `recordBattle()`, snapshot `levelBefore` and `rankBefore`
4. **After** `recordBattle()`, enrich `lastResult` with `levelBefore`, `levelAfter`, `rankBefore`, `rankAfter`, `rank` (S/A/B/C/D), `difficulty`, `mode`
5. **Replace** all DOM manipulation in showResult() with:
   ```js
   setTimeout(() => { window.location.href = 'battle-result.html'; }, 300);
   ```
6. Keep `spawnStars()` and result animations only if you show a brief transition overlay (optional 0.3s flash)

**Also:** Load questions from `questions.json` via `fetch()` instead of hardcoded array:
```js
async function loadQuestions() {
  const res = await fetch('questions.json');
  ALL_QUESTIONS = await res.json();
  // then filter by difficulty/date as needed
  init();
}
document.addEventListener('DOMContentLoaded', loadQuestions);
```

---

### REWRITE: `battle-result.js`
**Current:** 9-line panel scale animation  
**Rewrite to:**
```js
window.onload = function() {
  // Guard: no result → go back
  if (typeof BVUser === 'undefined') { window.location.href = 'battle.html'; return; }
  var u = BVUser.load();
  var r = u.lastResult;
  if (!r) { window.location.href = 'battle.html'; return; }

  // Populate result display:
  // - Score: r.correct + ' / ' + r.total
  // - Wrong: r.total - r.correct
  // - XP: '+' + r.earnedXP + ' XP'
  // - Mode: r.mode + (r.difficulty ? ' · ' + r.difficulty : '')
  // - Rank badge: r.rank (S/A/B/C/D) with matching CSS class
  // - Level up: if r.levelAfter > r.levelBefore → show "LEVEL UP! Lv.X → Lv.Y"
  // - Rank up: if r.rankAfter !== r.rankBefore → show "RANK UP! X → Y"
  // - Item earned: if r.earnedItem → show item name + icon

  // Panel entrance animation (keep the scale-in effect)
  // Wire buttons: "Play Again" → battle.html, "Home" → index.html
};
```

---

### MODIFY: `battle-result.html`
- Add `<script src="user-data.js">` before battle-result.js
- Add `<script src="items-data.js">` (for item name lookup)
- Ensure HTML has IDs for: score, wrong, xp, mode, rank-badge, levelup-banner, rankup-banner, item-earned
- Add "Play Again" and "Home" buttons

---

### MODIFY: `battle.html`
**Current:** Hardcoded "Andrew", "Bronze", "SoCS", "11"  
**Change:** Add IDs to player card elements:
```html
<h3 class="player-name" id="player-name">—</h3>
<span class="tag tag-rank" id="player-rank">—</span>
<div class="level-box" id="player-level">—</div>
```
- Load `user-data.js` before `battle.js`
- Add `<script src="user-data.js">` in head

### MODIFY: `battle.js`
Add at top of DOMContentLoaded:
```js
// Populate player card
var u = BVUser.load();
var nameEl = document.getElementById('player-name');
var rankEl = document.getElementById('player-rank');
var levelEl = document.getElementById('player-level');
if (nameEl) nameEl.textContent = u.name;
if (rankEl) { rankEl.textContent = u.rank; rankEl.style.color = RANK_COLORS[u.rank] || '#fff'; }
if (levelEl) levelEl.textContent = u.level;

// Daily Quiz gate
var today = new Date().toDateString();
if (u.dailyCompletedDate === today) {
  var dailyBtn = document.getElementById('dailyBtn');
  if (dailyBtn) {
    dailyBtn.textContent = 'Completed Today ✓';
    dailyBtn.disabled = true;
    dailyBtn.classList.add('completed');
  }
}
```

---

### REWRITE: `forum-chat.js`
**Current:** In-memory only, messages lost on refresh  
**Rewrite:** Full localStorage persistence (see Section 9 logic above)  
Both `forum-chat.html` and `cs.html` pass room param via their script tags:
```html
<!-- in forum-chat.html -->
<script>var BV_FORUM_ROOM = 'global';</script>
<script src="forum-chat.js"></script>

<!-- in cs.html -->
<script>var BV_FORUM_ROOM = 'cs';</script>
<script src="forum-chat.js"></script>
```

---

### MODIFY: `items-data.js`
- Add `type: 'battle'` to the 8 battle items (eraser, freeze, retry, xp, shield, gem, warp, focus)
- Add `type: 'relic'` to the 20 collectible items
- Add `svgContent` to all 20 collectible relics (currently missing — needs pixel art SVGs)
- Add `lore` field to collectibles with flavor text from Section 7

---

### MODIFY: `items.js`
- Read `def.type` from ITEMS_REGISTRY
- `type === 'battle'`: show green `USABLE` badge
- `type === 'relic'`: show amber `RELIC` badge + lore tooltip
- Add filter buttons logic (All / Battle / Relics / Owned)
- Locked cards: show silhouette (`opacity: 0.15`) + lock icon overlay

---

### MODIFY: `user-data.js` — `recordBattle()`
Add to the result stored in `lastResult`:
```js
u.lastResult = {
  correct:    correct,
  total:      total,
  won:        won,
  earnedXP:   earnedXP,
  mode:       mode,
  difficulty: params.difficulty || null,   // ADD
  rank:       params.rank || null,         // ADD (S/A/B/C/D)
  earnedItem: earnedItem,
  levelBefore: params.levelBefore || u.level,   // ADD
  levelAfter:  getLevelFromXp(u.totalXP),         // ADD (needs helper)
  rankBefore:  params.rankBefore || u.rank,      // ADD
  rankAfter:   computeRank(u.totalXP),           // ADD
};
```
`recordBattle()` params object needs `difficulty`, `rank`, `levelBefore`, `rankBefore` added.

---

### MODIFY: `index.js`
- Load BVUser on DOMContentLoaded
- Populate any stat displays on home page (level, XP bar, streak)
- Check if daily already completed → show indicator on home

---

### DELETE: `script.js`
- Remove file
- Remove `<script src="script.js">` from `index.html`

---

### MODIFY: `index.html`
- Remove `<script src="script.js">`
- Optionally: add welcome text that reads user name

---

## 12. What NOT to Build

These features require a backend and should stay disabled or "Coming Soon":

| Feature | Why Skip |
|---------|----------|
| Real-time PvP | Needs WebSocket server, opponent matching |
| Global Leaderboard | Needs shared DB |
| News/Announcements | Needs admin panel |
| AI-generated questions | Needs Gemini API key on server |
| AI learning analysis | Needs server-side AI calls |
| User registration/login | No auth without backend |
| Item trading between users | Needs shared state |

**Existing backend code** (`/backend/` folder): Leave untouched. It's the planned future layer. No need to modify or document further — just don't wire it to frontend.

---

## 13. Execution Order

Implement in this order — each step is self-contained and testable:

```
Step 1: Create questions.json (60 questions)
  → Can test immediately: open console, fetch('questions.json')

Step 2: Modify user-data.js (add new lastResult fields to recordBattle)
  → BVUser.reset() in console to start fresh

Step 3: Modify items-data.js (add type field + relic SVGs + lore)
  → Test: open items.html, verify all cards render

Step 4: Modify items.js (USABLE vs RELIC badge + filter buttons)
  → Test: filter buttons work, badges show correctly

Step 5: Modify splash.html + splash.js (name capture flow)
  → Test: clear bv_user_v1 from localStorage, reload splash.html
  → Name form appears → submit → BVUser.name is set

Step 6: Modify battle.html + battle.js (dynamic player card)
  → Test: set BVUser name/rank/level, open battle.html → player card shows real data
  → Test: complete daily in same day → button shows "Completed Today ✓"

Step 7: Modify battle-play.js (fetch questions.json + showResult redirect)
  → Test: complete a raid → should redirect to battle-result.html
  → Verify BVUser.lastResult is populated correctly

Step 8: Modify battle-result.html + battle-result.js (full result display)
  → Test: after redirect, all result data shows
  → Test: "Play Again" → battle.html, "Home" → index.html
  → Test: direct navigation to battle-result.html with no lastResult → redirects to battle.html

Step 9: Rewrite forum-chat.js (localStorage persistence)
  → Test: send messages → refresh → messages still there
  → Test: cs.html messages separate from forum-chat.html messages
  → Test: sender name shows from BVUser

Step 10: Modify index.js (home stats display)
  → Test: home page shows real level, XP, streak

Step 11: Delete script.js + remove from index.html
  → Test: index.html still loads correctly
```

---

## Summary Table

| File | Action | Priority |
|------|--------|----------|
| `questions.json` | CREATE — 60 questions | HIGH |
| `user-data.js` | MODIFY — enrich lastResult fields | HIGH |
| `items-data.js` | MODIFY — add type + relic SVGs | MEDIUM |
| `items.js` | MODIFY — USABLE/RELIC badges + filters | MEDIUM |
| `splash.html` | MODIFY — add name form + user-data.js script | HIGH |
| `splash.js` | MODIFY — name capture logic | HIGH |
| `battle.html` | MODIFY — add IDs, load user-data.js | HIGH |
| `battle.js` | MODIFY — populate player card dynamically | HIGH |
| `battle-play.js` | MODIFY — fetch questions + redirect on finish | HIGH |
| `battle-result.html` | MODIFY — add script tags, IDs | HIGH |
| `battle-result.js` | REWRITE — full result display | HIGH |
| `forum-chat.js` | REWRITE — localStorage persistence | MEDIUM |
| `forum-chat.html` | MODIFY — add room var + script order | MEDIUM |
| `cs.html` | MODIFY — add room var + script order | MEDIUM |
| `index.js` | MODIFY — home stats display | LOW |
| `index.html` | MODIFY — remove script.js tag | LOW |
| `script.js` | DELETE | LOW |
