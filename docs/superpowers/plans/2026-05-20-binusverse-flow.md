# BINUSVERSE System Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire all frontend pages into a coherent game loop using localStorage as data layer.

**Architecture:** Vanilla JS + HTML/CSS. BVUser singleton (user-data.js) is the single source of truth. All pages read/write through it. No backend calls.

**Tech Stack:** Vanilla JS ES5/ES6, HTML5, CSS3, localStorage, fetch() for questions.json

---

### Task 1: Create questions.json
**Files:** Create `questions.json` (root)
- [ ] Write 60-question pool and verify with `fetch('questions.json')` in console

### Task 2: Enrich user-data.js
**Files:** Modify `user-data.js`
- [ ] Add streak multiplier to recordBattle XP calc
- [ ] Add difficulty/rank/levelBefore/rankBefore to lastResult

### Task 3: items-data.js — add type + relic SVGs
**Files:** Modify `items-data.js`
- [ ] Add `type:'battle'` to 8 battle items
- [ ] Add `type:'relic'` + lore + svgContent to 20 collectibles

### Task 4: items.js — badges + filter
**Files:** Modify `items.js`
- [ ] Render USABLE (green) vs RELIC (amber) badge per type
- [ ] Add filter button logic (All/Battle/Relic/Owned)

### Task 5: Splash onboarding
**Files:** Modify `splash.html`, `splash.js`
- [ ] Add name form HTML
- [ ] splash.js: check name, show form if needed, save on submit

### Task 6: Battle player card
**Files:** Modify `battle.html`, `battle.js`
- [ ] Add IDs to player card elements
- [ ] Load BVUser, populate name/rank/level, gate daily button

### Task 7: battle-play.js — fetch questions + redirect
**Files:** Modify `battle-play.js`
- [ ] Replace hardcoded QUESTIONS with fetch('questions.json')
- [ ] Replace showResult() DOM render with redirect to battle-result.html

### Task 8: battle-result full rewrite
**Files:** Rewrite `battle-result.html`, rewrite `battle-result.js`
- [ ] Replace old static multi-section page with single result screen
- [ ] Read BVUser.lastResult, display all fields, wire buttons

### Task 9: Forum persistence
**Files:** Rewrite `forum-chat.js`, modify `forum-chat.html`, `cs.html`
- [ ] Add room detection, localStorage load/save, rank-colored sender badges

### Task 10: Index cleanup
**Files:** Modify `index.js`, `index.html`, delete `script.js`
- [ ] Home page reads BVUser, shows level/XP/streak
- [ ] Remove script.js reference
