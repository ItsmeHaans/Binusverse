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
      name: 'PHANTOM ERASER', rarity: 'legendary', itemType: 'battle', color: '#ff9500', desc: 'Eliminates 2 wrong choices',
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
      name: 'TIME FREEZE ORB', rarity: 'epic', itemType: 'battle', color: '#c084fc', desc: '+10 seconds to timer',
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
      name: '2ND CHANCE SCROLL', rarity: 'rare', itemType: 'battle', color: '#00e5ff', desc: 'Retry wrong answer, no penalty',
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
      name: 'XP MAGNET', rarity: 'uncommon', itemType: 'battle', color: '#fee783', desc: '×1.5 XP for this question',
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
      name: 'AEGIS SHIELD', rarity: 'rare', itemType: 'battle', color: '#00ff88', desc: 'Absorb 1 wrong answer — no penalty',
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
      name: 'SOUL GEM', rarity: 'epic', itemType: 'battle', color: '#ff3bff', desc: 'Reveals correct answer for 2s',
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
      name: 'TIME WARP', rarity: 'legendary', itemType: 'battle', color: '#fee783', desc: 'Skip question, marked correct',
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
      name: 'FOCUS POTION', rarity: 'uncommon', itemType: 'battle', color: '#00e5ff', desc: 'Timer paused until you answer',
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
      name: 'MIRROR CLONE', rarity: 'legendary', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'A crystal that echoes the memory of your past battles.',
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
      name: 'PIXEL STORM', rarity: 'legendary', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'A fragment torn from a raid fought in the heart of a digital storm.',
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
      name: 'ORACLE CRYSTAL', rarity: 'legendary', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'An ancient shard humming with knowledge not yet unlocked.',
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
      name: 'VOID VORTEX', rarity: 'epic', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Swirling with energy from a dimension you have not yet mastered.',
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
      name: 'PRISM LENS', rarity: 'epic', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Splits the light of complexity into its simplest components.',
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
      name: 'NOVA BURST', rarity: 'epic', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Left behind after a perfect-score supernova. Rare beyond measure.',
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
      name: 'ECHO RUNE', rarity: 'epic', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Resonates softly with the memory of every correct answer you have given.',
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
      name: 'COMPASS SHARD', rarity: 'rare', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Always points toward the knowledge you have not yet discovered.',
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
      name: 'ANCHOR SEAL', rarity: 'rare', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Grants steadiness when the questions grow difficult and the timer runs low.',
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
      name: 'PIXEL LANTERN', rarity: 'rare', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Illuminates the darkest algorithms for those who carry it.',
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
      name: 'BATTLE TOME', rarity: 'rare', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Its pages rewrite themselves with forgotten patterns every midnight.',
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
      name: 'CIPHER KEY', rarity: 'rare', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Encrypted with wisdom that only the worthy can decode.',
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
      name: 'PIXEL DUST', rarity: 'uncommon', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Residual stardust from a streak of answers answered without hesitation.',
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
      name: 'LUCKY COIN', rarity: 'uncommon', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Currency of the knowledge economy. Spend it wisely.',
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
      name: 'SPEED BADGE', rarity: 'uncommon', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Marks a milestone in your academic expedition through the Binusverse.',
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
      name: 'MANA RUNE', rarity: 'uncommon', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Its power is unknown — even to the rune itself.',
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
      name: 'GLITCH PATCH', rarity: 'uncommon', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'A crack in the Binusverse matrix. Handle with care.',
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
      name: 'ITEM POUCH', rarity: 'common', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Carries small treasures gathered throughout your journey.',
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
      name: 'QUICK SCROLL', rarity: 'common', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'Contains riddles penned by explorers from semesters past.',
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
      name: 'XP SPARK', rarity: 'common', itemType: 'relic',
      type: '✦ Relic · Collectible',
      ability: 'A residual charge from answering at lightning speed.',
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
