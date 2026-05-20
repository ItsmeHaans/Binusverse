# BINUSVERSE Phase 2 — Design Spec
**Date:** 2026-05-20
**Status:** Approved

---

## Overview

Phase 2 adds 20 new battle items (28 total), a standalone item collection page (`items.html`), an animated rank plate in Mission Status, and updates the armory "Expand All" link.

---

## 1. Architecture — Approach A (items-data.js registry)

A new `items-data.js` file serves as the single source of truth for all 28 item definitions. It is loaded before `user-data.js` and page scripts on every page that needs item data.

**Files changed/created:**
| File | Change |
|------|--------|
| `items-data.js` | NEW — `ITEMS_REGISTRY` with all 28 items |
| `user-data.js` | Extend `ALL_ITEMS` + `DEFAULT.items` to 28 keys |
| `items.html` | NEW — standalone collection page |
| `items.css` | NEW — styles for items.html |
| `items.js` | NEW — renders grid from registry + BVUser stock counts |
| `index.html` | "Expand All" href → `items.html` only |
| `index.js` | `populateProfile()` injects animated rank plate |
| `index.css` | Rank plate styles + animations |

---

## 2. Data Layer — `items-data.js`

### Structure

```js
var ITEMS_REGISTRY = {
  eraser: {
    name: 'PHANTOM ERASER',
    type: '⚡ Battle Item · Instant',
    rarity: 'legendary',
    ability: 'Instantly wipes 2 wrong answer choices off the screen.',
    s1: '❌ Removes', v1: '2 wrong',
    s2: '🎯 Accuracy', v2: '+60%',
    s3: '📦 Stock',   v3: '0×',   // overwritten at render time
    svgPath: '...',               // inline SVG pixel art
  },
  // ... 27 more entries
};
```

### `user-data.js` changes

- `ALL_ITEMS` array extended from 8 → 28 keys (existing 8 first, then 20 new)
- `DEFAULT.items` extended with 20 new keys defaulting to `0`
- `recordBattle` item reward pool automatically expands (reads `ALL_ITEMS`)
- No other logic changes

---

## 3. `items.html` — Collection Page

### Layout

```
navbar
hero: "⚔ ITEM COLLECTION"  |  "X / 28 collected"
filter tabs: ALL · LEGENDARY · EPIC · RARE · UNCOMMON · COMMON
2-column card grid (all 28 items)
footer
```

### Card states

**Owned (stock ≥ 1):**
- Pixel SVG icon (from ITEMS_REGISTRY)
- Item name + rarity tag + type
- Ability text
- Stock progress bar + `×N` count
- Rarity-colored border

**Unowned (stock = 0, never earned):**
- Greyed-out silhouette icon
- Name shows `???`, ability hidden
- `LOCKED` label, reduced opacity
- Border: `#333`

**Discovered but empty (earned before, now 0 stock):**
- Full card shown (name + ability visible)
- `×0` stock, border dimmed slightly

### Filter behavior
Clicking a rarity tab adds/removes `.hidden` class on non-matching cards. No re-render. Active tab highlighted in rarity color.

### Data flow
```
items-data.js → ITEMS_REGISTRY (definitions)
user-data.js  → BVUser.load().items (stock counts)
items.js      → merges both, renders 28 cards into grid
```

### Includes
- `pixel-bg.js`
- `user-data.js`
- `items-data.js`
- Press Start 2P font
- NO splash redirect guard (items.html accessible directly)
- Same global tooltip system as index.html armory

---

## 4. `index.html` Armory Changes

- **Only change:** `<a class="wide-btn" href="battle.html">Expand All</a>` → `href="items.html"`
- Armory grid stays at 8 hardcoded items (featured showcase, not full collection)
- No HTML restructuring

---

## 5. Rank Animated Plate — `index.html`

### Placement
Injected inside `.stats-card` below the stats grid. Existing `#stat-rank` text element kept but visually hidden (screen readers).

### Plate structure
```
┌──────────────────────────────────┐
│  [8×8 pixel icon]  GOLD   1240RP │  ← rarity-colored border + corner accents
└──────────────────────────────────┘
```

### Per-rank specs
| Rank | Color | Icon shape | Animation |
|------|-------|-----------|-----------|
| Unranked | `#555` | plain square | none |
| Bronze | `#cd7f32` | shield pixel | none |
| Silver | `#a8a9ad` | shield pixel | none |
| Gold | `#ffd700` | shield + star | slow pulse (2s) |
| Platinum | `#e5e4e2` | double shield | slow pulse (2s) |
| Diamond | `#b9f2ff` | diamond pixel | faster pulse (1.4s) + cyan glow |
| Legend | `#fee783` | crown pixel | fast pulse (0.9s) + gold drop-shadow + `✦ MAX RANK` blinks |

### Implementation
- `populateProfile()` in `index.js` calls new `injectRankPlate(rank, totalXP)` function
- Function builds plate HTML string, injects into `.stats-card`
- Idempotent: replaces existing `#bv-rank-plate` if present
- Keyframes added to `index.css`: `bvRankPulse`, `bvRankGlow`

---

## 6. 20 New Items — Full List

| # | Key | Name | Rarity | Type | Ability |
|---|-----|------|--------|------|---------|
| 9 | mirror | MIRROR CLONE | LEGENDARY | Instant | Doubles the effect of your next item used this battle |
| 10 | storm | PIXEL STORM | LEGENDARY | Instant | Eliminates ALL wrong answer choices — only correct remains |
| 11 | oracle | ORACLE CRYSTAL | LEGENDARY | Passive 3Q | Reveals skill category & difficulty of next 3 questions |
| 12 | vortex | VOID VORTEX | EPIC | Instant | Skips current question with no XP gain and no penalty |
| 13 | prism | PRISM LENS | EPIC | Passive 1 round | Splits XP earned equally across AI / Cyber / Data |
| 14 | nova | NOVA BURST | EPIC | Passive 1Q | Next correct answer ×3 XP — timer reduced by 5s |
| 15 | echo | ECHO RUNE | EPIC | Passive 1Q | Correct answer → free retry granted on next question if wrong |
| 16 | compass | COMPASS SHARD | RARE | Passive 1Q | Reveals skill category of next question before it appears |
| 17 | anchor | ANCHOR SEAL | RARE | Passive 1 round | Locks streak — one wrong answer won't break it |
| 18 | lantern | PIXEL LANTERN | RARE | Passive 3Q | Dims one wrong answer choice per question for 3 questions |
| 19 | tome | BATTLE TOME | RARE | Passive battle | +5 seconds to timer for all remaining questions |
| 20 | cipher | CIPHER KEY | RARE | Passive 1Q | Shows EASY / MEDIUM / HARD difficulty before answering |
| 21 | dust | PIXEL DUST | UNCOMMON | Instant | +5 bonus XP on next correct answer |
| 22 | coin | LUCKY COIN | UNCOMMON | Instant | 50% double XP next answer / 50% skip question |
| 23 | badge | SPEED BADGE | UNCOMMON | Passive 1Q | Answer in under 3s → XP doubled |
| 24 | rune | MANA RUNE | UNCOMMON | Instant | Restores 1 use of last item consumed |
| 25 | glitch | GLITCH PATCH | UNCOMMON | Instant | Resets current question timer to full |
| 26 | pouch | ITEM POUCH | COMMON | Passive | Increases max stock capacity for all items by 5 |
| 27 | scroll | QUICK SCROLL | COMMON | Instant | Adds +3 seconds to current question timer |
| 28 | spark | XP SPARK | COMMON | Instant | +2 bonus XP on next answer, correct or wrong |

**Rarity distribution (new 20):** Legendary ×3, Epic ×4, Rare ×5, Uncommon ×5, Common ×3

---

## 7. Constraints

- Pure frontend — no backend, no build system
- All state in `localStorage` via `BVUser` singleton
- No external dependencies beyond existing Google Fonts
- `items.html` requires no splash gate (accessible directly via link)
- `items-data.js` must load before `user-data.js` on pages that use it (script order matters)
