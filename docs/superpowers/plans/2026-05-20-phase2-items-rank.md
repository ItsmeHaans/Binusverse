# BINUSVERSE Phase 2 — Item Registry, Collection Page & Rank Plate

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 20 new battle items (28 total), a standalone `items.html` collection page, an animated rank plate in Mission Status, and update the armory "Expand All" link.

**Architecture:** `items-data.js` is a new registry file holding definitions for all 28 items (SVG, name, rarity, ability, stats). `items.html` reads from this registry plus `BVUser.load()` to render a 2-column filterable collection grid. `user-data.js` is extended to 28 keys and gains a `discoveredItems` array to track which items have ever been earned. The rank plate is injected by `index.js` into `.stats-card` using per-rank config (color, icon, animation).

**Tech Stack:** Vanilla JS (ES5 compatible), HTML5, CSS3. No build step, no frameworks. All state in `localStorage` via `BVUser` singleton. Pixel SVGs via inline `<rect>` elements on 16×16 viewBox.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `items-data.js` | CREATE | `ITEMS_REGISTRY` — all 28 item definitions |
| `user-data.js` | MODIFY | Extend `ALL_ITEMS` + `DEFAULT.items` + `discoveredItems` tracking |
| `index.html` | MODIFY | "Expand All" `href` → `items.html` |
| `items.html` | CREATE | Collection page scaffold |
| `items.css` | CREATE | 2-col grid, filter tabs, card states, tooltip |
| `items.js` | CREATE | Render 28 cards, filter logic, tooltip init |
| `index.css` | MODIFY | Rank plate keyframes + styles |
| `index.js` | MODIFY | `injectRankPlate()` function + call in `populateProfile()` |

---

## Task 1: Create items-data.js

**Files:**
- Create: `E:\BINUS\Semester 4\Multimedia\Binusverse\items-data.js`

- [ ] **Step 1: Create the file**

```javascript
/* =====================================================
   items-data.js — BINUSVERSE Item Registry
   Single source of truth for all 28 battle items.
   Load BEFORE user-data.js and items.js.
===================================================== */
(function (global) {
  'use strict';

  /* svgContent = inner rects for a 16×16 viewBox SVG */
  global.ITEMS_REGISTRY = {

    /* ── ORIGINAL 8 ── */
    eraser: {
      name: 'PHANTOM ERASER', rarity: 'legendary',
      type: '⚡ Battle Item · Instant',
      ability: 'Instantly wipes 2 wrong answer choices off the screen — only correct ones remain.',
      s1:'❌ Removes', v1:'2 wrong', s2:'🎯 Accuracy', v2:'+60%',
      svgContent:
        '<rect x="1" y="5" width="14" height="7" fill="#ff9500"/>' +
        '<rect x="1" y="5" width="14" height="3" fill="#ffb700"/>' +
        '<rect x="1" y="8" width="14" height="1" fill="#cc7700"/>' +
        '<rect x="1" y="9" width="14" height="3" fill="#f0d0a0"/>' +
        '<rect x="3" y="2" width="1" height="1" fill="#ff4444"/>' +
        '<rect x="4" y="3" width="1" height="1" fill="#ff4444"/>' +
        '<rect x="5" y="2" width="1" height="1" fill="#ff4444"/>' +
        '<rect x="9" y="2" width="1" height="1" fill="#ff4444"/>' +
        '<rect x="10" y="3" width="1" height="1" fill="#ff4444"/>' +
        '<rect x="11" y="2" width="1" height="1" fill="#ff4444"/>' +
        '<rect x="2" y="12" width="1" height="1" fill="#f0d0a0" opacity="0.6"/>' +
        '<rect x="5" y="13" width="2" height="1" fill="#f0d0a0" opacity="0.5"/>' +
        '<rect x="2" y="5" width="3" height="1" fill="#fff" opacity="0.3"/>',
    },

    freeze: {
      name: 'TIME FREEZE ORB', rarity: 'epic',
      type: '⏱ Battle Item · Instant',
      ability: 'Freezes the question timer for 10 seconds — think calmly while time stands still.',
      s1:'⏸ Pause Timer', v1:'10 sec', s2:'🧊 Effect', v2:'Freeze',
      svgContent:
        '<rect x="3" y="1" width="10" height="2" fill="#7c3aed"/>' +
        '<rect x="2" y="2" width="12" height="10" fill="#6d28d9"/>' +
        '<rect x="1" y="4" width="14" height="6" fill="#7c3aed"/>' +
        '<rect x="3" y="12" width="10" height="2" fill="#6d28d9"/>' +
        '<rect x="5" y="4" width="6" height="6" fill="#1a0a2e"/>' +
        '<rect x="6" y="3" width="4" height="1" fill="#c084fc"/>' +
        '<rect x="4" y="5" width="1" height="4" fill="#c084fc"/>' +
        '<rect x="11" y="5" width="1" height="4" fill="#c084fc"/>' +
        '<rect x="6" y="10" width="4" height="1" fill="#c084fc"/>' +
        '<rect x="7" y="5" width="1" height="3" fill="#fff"/>' +
        '<rect x="7" y="7" width="3" height="1" fill="#fff"/>' +
        '<rect x="7" y="7" width="1" height="1" fill="#fee783"/>' +
        '<rect x="3" y="3" width="2" height="2" fill="#fff" opacity="0.2"/>',
    },

    retry: {
      name: '2ND CHANCE SCROLL', rarity: 'rare',
      type: '🔄 Battle Item · Instant',
      ability: 'Got it wrong? Retry the same question once more with no score penalty.',
      s1:'🔁 Retries', v1:'+1', s2:'📉 Penalty', v2:'None',
      svgContent:
        '<rect x="2" y="0" width="12" height="2" fill="#b87333"/>' +
        '<rect x="1" y="1" width="14" height="2" fill="#d4a96a"/>' +
        '<rect x="2" y="2" width="12" height="1" fill="#b87333"/>' +
        '<rect x="1" y="3" width="14" height="9" fill="#fdf3dc"/>' +
        '<rect x="3" y="4" width="10" height="1" fill="#a0a8d0"/>' +
        '<rect x="3" y="6" width="8" height="1" fill="#a0a8d0"/>' +
        '<rect x="3" y="8" width="10" height="1" fill="#a0a8d0"/>' +
        '<rect x="5" y="5" width="6" height="1" fill="#00e5ff"/>' +
        '<rect x="10" y="5" width="1" height="3" fill="#00e5ff"/>' +
        '<rect x="9" y="7" width="2" height="1" fill="#00e5ff"/>' +
        '<rect x="5" y="4" width="3" height="1" fill="#00e5ff"/>' +
        '<rect x="2" y="12" width="12" height="1" fill="#b87333"/>' +
        '<rect x="1" y="13" width="14" height="2" fill="#d4a96a"/>',
    },

    xp: {
      name: 'XP MAGNET', rarity: 'uncommon',
      type: '⭐ Battle Item · Passive',
      ability: 'Boosts XP from every correct answer by 1.5× for this round.',
      s1:'⭐ XP Multiplier', v1:'×1.5', s2:'⏱ Duration', v2:'1 round',
      svgContent:
        '<rect x="2" y="2" width="4" height="10" fill="#94a3b8"/>' +
        '<rect x="10" y="2" width="4" height="10" fill="#94a3b8"/>' +
        '<rect x="2" y="2" width="12" height="3" fill="#64748b"/>' +
        '<rect x="3" y="5" width="2" height="7" fill="#0d0f20"/>' +
        '<rect x="11" y="5" width="2" height="7" fill="#0d0f20"/>' +
        '<rect x="2" y="12" width="4" height="3" fill="#ef4444"/>' +
        '<rect x="10" y="12" width="4" height="3" fill="#3b82f6"/>' +
        '<rect x="6" y="5" width="1" height="1" fill="#fee783"/>' +
        '<rect x="7" y="4" width="2" height="1" fill="#fee783"/>' +
        '<rect x="9" y="5" width="1" height="1" fill="#fee783"/>' +
        '<rect x="3" y="2" width="2" height="1" fill="#fff" opacity="0.3"/>',
    },

    shield: {
      name: 'AEGIS SHIELD', rarity: 'rare',
      type: '🛡 Battle Item · Passive',
      ability: 'Activates a protective shield. Your next wrong answer is absorbed — no score penalty.',
      s1:'🔰 Effect', v1:'Absorb 1 Wrong', s2:'📉 Penalty', v2:'None',
      svgContent:
        '<rect x="3" y="0" width="10" height="2" fill="#00cc66"/>' +
        '<rect x="1" y="2" width="14" height="2" fill="#00ff88"/>' +
        '<rect x="0" y="4" width="16" height="6" fill="#00cc66"/>' +
        '<rect x="1" y="10" width="14" height="2" fill="#00cc66"/>' +
        '<rect x="2" y="12" width="12" height="2" fill="#00ff88"/>' +
        '<rect x="4" y="14" width="8" height="1" fill="#00cc66"/>' +
        '<rect x="6" y="15" width="4" height="1" fill="#009944"/>' +
        '<rect x="2" y="4" width="12" height="6" fill="#00ff88" opacity="0.2"/>' +
        '<rect x="7" y="2" width="2" height="12" fill="#00ff88" opacity="0.5"/>' +
        '<rect x="3" y="6" width="10" height="2" fill="#00ff88" opacity="0.4"/>' +
        '<rect x="1" y="2" width="2" height="2" fill="#fff" opacity="0.3"/>',
    },

    gem: {
      name: 'SOUL GEM', rarity: 'epic',
      type: '💎 Battle Item · Instant',
      ability: 'The gem pulses with forbidden knowledge — reveals the correct answer for 2 full seconds.',
      s1:'👁 Reveals', v1:'Correct Ans', s2:'⏱ Duration', v2:'2 seconds',
      svgContent:
        '<rect x="5" y="0" width="6" height="2" fill="#ff3bff"/>' +
        '<rect x="3" y="2" width="10" height="2" fill="#cc00cc"/>' +
        '<rect x="1" y="4" width="14" height="7" fill="#ff3bff"/>' +
        '<rect x="2" y="5" width="12" height="5" fill="#ff00ff"/>' +
        '<rect x="4" y="6" width="8" height="3" fill="#ffaaff"/>' +
        '<rect x="6" y="7" width="4" height="1" fill="#fff"/>' +
        '<rect x="1" y="11" width="14" height="2" fill="#cc00cc"/>' +
        '<rect x="3" y="13" width="10" height="1" fill="#ff3bff"/>' +
        '<rect x="5" y="14" width="6" height="1" fill="#cc00cc"/>' +
        '<rect x="7" y="15" width="2" height="1" fill="#ff3bff"/>' +
        '<rect x="2" y="5" width="3" height="2" fill="#fff" opacity="0.4"/>',
    },

    warp: {
      name: 'TIME WARP', rarity: 'legendary',
      type: '⌖ Battle Item · Instant',
      ability: 'Rips a hole in time — skips the current question and marks it correct. XP reward is halved.',
      s1:'⏭ Skip', v1:'→ Correct', s2:'⭐ XP', v2:'50% only',
      svgContent:
        '<rect x="7" y="0" width="2" height="2" fill="#fee783"/>' +
        '<rect x="5" y="1" width="6" height="2" fill="#fee783"/>' +
        '<rect x="3" y="3" width="10" height="2" fill="#fee783"/>' +
        '<rect x="1" y="5" width="14" height="2" fill="#ffb700"/>' +
        '<rect x="0" y="7" width="16" height="2" fill="#fee783"/>' +
        '<rect x="1" y="9" width="14" height="2" fill="#ffb700"/>' +
        '<rect x="3" y="11" width="10" height="2" fill="#fee783"/>' +
        '<rect x="5" y="13" width="6" height="2" fill="#ffb700"/>' +
        '<rect x="7" y="14" width="2" height="2" fill="#fee783"/>' +
        '<rect x="6" y="6" width="4" height="4" fill="#fff" opacity="0.6"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#fee783"/>' +
        '<rect x="1" y="5" width="2" height="2" fill="#fff" opacity="0.3"/>',
    },

    focus: {
      name: 'FOCUS POTION', rarity: 'uncommon',
      type: '🧪 Battle Item · Passive',
      ability: 'Drink and enter a flow state. The battle timer freezes completely until you submit your answer.',
      s1:'⏸ Timer', v1:'Paused', s2:'🧠 Focus', v2:'Unlimited',
      svgContent:
        '<rect x="6" y="0" width="4" height="2" fill="#94a3b8"/>' +
        '<rect x="5" y="2" width="6" height="1" fill="#64748b"/>' +
        '<rect x="4" y="3" width="8" height="1" fill="#00e5ff"/>' +
        '<rect x="3" y="4" width="10" height="8" fill="#0d2233"/>' +
        '<rect x="4" y="5" width="8" height="6" fill="#00e5ff" opacity="0.25"/>' +
        '<rect x="5" y="6" width="6" height="4" fill="#00e5ff" opacity="0.5"/>' +
        '<rect x="6" y="7" width="4" height="2" fill="#fff" opacity="0.65"/>' +
        '<rect x="7" y="8" width="2" height="1" fill="#00e5ff"/>' +
        '<rect x="2" y="12" width="12" height="2" fill="#1a3a4a"/>' +
        '<rect x="3" y="14" width="10" height="1" fill="#0d2233"/>' +
        '<rect x="4" y="5" width="2" height="2" fill="#fff" opacity="0.4"/>',
    },

    /* ── 20 NEW ITEMS ── */

    mirror: {
      name: 'MIRROR CLONE', rarity: 'legendary',
      type: '🔮 Battle Item · Instant',
      ability: 'Doubles the effect of your next item used this battle.',
      s1:'🔮 Multiplier', v1:'×2 Effect', s2:'🎯 Target', v2:'Next Item',
      svgContent:
        '<rect x="1" y="4" width="2" height="8" fill="#ff9500"/>' +
        '<rect x="3" y="3" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="3" y="11" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="5" y="2" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="5" y="12" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="7" y="1" width="2" height="14" fill="#ffb700"/>' +
        '<rect x="13" y="4" width="2" height="8" fill="#ff9500"/>' +
        '<rect x="11" y="3" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="11" y="11" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="9" y="2" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="9" y="12" width="2" height="2" fill="#ff9500"/>' +
        '<rect x="1" y="4" width="1" height="2" fill="#fff" opacity="0.4"/>',
    },

    storm: {
      name: 'PIXEL STORM', rarity: 'legendary',
      type: '⚡ Battle Item · Instant',
      ability: 'Eliminates ALL wrong answer choices — only the correct one remains.',
      s1:'❌ Removes', v1:'All Wrong', s2:'🎯 Accuracy', v2:'100%',
      svgContent:
        '<rect x="8" y="0" width="5" height="2" fill="#ff9500"/>' +
        '<rect x="6" y="2" width="5" height="2" fill="#ffb700"/>' +
        '<rect x="5" y="4" width="5" height="2" fill="#ff9500"/>' +
        '<rect x="4" y="6" width="7" height="2" fill="#ffb700"/>' +
        '<rect x="3" y="8" width="6" height="2" fill="#ff9500"/>' +
        '<rect x="2" y="10" width="5" height="2" fill="#ffb700"/>' +
        '<rect x="1" y="12" width="5" height="4" fill="#ff9500"/>' +
        '<rect x="5" y="6" width="2" height="2" fill="#fff" opacity="0.5"/>',
    },

    oracle: {
      name: 'ORACLE CRYSTAL', rarity: 'legendary',
      type: '👁 Battle Item · Passive',
      ability: 'Reveals the skill category & difficulty of the next 3 questions before they appear.',
      s1:'👁 Preview', v1:'3 Questions', s2:'📊 Shows', v2:'Skill+Diff',
      svgContent:
        '<rect x="3" y="2" width="10" height="2" fill="#ff9500"/>' +
        '<rect x="1" y="4" width="14" height="6" fill="#ff9500"/>' +
        '<rect x="3" y="10" width="10" height="2" fill="#ff9500"/>' +
        '<rect x="4" y="4" width="8" height="6" fill="#ffb700" opacity="0.6"/>' +
        '<rect x="5" y="5" width="4" height="4" fill="#fff" opacity="0.4"/>' +
        '<rect x="5" y="12" width="6" height="1" fill="#cc7700"/>' +
        '<rect x="4" y="13" width="8" height="1" fill="#ff9500"/>' +
        '<rect x="3" y="14" width="10" height="2" fill="#cc7700"/>' +
        '<rect x="3" y="4" width="3" height="2" fill="#fff" opacity="0.4"/>',
    },

    vortex: {
      name: 'VOID VORTEX', rarity: 'epic',
      type: '⌖ Battle Item · Instant',
      ability: 'Skips current question with no XP gain and no penalty. Pure escape.',
      s1:'⏭ Skip', v1:'→ No Penalty', s2:'⭐ XP', v2:'0 (skipped)',
      svgContent:
        '<rect x="3" y="0" width="10" height="2" fill="#c084fc"/>' +
        '<rect x="0" y="3" width="2" height="10" fill="#c084fc"/>' +
        '<rect x="14" y="3" width="2" height="10" fill="#c084fc"/>' +
        '<rect x="3" y="14" width="10" height="2" fill="#c084fc"/>' +
        '<rect x="5" y="3" width="6" height="1" fill="#9333ea"/>' +
        '<rect x="3" y="5" width="1" height="6" fill="#9333ea"/>' +
        '<rect x="12" y="5" width="1" height="6" fill="#9333ea"/>' +
        '<rect x="5" y="12" width="6" height="1" fill="#9333ea"/>' +
        '<rect x="6" y="6" width="4" height="4" fill="#1a0a2e"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#c084fc" opacity="0.8"/>' +
        '<rect x="1" y="1" width="2" height="2" fill="#c084fc" opacity="0.4"/>' +
        '<rect x="13" y="1" width="2" height="2" fill="#c084fc" opacity="0.4"/>',
    },

    prism: {
      name: 'PRISM LENS', rarity: 'epic',
      type: '🔆 Battle Item · Passive',
      ability: 'Splits XP earned this round equally across all 3 skills (AI / Cyber / Data).',
      s1:'⭐ XP Split', v1:'3 Skills', s2:'⏱ Duration', v2:'1 Round',
      svgContent:
        '<rect x="7" y="0" width="2" height="2" fill="#c084fc"/>' +
        '<rect x="6" y="2" width="4" height="2" fill="#c084fc"/>' +
        '<rect x="5" y="4" width="6" height="2" fill="#c084fc"/>' +
        '<rect x="4" y="6" width="8" height="2" fill="#9333ea"/>' +
        '<rect x="3" y="8" width="10" height="2" fill="#c084fc"/>' +
        '<rect x="2" y="10" width="12" height="2" fill="#9333ea"/>' +
        '<rect x="1" y="12" width="14" height="2" fill="#c084fc"/>' +
        '<rect x="0" y="7" width="3" height="1" fill="#ff6b6b"/>' +
        '<rect x="0" y="8" width="3" height="1" fill="#fee783"/>' +
        '<rect x="0" y="9" width="3" height="1" fill="#00ff88"/>' +
        '<rect x="6" y="2" width="2" height="2" fill="#fff" opacity="0.4"/>',
    },

    nova: {
      name: 'NOVA BURST', rarity: 'epic',
      type: '💥 Battle Item · Passive',
      ability: 'Next correct answer grants ×3 XP — but timer is reduced by 5 seconds.',
      s1:'⭐ XP Boost', v1:'×3', s2:'⏱ Timer', v2:'-5 sec',
      svgContent:
        '<rect x="7" y="7" width="2" height="2" fill="#fff"/>' +
        '<rect x="7" y="0" width="2" height="6" fill="#c084fc"/>' +
        '<rect x="7" y="10" width="2" height="6" fill="#c084fc"/>' +
        '<rect x="0" y="7" width="6" height="2" fill="#c084fc"/>' +
        '<rect x="10" y="7" width="6" height="2" fill="#c084fc"/>' +
        '<rect x="2" y="2" width="2" height="2" fill="#9333ea"/>' +
        '<rect x="4" y="4" width="2" height="2" fill="#c084fc"/>' +
        '<rect x="10" y="2" width="2" height="2" fill="#9333ea"/>' +
        '<rect x="10" y="4" width="2" height="2" fill="#c084fc"/>' +
        '<rect x="2" y="12" width="2" height="2" fill="#9333ea"/>' +
        '<rect x="4" y="10" width="2" height="2" fill="#c084fc"/>' +
        '<rect x="10" y="12" width="2" height="2" fill="#9333ea"/>' +
        '<rect x="10" y="10" width="2" height="2" fill="#c084fc"/>' +
        '<rect x="6" y="5" width="4" height="1" fill="#c084fc" opacity="0.6"/>' +
        '<rect x="5" y="6" width="1" height="4" fill="#c084fc" opacity="0.6"/>',
    },

    echo: {
      name: 'ECHO RUNE', rarity: 'epic',
      type: '🔁 Battle Item · Passive',
      ability: 'Correct answer → free retry automatically granted on the next question if you get it wrong.',
      s1:'🔁 Free Retry', v1:'+1 Next Q', s2:'🎯 Trigger', v2:'On Correct',
      svgContent:
        '<rect x="2" y="0" width="12" height="2" fill="#9333ea"/>' +
        '<rect x="1" y="2" width="14" height="10" fill="#c084fc"/>' +
        '<rect x="2" y="12" width="12" height="2" fill="#9333ea"/>' +
        '<rect x="3" y="14" width="10" height="2" fill="#6d28d9"/>' +
        '<rect x="7" y="3" width="2" height="6" fill="#fff" opacity="0.9"/>' +
        '<rect x="5" y="4" width="2" height="4" fill="#fff" opacity="0.6"/>' +
        '<rect x="9" y="4" width="2" height="4" fill="#fff" opacity="0.6"/>' +
        '<rect x="3" y="5" width="2" height="2" fill="#fff" opacity="0.3"/>' +
        '<rect x="11" y="5" width="2" height="2" fill="#fff" opacity="0.3"/>' +
        '<rect x="2" y="2" width="3" height="2" fill="#fff" opacity="0.3"/>',
    },

    compass: {
      name: 'COMPASS SHARD', rarity: 'rare',
      type: '🧭 Battle Item · Passive',
      ability: 'Reveals which skill (AI / Cyber / Data) the next question belongs to before it appears.',
      s1:'👁 Reveals', v1:'Skill Type', s2:'📊 Scope', v2:'Next Q Only',
      svgContent:
        '<rect x="3" y="0" width="10" height="2" fill="#00e5ff"/>' +
        '<rect x="1" y="2" width="2" height="2" fill="#00e5ff"/>' +
        '<rect x="13" y="2" width="2" height="2" fill="#00e5ff"/>' +
        '<rect x="0" y="4" width="2" height="8" fill="#00e5ff"/>' +
        '<rect x="14" y="4" width="2" height="8" fill="#00e5ff"/>' +
        '<rect x="1" y="12" width="2" height="2" fill="#00e5ff"/>' +
        '<rect x="13" y="12" width="2" height="2" fill="#00e5ff"/>' +
        '<rect x="3" y="14" width="10" height="2" fill="#00e5ff"/>' +
        '<rect x="2" y="2" width="12" height="12" fill="#002233"/>' +
        '<rect x="7" y="3" width="2" height="5" fill="#ff6b6b"/>' +
        '<rect x="7" y="8" width="2" height="5" fill="#fff" opacity="0.6"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#fee783"/>' +
        '<rect x="7" y="1" width="2" height="1" fill="#fff"/>' +
        '<rect x="7" y="14" width="2" height="1" fill="#fff"/>' +
        '<rect x="1" y="7" width="1" height="2" fill="#fff"/>' +
        '<rect x="14" y="7" width="1" height="2" fill="#fff"/>',
    },

    anchor: {
      name: 'ANCHOR SEAL', rarity: 'rare',
      type: '⚓ Battle Item · Passive',
      ability: 'Locks your current streak — one wrong answer this round won\'t break it.',
      s1:'🔒 Protects', v1:'1 Wrong', s2:'🔥 Streak', v2:'Preserved',
      svgContent:
        '<rect x="4" y="0" width="8" height="2" fill="#00e5ff"/>' +
        '<rect x="7" y="2" width="2" height="10" fill="#00e5ff"/>' +
        '<rect x="3" y="5" width="10" height="2" fill="#00b8d4"/>' +
        '<rect x="1" y="8" width="2" height="4" fill="#00e5ff"/>' +
        '<rect x="13" y="8" width="2" height="4" fill="#00e5ff"/>' +
        '<rect x="2" y="10" width="3" height="2" fill="#00e5ff"/>' +
        '<rect x="11" y="10" width="3" height="2" fill="#00e5ff"/>' +
        '<rect x="2" y="12" width="5" height="2" fill="#00e5ff"/>' +
        '<rect x="9" y="12" width="5" height="2" fill="#00e5ff"/>' +
        '<rect x="7" y="2" width="1" height="3" fill="#fff" opacity="0.4"/>',
    },

    lantern: {
      name: 'PIXEL LANTERN', rarity: 'rare',
      type: '🔦 Battle Item · Passive',
      ability: 'Dims one wrong answer choice per question for the next 3 questions.',
      s1:'💡 Dims', v1:'1 Wrong/Q', s2:'⏱ Duration', v2:'3 Questions',
      svgContent:
        '<rect x="7" y="0" width="2" height="2" fill="#00b8d4"/>' +
        '<rect x="6" y="1" width="4" height="1" fill="#00e5ff"/>' +
        '<rect x="4" y="2" width="8" height="2" fill="#00e5ff"/>' +
        '<rect x="3" y="4" width="10" height="8" fill="#003344"/>' +
        '<rect x="4" y="4" width="2" height="8" fill="#00b8d4"/>' +
        '<rect x="10" y="4" width="2" height="8" fill="#00b8d4"/>' +
        '<rect x="5" y="5" width="6" height="6" fill="#fee783" opacity="0.3"/>' +
        '<rect x="6" y="6" width="4" height="4" fill="#fee783" opacity="0.5"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#fff" opacity="0.7"/>' +
        '<rect x="4" y="12" width="8" height="2" fill="#00e5ff"/>' +
        '<rect x="5" y="14" width="6" height="2" fill="#00b8d4"/>' +
        '<rect x="4" y="4" width="2" height="2" fill="#fff" opacity="0.3"/>',
    },

    tome: {
      name: 'BATTLE TOME', rarity: 'rare',
      type: '📖 Battle Item · Passive',
      ability: 'Permanently adds +5 seconds to the timer for every remaining question this battle.',
      s1:'⏱ Timer +', v1:'+5 sec/Q', s2:'📊 Scope', v2:'Full Battle',
      svgContent:
        '<rect x="7" y="0" width="2" height="16" fill="#0099aa"/>' +
        '<rect x="1" y="1" width="6" height="14" fill="#fdf3dc"/>' +
        '<rect x="9" y="1" width="6" height="14" fill="#fdf3dc"/>' +
        '<rect x="2" y="3" width="4" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="2" y="5" width="4" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="2" y="7" width="3" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="2" y="9" width="4" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="2" y="11" width="3" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="10" y="3" width="4" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="10" y="5" width="4" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="10" y="7" width="3" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="10" y="9" width="4" height="1" fill="#00b8d4" opacity="0.6"/>' +
        '<rect x="11" y="5" width="2" height="4" fill="#00e5ff" opacity="0.5"/>' +
        '<rect x="10" y="6" width="4" height="2" fill="#00e5ff" opacity="0.3"/>',
    },

    cipher: {
      name: 'CIPHER KEY', rarity: 'rare',
      type: '🔑 Battle Item · Passive',
      ability: 'Decodes next question\'s difficulty — shows EASY / MEDIUM / HARD before answering.',
      s1:'📊 Reveals', v1:'Difficulty', s2:'🎯 Scope', v2:'Next Q Only',
      svgContent:
        '<rect x="1" y="2" width="8" height="2" fill="#00e5ff"/>' +
        '<rect x="0" y="4" width="10" height="6" fill="#00e5ff"/>' +
        '<rect x="1" y="10" width="8" height="2" fill="#00e5ff"/>' +
        '<rect x="3" y="5" width="4" height="4" fill="#002233"/>' +
        '<rect x="4" y="6" width="2" height="2" fill="#00e5ff" opacity="0.2"/>' +
        '<rect x="9" y="7" width="7" height="2" fill="#00b8d4"/>' +
        '<rect x="11" y="9" width="2" height="2" fill="#00e5ff"/>' +
        '<rect x="14" y="9" width="2" height="2" fill="#00e5ff"/>' +
        '<rect x="1" y="4" width="2" height="2" fill="#fff" opacity="0.4"/>',
    },

    dust: {
      name: 'PIXEL DUST', rarity: 'uncommon',
      type: '✨ Battle Item · Instant',
      ability: 'Grants +5 bonus XP on your next correct answer.',
      s1:'⭐ Bonus XP', v1:'+5', s2:'🎯 Trigger', v2:'Next Correct',
      svgContent:
        '<rect x="1" y="1" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="6" y="0" width="2" height="2" fill="#00ff88" opacity="0.8"/>' +
        '<rect x="12" y="2" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="3" y="5" width="2" height="2" fill="#00ff88" opacity="0.6"/>' +
        '<rect x="9" y="4" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="14" y="6" width="2" height="2" fill="#00ff88" opacity="0.7"/>' +
        '<rect x="0" y="9" width="2" height="2" fill="#00ff88" opacity="0.5"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#fff" opacity="0.8"/>' +
        '<rect x="11" y="9" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="4" y="12" width="2" height="2" fill="#00ff88" opacity="0.6"/>' +
        '<rect x="13" y="13" width="2" height="2" fill="#00ff88" opacity="0.4"/>' +
        '<rect x="8" y="13" width="2" height="2" fill="#00ff88" opacity="0.7"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#fff"/>',
    },

    coin: {
      name: 'LUCKY COIN', rarity: 'uncommon',
      type: '🪙 Battle Item · Instant',
      ability: 'Flip of fate: 50% chance to double XP on next answer, 50% chance to skip question.',
      s1:'🎲 Chance', v1:'50/50', s2:'⭐ XP', v2:'×2 or Skip',
      svgContent:
        '<rect x="3" y="0" width="10" height="2" fill="#00ff88"/>' +
        '<rect x="1" y="2" width="14" height="12" fill="#00ff88"/>' +
        '<rect x="3" y="14" width="10" height="2" fill="#00ff88"/>' +
        '<rect x="3" y="2" width="10" height="12" fill="#00cc6a"/>' +
        '<rect x="7" y="2" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="5" y="4" width="6" height="2" fill="#00ff88"/>' +
        '<rect x="6" y="6" width="4" height="4" fill="#00ff88"/>' +
        '<rect x="5" y="8" width="6" height="2" fill="#00ff88"/>' +
        '<rect x="7" y="10" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="2" y="2" width="3" height="2" fill="#fff" opacity="0.4"/>',
    },

    badge: {
      name: 'SPEED BADGE', rarity: 'uncommon',
      type: '⚡ Battle Item · Passive',
      ability: 'Answer the next question in under 3 seconds → XP reward is doubled.',
      s1:'⭐ XP Boost', v1:'×2', s2:'⏱ Condition', v2:'< 3 seconds',
      svgContent:
        '<rect x="2" y="0" width="12" height="2" fill="#00ff88"/>' +
        '<rect x="1" y="2" width="14" height="10" fill="#00ff88"/>' +
        '<rect x="2" y="12" width="12" height="2" fill="#00ff88"/>' +
        '<rect x="4" y="14" width="8" height="1" fill="#00ff88"/>' +
        '<rect x="6" y="15" width="4" height="1" fill="#00cc6a"/>' +
        '<rect x="3" y="2" width="10" height="10" fill="#004422"/>' +
        '<rect x="9" y="2" width="3" height="3" fill="#00ff88"/>' +
        '<rect x="7" y="5" width="4" height="3" fill="#fee783"/>' +
        '<rect x="5" y="8" width="4" height="3" fill="#00ff88"/>' +
        '<rect x="2" y="2" width="3" height="2" fill="#fff" opacity="0.3"/>',
    },

    rune: {
      name: 'MANA RUNE', rarity: 'uncommon',
      type: '🔷 Battle Item · Instant',
      ability: 'Restores 1 use of the last item you consumed this battle.',
      s1:'🔄 Restore', v1:'1 Use', s2:'🎯 Target', v2:'Last Item',
      svgContent:
        '<rect x="5" y="0" width="6" height="2" fill="#00ff88"/>' +
        '<rect x="3" y="2" width="10" height="2" fill="#00ff88"/>' +
        '<rect x="1" y="4" width="14" height="8" fill="#00ff88"/>' +
        '<rect x="3" y="12" width="10" height="2" fill="#00ff88"/>' +
        '<rect x="5" y="14" width="6" height="2" fill="#00ff88"/>' +
        '<rect x="4" y="4" width="8" height="8" fill="#001a0d"/>' +
        '<rect x="4" y="5" width="2" height="6" fill="#00ff88" opacity="0.8"/>' +
        '<rect x="10" y="5" width="2" height="6" fill="#00ff88" opacity="0.8"/>' +
        '<rect x="6" y="6" width="4" height="2" fill="#00ff88" opacity="0.6"/>' +
        '<rect x="6" y="5" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="8" y="5" width="2" height="2" fill="#00ff88"/>' +
        '<rect x="5" y="4" width="3" height="1" fill="#fff" opacity="0.4"/>',
    },

    glitch: {
      name: 'GLITCH PATCH', rarity: 'uncommon',
      type: '🔧 Battle Item · Instant',
      ability: 'Resets the current question\'s timer back to full. One-time emergency reset.',
      s1:'⏱ Timer', v1:'Full Reset', s2:'📦 Uses', v2:'1',
      svgContent:
        '<rect x="0" y="0" width="8" height="4" fill="#00ff88"/>' +
        '<rect x="10" y="0" width="6" height="2" fill="#00ff88" opacity="0.7"/>' +
        '<rect x="8" y="2" width="4" height="2" fill="#ff6b6b"/>' +
        '<rect x="0" y="4" width="4" height="4" fill="#00ff88" opacity="0.5"/>' +
        '<rect x="6" y="4" width="6" height="2" fill="#00e5ff"/>' +
        '<rect x="4" y="6" width="4" height="2" fill="#00ff88"/>' +
        '<rect x="12" y="4" width="4" height="4" fill="#00ff88" opacity="0.8"/>' +
        '<rect x="0" y="8" width="6" height="2" fill="#fee783" opacity="0.8"/>' +
        '<rect x="8" y="8" width="8" height="2" fill="#00ff88"/>' +
        '<rect x="0" y="10" width="10" height="2" fill="#00ff88" opacity="0.6"/>' +
        '<rect x="12" y="10" width="4" height="2" fill="#ff6b6b" opacity="0.7"/>' +
        '<rect x="0" y="12" width="4" height="4" fill="#00e5ff" opacity="0.5"/>' +
        '<rect x="6" y="12" width="10" height="2" fill="#00ff88"/>' +
        '<rect x="0" y="7" width="16" height="1" fill="#fff" opacity="0.15"/>',
    },

    pouch: {
      name: 'ITEM POUCH', rarity: 'common',
      type: '🎒 Battle Item · Passive',
      ability: 'Increases max stock capacity for all items by 5 permanently.',
      s1:'📦 Capacity', v1:'+5 All', s2:'📊 Type', v2:'Permanent',
      svgContent:
        '<rect x="5" y="0" width="2" height="3" fill="#64748b"/>' +
        '<rect x="9" y="0" width="2" height="3" fill="#64748b"/>' +
        '<rect x="4" y="1" width="8" height="1" fill="#94a3b8"/>' +
        '<rect x="2" y="3" width="12" height="2" fill="#94a3b8"/>' +
        '<rect x="1" y="5" width="14" height="8" fill="#94a3b8"/>' +
        '<rect x="2" y="13" width="12" height="2" fill="#94a3b8"/>' +
        '<rect x="4" y="15" width="8" height="1" fill="#64748b"/>' +
        '<rect x="2" y="5" width="12" height="8" fill="#64748b" opacity="0.3"/>' +
        '<rect x="3" y="6" width="4" height="6" fill="#94a3b8" opacity="0.5"/>' +
        '<rect x="6" y="3" width="4" height="2" fill="#475569"/>' +
        '<rect x="2" y="5" width="4" height="2" fill="#fff" opacity="0.3"/>',
    },

    scroll: {
      name: 'QUICK SCROLL', rarity: 'common',
      type: '📜 Battle Item · Instant',
      ability: 'Adds +3 seconds to the current question\'s timer.',
      s1:'⏱ Timer +', v1:'+3 sec', s2:'📊 Scope', v2:'Current Q',
      svgContent:
        '<rect x="1" y="0" width="14" height="3" fill="#94a3b8"/>' +
        '<rect x="2" y="1" width="12" height="1" fill="#64748b"/>' +
        '<rect x="1" y="13" width="14" height="3" fill="#94a3b8"/>' +
        '<rect x="2" y="14" width="12" height="1" fill="#64748b"/>' +
        '<rect x="1" y="3" width="14" height="10" fill="#e2e8f0"/>' +
        '<rect x="3" y="4" width="10" height="1" fill="#94a3b8"/>' +
        '<rect x="3" y="6" width="8" height="1" fill="#94a3b8"/>' +
        '<rect x="3" y="8" width="10" height="1" fill="#94a3b8"/>' +
        '<rect x="3" y="10" width="6" height="1" fill="#94a3b8"/>' +
        '<rect x="5" y="5" width="2" height="3" fill="#00e5ff" opacity="0.8"/>' +
        '<rect x="7" y="5" width="2" height="3" fill="#00e5ff" opacity="0.8"/>' +
        '<rect x="9" y="5" width="2" height="3" fill="#00e5ff" opacity="0.5"/>' +
        '<rect x="2" y="0" width="3" height="1" fill="#fff" opacity="0.5"/>',
    },

    spark: {
      name: 'XP SPARK', rarity: 'common',
      type: '✦ Battle Item · Instant',
      ability: 'Grants +2 bonus XP on your next answer, correct or wrong.',
      s1:'⭐ Bonus XP', v1:'+2', s2:'🎯 Trigger', v2:'Any Answer',
      svgContent:
        '<rect x="7" y="0" width="2" height="5" fill="#94a3b8"/>' +
        '<rect x="7" y="11" width="2" height="5" fill="#94a3b8"/>' +
        '<rect x="0" y="7" width="5" height="2" fill="#94a3b8"/>' +
        '<rect x="11" y="7" width="5" height="2" fill="#94a3b8"/>' +
        '<rect x="2" y="2" width="2" height="2" fill="#94a3b8" opacity="0.5"/>' +
        '<rect x="12" y="2" width="2" height="2" fill="#94a3b8" opacity="0.5"/>' +
        '<rect x="2" y="12" width="2" height="2" fill="#94a3b8" opacity="0.5"/>' +
        '<rect x="12" y="12" width="2" height="2" fill="#94a3b8" opacity="0.5"/>' +
        '<rect x="6" y="6" width="4" height="4" fill="#fff" opacity="0.6"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#fff"/>' +
        '<rect x="5" y="8" width="2" height="1" fill="#fee783" opacity="0.8"/>' +
        '<rect x="9" y="8" width="2" height="1" fill="#fee783" opacity="0.8"/>',
    },

  }; /* end ITEMS_REGISTRY */

})(window);
```

- [ ] **Step 2: Verify file loads without errors**

Open browser console on any BINUSVERSE page after adding `<script src="items-data.js"></script>` temporarily to index.html before `user-data.js`. Run:
```js
Object.keys(ITEMS_REGISTRY).length
```
Expected: `28`

- [ ] **Step 3: Commit**

```bash
git add items-data.js
git commit -m "feat: add items-data.js registry with all 28 battle items"
```

---

## Task 2: Extend user-data.js — 28 keys + discoveredItems

**Files:**
- Modify: `E:\BINUS\Semester 4\Multimedia\Binusverse\user-data.js`

- [ ] **Step 1: Extend ALL_ITEMS array**

Find:
```javascript
var ALL_ITEMS = ['eraser', 'freeze', 'retry', 'xp', 'shield', 'gem', 'warp', 'focus'];
```

Replace with:
```javascript
var ALL_ITEMS = [
  'eraser','freeze','retry','xp','shield','gem','warp','focus',
  'mirror','storm','oracle','vortex','prism','nova','echo',
  'compass','anchor','lantern','tome','cipher',
  'dust','coin','badge','rune','glitch',
  'pouch','scroll','spark',
];
```

- [ ] **Step 2: Extend DEFAULT.items and add discoveredItems**

Find:
```javascript
    /* 8 battle items — stock count */
    items: {
      eraser: 0, freeze: 0, retry: 0, xp:    0,
      shield: 0, gem:    0, warp:  0, focus: 0,
    },
```

Replace with:
```javascript
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
```

- [ ] **Step 3: Update load() to merge discoveredItems**

Find inside `load()`:
```javascript
      merged.skills  = Object.assign({}, DEFAULT.skills,  saved.skills  || {});
      merged.topics  = Object.assign({}, DEFAULT.topics,  saved.topics  || {});
      merged.items   = Object.assign({}, DEFAULT.items,   saved.items   || {});
```

Replace with:
```javascript
      merged.skills         = Object.assign({}, DEFAULT.skills,  saved.skills  || {});
      merged.topics         = Object.assign({}, DEFAULT.topics,  saved.topics  || {});
      merged.items          = Object.assign({}, DEFAULT.items,   saved.items   || {});
      merged.discoveredItems = Array.isArray(saved.discoveredItems) ? saved.discoveredItems.slice() : [];
```

- [ ] **Step 4: Track discovered items in recordBattle()**

Find inside `recordBattle()`:
```javascript
    if (Math.random() < itemChance) {
      var itemPool = ALL_ITEMS;
      earnedItem = itemPool[Math.floor(Math.random() * itemPool.length)];
      u.items[earnedItem] = (u.items[earnedItem] || 0) + 1;
    }
```

Replace with:
```javascript
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
```

- [ ] **Step 5: Verify in browser console**

Open index.html in browser. Run:
```js
var u = BVUser.load();
u.discoveredItems; // → []
Object.keys(u.items).length; // → 28
```
Expected: `[]` and `28`

- [ ] **Step 6: Commit**

```bash
git add user-data.js
git commit -m "feat: extend BVUser to 28 items, add discoveredItems tracking"
```

---

## Task 3: Update index.html — "Expand All" link

**Files:**
- Modify: `E:\BINUS\Semester 4\Multimedia\Binusverse\index.html`

- [ ] **Step 1: Update the href**

Find:
```html
  <a class="wide-btn" href="battle.html">Expand All</a>
```

Replace with:
```html
  <a class="wide-btn" href="items.html">Expand All</a>
```

- [ ] **Step 2: Verify**

Open index.html in browser. Click "Expand All" button in Battle Items section. Should navigate to items.html (will 404 until Task 5 creates it — that's fine).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: link armory 'Expand All' to items.html"
```

---

## Task 4: Create items.css

**Files:**
- Create: `E:\BINUS\Semester 4\Multimedia\Binusverse\items.css`

- [ ] **Step 1: Create the file**

```css
/* =====================================================
   items.css — BINUSVERSE Item Collection Page
===================================================== */

/* ── Page base ── */
body {
  margin: 0;
  background: #080c14;
  color: #e0e8ff;
  font-family: 'Pixelify Sans', sans-serif;
  min-height: 100vh;
}

/* ── Hero header ── */
.items-hero {
  text-align: center;
  padding: 80px 20px 24px;
}
.items-hero-title {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #fee783;
  letter-spacing: 4px;
  margin: 0 0 12px;
}
.items-hero-sub {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  color: #00c3ff;
  letter-spacing: 2px;
}
.items-counter {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 14px;
  border: 1px solid #00c3ff44;
  border-radius: 2px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  color: #00c3ff;
  letter-spacing: 1px;
}

/* ── Filter tabs ── */
.items-filter-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 20px;
}
.items-filter-btn {
  padding: 6px 14px;
  border: 1px solid #333;
  background: transparent;
  border-radius: 2px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.45rem;
  color: #666;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.15s;
}
.items-filter-btn:hover { color: #aaa; border-color: #555; }
.items-filter-btn.active { border-color: currentColor; }
.items-filter-btn[data-rarity="all"].active    { color: #fff; border-color: #fff; }
.items-filter-btn[data-rarity="legendary"].active { color: #ff9500; border-color: #ff9500; }
.items-filter-btn[data-rarity="epic"].active   { color: #c084fc; border-color: #c084fc; }
.items-filter-btn[data-rarity="rare"].active   { color: #00e5ff; border-color: #00e5ff; }
.items-filter-btn[data-rarity="uncommon"].active { color: #00ff88; border-color: #00ff88; }
.items-filter-btn[data-rarity="common"].active { color: #94a3b8; border-color: #94a3b8; }

/* ── 2-column card grid ── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 60px;
}
@media (max-width: 600px) {
  .items-grid { grid-template-columns: 1fr; }
}

/* ── Item card ── */
.item-card {
  background: #0d1117;
  border: 1px solid #222;
  border-radius: 4px;
  padding: 14px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
}
.item-card:hover { border-color: var(--item-color, #444); box-shadow: 0 0 12px var(--item-glow, transparent); }

/* rarity border colors */
.item-card.r-legendary { --item-color:#ff9500; --item-glow:rgba(255,149,0,0.18); }
.item-card.r-epic      { --item-color:#c084fc; --item-glow:rgba(192,132,252,0.18); }
.item-card.r-rare      { --item-color:#00e5ff; --item-glow:rgba(0,229,255,0.15); }
.item-card.r-uncommon  { --item-color:#00ff88; --item-glow:rgba(0,255,136,0.15); }
.item-card.r-common    { --item-color:#94a3b8; --item-glow:rgba(148,163,184,0.12); }

/* locked state */
.item-card.locked { opacity: 0.35; filter: grayscale(0.8); }
.item-card.locked:hover { border-color: #444; box-shadow: none; }

/* hidden by filter */
.item-card.filter-hidden { display: none; }

/* ── Rarity tag (top-right corner) ── */
.item-rarity-tag {
  position: absolute;
  top: 8px;
  right: 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.35rem;
  letter-spacing: 1px;
  color: var(--item-color, #666);
  opacity: 0.8;
}

/* ── SVG icon container ── */
.item-card-icon {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #080c14;
  border: 1px solid #1a1a2e;
  border-radius: 3px;
}
.item-card-icon svg { image-rendering: pixelated; }

/* locked icon overlay */
.item-card.locked .item-card-icon::after {
  content: '?';
  position: absolute;
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: #333;
}
.item-card.locked .item-card-icon svg { opacity: 0; }

/* ── Card body ── */
.item-card-body { flex: 1; min-width: 0; }
.item-card-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  color: var(--item-color, #fff);
  margin: 0 0 4px;
  line-height: 1.4;
}
.item-card.locked .item-card-name { color: #444; }

.item-card-type {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 0.75rem;
  color: #555;
  margin: 0 0 6px;
}
.item-card-ability {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 0.85rem;
  color: #aaa;
  line-height: 1.4;
  margin: 0 0 10px;
}
.item-card.locked .item-card-ability { visibility: hidden; }

/* ── Stock bar ── */
.item-stock-wrap { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.item-stock-bar-track {
  flex: 1;
  height: 3px;
  background: #1a1a2e;
  border-radius: 2px;
  overflow: hidden;
}
.item-stock-bar-fill {
  height: 100%;
  background: var(--item-color, #444);
  border-radius: 2px;
  transition: width 0.3s;
}
.item-stock-count {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.4rem;
  color: var(--item-color, #666);
  white-space: nowrap;
}
.item-stock-count.empty { color: #333; }
.item-stock-label-owned { font-size: 0.38rem; color: var(--item-color); opacity: 0.7; }
.item-stock-label-locked { font-size: 0.38rem; color: #333; }

/* ── Global tooltip (reuse from index.html style) ── */
.items-tooltip-global {
  position: fixed;
  z-index: 9999;
  width: 210px;
  background: #0d1117;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 12px;
  pointer-events: none;
  font-family: 'Pixelify Sans', sans-serif;
}
.items-tooltip-global .tip-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  color: #fff;
  margin-bottom: 2px;
}
.items-tooltip-global .tip-type { font-size: 0.75rem; color: #666; margin-bottom: 6px; }
.items-tooltip-global .tip-divider { border: none; border-top: 1px solid #222; margin: 6px 0; }
.items-tooltip-global .tip-stat { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px; }
.items-tooltip-global .tip-stat-name { color: #888; }
.items-tooltip-global .tip-ability { font-size: 0.75rem; color: #aaa; margin-top: 6px; border-top: 1px solid #1a1a2e; padding-top: 6px; line-height: 1.4; }
.items-tooltip-global .tip-ability b { color: #fee783; display: block; margin-bottom: 4px; }

/* keep navbar + content above bg layer */
nav, main, header, footer, section, .navbar,
.items-hero, .items-filter-bar, .items-grid, .items-tooltip-global {
  position: relative;
  z-index: 1;
}
.navbar { z-index: 100; }
```

- [ ] **Step 2: Commit**

```bash
git add items.css
git commit -m "feat: add items.css for collection page layout"
```

---

## Task 5: Create items.html

**Files:**
- Create: `E:\BINUS\Semester 4\Multimedia\Binusverse\items.html`

- [ ] **Step 1: Create the file**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Item Collection — BINUSVERSE</title>
    <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&family=Press+Start+2P&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="items.css" />
  </head>
  <body>

    <!-- ── NAVBAR ── -->
    <nav class="navbar">
      <div class="logo-left">
        <a href="index.html"><img src="assets/images/SaturBum.png" alt="Logo" /></a>
      </div>
      <div class="hamburger" id="hamburger">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
      <ul class="nav-links" id="navLinks">
        <li><a href="grimoire.html">Grimoire</a></li>
        <li><a href="battle.html">Battle</a></li>
        <li><a href="the_commons.html">The Commons</a></li>
      </ul>
    </nav>

    <!-- ── HERO ── -->
    <div class="items-hero">
      <h1 class="items-hero-title">⚔ ITEM COLLECTION</h1>
      <p class="items-hero-sub">Collect items. Use them in battle. Dominate.</p>
      <div class="items-counter" id="items-counter">0 / 28 DISCOVERED</div>
    </div>

    <!-- ── FILTER TABS ── -->
    <div class="items-filter-bar" id="items-filter-bar">
      <button class="items-filter-btn active" data-rarity="all">ALL</button>
      <button class="items-filter-btn" data-rarity="legendary">◆ LEGENDARY</button>
      <button class="items-filter-btn" data-rarity="epic">★ EPIC</button>
      <button class="items-filter-btn" data-rarity="rare">▲ RARE</button>
      <button class="items-filter-btn" data-rarity="uncommon">● UNCOMMON</button>
      <button class="items-filter-btn" data-rarity="common">· COMMON</button>
    </div>

    <!-- ── ITEM GRID ── -->
    <div class="items-grid" id="items-grid">
      <!-- populated by items.js -->
    </div>

    <!-- ── GLOBAL TOOLTIP ── -->
    <div id="items-global-tooltip" class="items-tooltip-global" style="display:none;"></div>

    <!-- ── SCRIPTS ── -->
    <script src="items-data.js"></script>
    <script src="user-data.js"></script>
    <script src="notifications.js"></script>
    <script src="pixel-bg.js"></script>
    <script src="items.js"></script>

    <link rel="stylesheet" href="index.css" /><!-- reuse navbar styles -->
  </body>
</html>
```

- [ ] **Step 2: Verify page loads**

Open items.html in browser (directly, no splash gate needed). Should show navbar, hero, filter tabs, empty grid, floating particles. No console errors.

- [ ] **Step 3: Commit**

```bash
git add items.html
git commit -m "feat: add items.html collection page scaffold"
```

---

## Task 6: Create items.js — render + filter + tooltip

**Files:**
- Create: `E:\BINUS\Semester 4\Multimedia\Binusverse\items.js`

- [ ] **Step 1: Create the file**

```javascript
/* =====================================================
   items.js — BINUSVERSE Item Collection Page Logic
   Requires: items-data.js, user-data.js (in that order)
===================================================== */
(function () {
  'use strict';

  var RARITY_COLORS = {
    legendary: '#ff9500',
    epic:      '#c084fc',
    rare:      '#00e5ff',
    uncommon:  '#00ff88',
    common:    '#94a3b8',
  };

  /* MAX stock for bar width calculation */
  var MAX_STOCK = 20;

  /* ── Build SVG string ── */
  function buildSVG(svgContent) {
    return '<svg width="72" height="72" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' +
           svgContent + '</svg>';
  }

  /* ── Build one card HTML ── */
  function buildCard(key, def, stock, discovered) {
    var color     = RARITY_COLORS[def.rarity] || '#666';
    var isOwned   = stock > 0;
    var isLocked  = !discovered && !isOwned;

    var rarityClass = 'r-' + def.rarity;
    var lockClass   = isLocked ? ' locked' : '';
    var stockPct    = Math.min(100, (stock / MAX_STOCK) * 100);

    var stockBarHTML = isLocked
      ? '<div class="item-stock-wrap"><span class="item-stock-label-locked">LOCKED</span></div>'
      : '<div class="item-stock-wrap">' +
          '<div class="item-stock-bar-track">' +
            '<div class="item-stock-bar-fill" style="width:' + stockPct + '%"></div>' +
          '</div>' +
          '<span class="item-stock-count' + (stock === 0 ? ' empty' : '') + '">×' + stock + '</span>' +
          (isOwned ? '<span class="item-stock-label-owned">OWNED</span>' : '') +
        '</div>';

    return '<div class="item-card ' + rarityClass + lockClass + '"' +
      ' data-key="' + key + '"' +
      ' data-rarity="' + def.rarity + '"' +
      ' data-color="' + color + '"' +
      ' style="--item-color:' + color + ';--item-glow:' + color + '33">' +
      '<div class="item-rarity-tag">' + def.rarity.toUpperCase() + '</div>' +
      '<div class="item-card-icon">' + buildSVG(def.svgContent) + '</div>' +
      '<div class="item-card-body">' +
        '<div class="item-card-name">' + (isLocked ? '???' : def.name) + '</div>' +
        '<div class="item-card-type">' + (isLocked ? '????' : def.type) + '</div>' +
        '<div class="item-card-ability">' + (isLocked ? '' : def.ability) + '</div>' +
        stockBarHTML +
      '</div>' +
    '</div>';
  }

  /* ── Render all 28 cards ── */
  function renderGrid() {
    var u           = (typeof BVUser !== 'undefined') ? BVUser.load() : { items: {}, discoveredItems: [] };
    var stocks      = u.items || {};
    var discovered  = u.discoveredItems || [];
    /* original 8 always discovered */
    var ORIGINALS   = ['eraser','freeze','retry','xp','shield','gem','warp','focus'];

    var grid   = document.getElementById('items-grid');
    var counter = document.getElementById('items-counter');
    if (!grid) return;

    var html          = '';
    var discoveredCount = 0;

    var keys = Object.keys(ITEMS_REGISTRY);
    keys.forEach(function (key) {
      var def        = ITEMS_REGISTRY[key];
      var stock      = stocks[key] || 0;
      var isOriginal = ORIGINALS.indexOf(key) !== -1;
      var isDiscovered = isOriginal || discovered.indexOf(key) !== -1 || stock > 0;
      if (isDiscovered) discoveredCount++;
      html += buildCard(key, def, stock, isDiscovered);
    });

    grid.innerHTML = html;
    if (counter) counter.textContent = discoveredCount + ' / 28 DISCOVERED';

    initTooltips();
    initFilter();
  }

  /* ── Tooltip ── */
  function initTooltips() {
    var tip = document.getElementById('items-global-tooltip');
    if (!tip) return;

    document.querySelectorAll('.item-card:not(.locked)').forEach(function (card) {
      card.addEventListener('mouseenter', function (e) {
        var key   = card.dataset.key;
        var def   = ITEMS_REGISTRY[key];
        if (!def) return;
        var color = card.dataset.color || '#94a3b8';
        var u     = (typeof BVUser !== 'undefined') ? BVUser.load() : { items: {} };
        var stock = (u.items && u.items[key]) || 0;

        tip.innerHTML =
          '<div class="tip-name">'  + def.name  + '</div>' +
          '<div class="tip-type">'  + def.type  + '</div>' +
          '<div class="tip-divider"></div>' +
          '<div class="tip-stat"><span class="tip-stat-name">' + def.s1 + '</span><span class="tip-stat-val" style="color:' + color + '">' + def.v1 + '</span></div>' +
          '<div class="tip-stat"><span class="tip-stat-name">' + def.s2 + '</span><span class="tip-stat-val" style="color:' + color + '">' + def.v2 + '</span></div>' +
          '<div class="tip-stat"><span class="tip-stat-name">📦 Stock</span><span class="tip-stat-val" style="color:' + color + '">×' + stock + '</span></div>' +
          '<div class="tip-ability"><b>✦ ABILITY</b>' + def.ability + '</div>';

        tip.style.outline = '2px solid ' + color;
        tip.style.display = 'block';
        positionTip(e);
      });

      card.addEventListener('mousemove', positionTip);
      card.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
    });

    function positionTip(e) {
      var tw = tip.offsetWidth  || 210;
      var th = tip.offsetHeight || 150;
      var x  = e.clientX - tw / 2;
      var y  = e.clientY - th - 18;
      if (x < 8) x = 8;
      if (x + tw > window.innerWidth - 8) x = window.innerWidth - tw - 8;
      if (y < 8) y = e.clientY + 18;
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
    }
  }

  /* ── Filter tabs ── */
  function initFilter() {
    var bar = document.getElementById('items-filter-bar');
    if (!bar) return;

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.items-filter-btn');
      if (!btn) return;

      bar.querySelectorAll('.items-filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var rarity = btn.dataset.rarity;
      document.querySelectorAll('.item-card').forEach(function (card) {
        if (rarity === 'all' || card.dataset.rarity === rarity) {
          card.classList.remove('filter-hidden');
        } else {
          card.classList.add('filter-hidden');
        }
      });
    });
  }

  /* ── Hamburger ── */
  function initHamburger() {
    var hb = document.getElementById('hamburger');
    var nl = document.getElementById('navLinks');
    if (hb && nl) {
      hb.addEventListener('click', function () { nl.classList.toggle('active'); });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderGrid();
    initHamburger();
  });

})();
```

- [ ] **Step 2: Verify items.html renders correctly**

Open items.html in browser:
1. Grid shows 28 cards (8 original cards visible/full, 20 new cards locked/greyed)
2. "0 / 28 DISCOVERED" counter shows (original 8 always count as discovered → should show "8 / 28 DISCOVERED")
3. Hover over any non-locked card → tooltip appears with correct name/ability/stock
4. Click "LEGENDARY" filter tab → only legendary cards visible
5. Click "ALL" → all cards visible again

- [ ] **Step 3: Commit**

```bash
git add items.js
git commit -m "feat: add items.js — render 28 item cards with filter and tooltip"
```

---

## Task 7: Update index.css — Rank plate styles

**Files:**
- Modify: `E:\BINUS\Semester 4\Multimedia\Binusverse\index.css`

- [ ] **Step 1: Append rank plate styles to the end of index.css**

```css
/* ═══════════════════════════════════
   RANK ANIMATED PLATE
═══════════════════════════════════ */
@keyframes bvRankPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes bvRankBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

#bv-rank-plate {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 3px;
  margin-top: 12px;
  border: 1px solid var(--rp-color, #555);
  background: var(--rp-bg, rgba(85,85,85,0.08));
  position: relative;
}
/* corner pixel accents */
#bv-rank-plate::before,
#bv-rank-plate::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  background: var(--rp-color, #555);
}
#bv-rank-plate::before { top: -1px; left: -1px; }
#bv-rank-plate::after  { bottom: -1px; right: -1px; }

#bv-rank-plate .rp-icon {
  flex-shrink: 0;
  image-rendering: pixelated;
}
#bv-rank-plate .rp-info { display: flex; flex-direction: column; gap: 2px; }
#bv-rank-plate .rp-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: var(--rp-color, #555);
  letter-spacing: 2px;
}
#bv-rank-plate .rp-xp {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.38rem;
  color: var(--rp-color, #555);
  opacity: 0.6;
}
#bv-rank-plate .rp-max {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.35rem;
  color: var(--rp-color, #fee783);
  letter-spacing: 1px;
  animation: bvRankBlink 1.2s step-end infinite;
}

/* pulse class applied by JS */
#bv-rank-plate.rp-pulse .rp-icon { animation: bvRankPulse var(--rp-speed, 2s) ease-in-out infinite; }
#bv-rank-plate.rp-glow { box-shadow: 0 0 14px var(--rp-glow, transparent); }
```

- [ ] **Step 2: Commit**

```bash
git add index.css
git commit -m "feat: add rank plate CSS animations to index.css"
```

---

## Task 8: Update index.js — injectRankPlate()

**Files:**
- Modify: `E:\BINUS\Semester 4\Multimedia\Binusverse\index.js`

- [ ] **Step 1: Add RANK_PLATE_CFG and injectRankPlate() before populateProfile()**

Insert the following block at the very top of index.js (before `function populateProfile()`):

```javascript
// =============================================
// RANK PLATE — config + injector
// =============================================
var RANK_PLATE_CFG = {
  'Unranked': {
    color: '#555555', bg: 'rgba(85,85,85,0.08)',
    pulse: false, glow: false, speed: null,
    svgIcon:
      '<rect x="2" y="2" width="4" height="4" fill="#555"/>',
  },
  'Bronze': {
    color: '#cd7f32', bg: 'rgba(205,127,50,0.08)',
    pulse: false, glow: false, speed: null,
    svgIcon:
      '<rect x="1" y="0" width="6" height="2" fill="#cd7f32"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#cd7f32"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#cd7f32"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#a0521a"/>' +
      '<rect x="1" y="2" width="2" height="2" fill="#e8a060" opacity="0.5"/>',
  },
  'Silver': {
    color: '#a8a9ad', bg: 'rgba(168,169,173,0.08)',
    pulse: false, glow: false, speed: null,
    svgIcon:
      '<rect x="1" y="0" width="6" height="2" fill="#a8a9ad"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#a8a9ad"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#a8a9ad"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#787878"/>' +
      '<rect x="1" y="2" width="2" height="2" fill="#ddd" opacity="0.5"/>',
  },
  'Gold': {
    color: '#ffd700', bg: 'rgba(255,215,0,0.08)',
    pulse: true, glow: false, speed: '2s',
    svgIcon:
      '<rect x="1" y="0" width="6" height="2" fill="#ffd700"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#ffd700"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#ffd700"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#cc9900"/>' +
      '<rect x="3" y="2" width="2" height="2" fill="#fff" opacity="0.5"/>',
  },
  'Platinum': {
    color: '#e5e4e2', bg: 'rgba(229,228,226,0.08)',
    pulse: true, glow: false, speed: '2s',
    svgIcon:
      '<rect x="1" y="0" width="6" height="1" fill="#e5e4e2"/>' +
      '<rect x="0" y="1" width="8" height="1" fill="#e5e4e2"/>' +
      '<rect x="0" y="2" width="8" height="4" fill="#e5e4e2"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#e5e4e2"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#b0b0b0"/>' +
      '<rect x="2" y="3" width="4" height="1" fill="#fff" opacity="0.5"/>',
  },
  'Diamond': {
    color: '#b9f2ff', bg: 'rgba(185,242,255,0.08)',
    pulse: true, glow: true, speed: '1.4s',
    svgIcon:
      '<rect x="3" y="0" width="2" height="2" fill="#b9f2ff"/>' +
      '<rect x="1" y="2" width="6" height="2" fill="#b9f2ff"/>' +
      '<rect x="0" y="4" width="8" height="2" fill="#7ad0f0"/>' +
      '<rect x="1" y="6" width="6" height="2" fill="#b9f2ff"/>' +
      '<rect x="3" y="7" width="2" height="1" fill="#7ad0f0"/>' +
      '<rect x="2" y="2" width="2" height="2" fill="#fff" opacity="0.5"/>',
  },
  'Legend': {
    color: '#fee783', bg: 'rgba(254,231,131,0.08)',
    pulse: true, glow: true, speed: '0.9s',
    svgIcon:
      '<rect x="0" y="3" width="2" height="2" fill="#fee783"/>' +
      '<rect x="3" y="1" width="2" height="2" fill="#fee783"/>' +
      '<rect x="6" y="3" width="2" height="2" fill="#fee783"/>' +
      '<rect x="0" y="5" width="8" height="3" fill="#fee783"/>' +
      '<rect x="0" y="7" width="8" height="1" fill="#cc9900"/>' +
      '<rect x="1" y="2" width="1" height="1" fill="#fff" opacity="0.6"/>' +
      '<rect x="4" y="1" width="1" height="1" fill="#fff" opacity="0.6"/>',
  },
};

function injectRankPlate(rank, totalXP) {
  var statsCard = document.querySelector('.stats-card');
  if (!statsCard) return;

  var cfg = RANK_PLATE_CFG[rank] || RANK_PLATE_CFG['Unranked'];

  /* build icon SVG */
  var iconSVG =
    '<svg class="rp-icon" width="32" height="32" viewBox="0 0 8 8" ' +
    'xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' +
    cfg.svgIcon + '</svg>';

  /* build plate classes */
  var classes = 'rp-pulse rp-glow';
  var pulseClass = cfg.pulse ? ' rp-pulse' : '';
  var glowClass  = cfg.glow  ? ' rp-glow'  : '';

  /* build max rank line for Legend */
  var maxLine = (rank === 'Legend')
    ? '<div class="rp-max">✦ MAX RANK</div>'
    : '';

  var plateHTML =
    '<div id="bv-rank-plate"' + pulseClass + glowClass + '"' +
    ' style="' +
      '--rp-color:' + cfg.color + ';' +
      '--rp-bg:'    + cfg.bg    + ';' +
      '--rp-glow:'  + (cfg.glow ? cfg.color : 'transparent') + ';' +
      '--rp-speed:' + (cfg.speed || '2s') + '">' +
      iconSVG +
      '<div class="rp-info">' +
        '<div class="rp-name">' + rank.toUpperCase() + '</div>' +
        '<div class="rp-xp">'  + (totalXP || 0) + ' XP</div>' +
        maxLine +
      '</div>' +
    '</div>';

  /* idempotent — replace if exists */
  var existing = document.getElementById('bv-rank-plate');
  if (existing) {
    existing.outerHTML = plateHTML;
  } else {
    statsCard.insertAdjacentHTML('beforeend', plateHTML);
  }

  /* fix class attribute — the string above has a quote issue, rebuild cleanly */
  var plate = document.getElementById('bv-rank-plate');
  if (!plate) return;
  if (cfg.pulse) plate.classList.add('rp-pulse');
  if (cfg.glow)  plate.classList.add('rp-glow');
}
```

- [ ] **Step 2: Call injectRankPlate() from populateProfile()**

Inside `populateProfile()`, find:
```javascript
  set('stat-rank',    u.rank);
```

Add the call directly after it:
```javascript
  set('stat-rank',    u.rank);
  injectRankPlate(u.rank, u.totalXP);
```

- [ ] **Step 3: Fix the plate HTML builder (remove the double-quote issue)**

The `plateHTML` string in step 1 has a minor syntax issue. Replace the plate build block with this corrected version:

```javascript
  var plateHTML =
    '<div id="bv-rank-plate"' +
    ' class="' + (cfg.pulse ? 'rp-pulse' : '') + (cfg.glow ? ' rp-glow' : '') + '"' +
    ' style="' +
      '--rp-color:' + cfg.color + ';' +
      '--rp-bg:'    + cfg.bg    + ';' +
      '--rp-glow:'  + (cfg.glow ? cfg.color : 'transparent') + ';' +
      '--rp-speed:' + (cfg.speed || '2s') + '">' +
      iconSVG +
      '<div class="rp-info">' +
        '<div class="rp-name">' + rank.toUpperCase() + '</div>' +
        '<div class="rp-xp">'  + (totalXP || 0) + ' XP</div>' +
        maxLine +
      '</div>' +
    '</div>';
```

- [ ] **Step 4: Verify rank plate on index.html**

Open index.html in browser. In console, run:
```js
BVUser.reset();
// Reload page — rank should show "Unranked" plate (grey square icon)

// Simulate Gold rank:
var u = BVUser.load(); u.rank = 'Gold'; u.totalXP = 1200; BVUser.save(u); location.reload();
// Plate should show gold shield icon, "GOLD", "1200 XP", slow pulse animation

// Simulate Legend rank:
var u = BVUser.load(); u.rank = 'Legend'; u.totalXP = 7000; BVUser.save(u); location.reload();
// Plate should show crown icon, "LEGEND", "7000 XP", "✦ MAX RANK" blinking, fast pulse + glow
```

- [ ] **Step 5: Commit**

```bash
git add index.js
git commit -m "feat: add animated rank plate to Mission Status in index.js"
```

---

## Self-Review

**Spec coverage:**
- ✅ `items-data.js` registry with 28 items (Task 1)
- ✅ `user-data.js` extended to 28 keys + `discoveredItems` tracking (Task 2)
- ✅ "Expand All" → `items.html` (Task 3)
- ✅ `items.css` — 2-col grid, filter tabs, card states (Task 4)
- ✅ `items.html` — new standalone page (Task 5)
- ✅ `items.js` — render, filter, tooltip (Task 6)
- ✅ Rank plate CSS (Task 7)
- ✅ Rank plate JS injection (Task 8)

**Placeholder scan:** None. All code blocks are complete and executable.

**Type consistency:**
- `ITEMS_REGISTRY[key].svgContent` used in Task 1 → consumed by `buildSVG(def.svgContent)` in Task 6 ✅
- `u.discoveredItems` added in Task 2 → read as `u.discoveredItems` in Task 6 ✅
- `injectRankPlate(u.rank, u.totalXP)` defined in Task 8 → called with `(u.rank, u.totalXP)` ✅
- `RANK_PLATE_CFG` keys match `BVUser.computeRank()` return values: `'Bronze'|'Silver'|'Gold'|'Platinum'|'Diamond'|'Legend'` ✅ (plus `'Unranked'` fallback)
- `items.html` loads scripts in correct order: `items-data.js` → `user-data.js` → `items.js` ✅

**One note:** `items.html` links `index.css` for navbar styles. Ensure `index.css` contains navbar rules (it does — navbar styles are in index.css already).
