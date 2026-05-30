(function () {
  var RANK_COLORS = {
    'Unranked':'#888888','Bronze':'#cd7f32','Silver':'#a8a9ad',
    'Gold':'#ffd700','Platinum':'#e5e4e2','Diamond':'#b9f2ff','Legend':'#fee783'
  };

  var ITEM_LABELS = {
    eraser:'Phantom Eraser', freeze:'Time Freeze Orb', retry:'2nd Chance Scroll',
    xp:'XP Magnet', shield:'Aegis Shield', gem:'Soul Gem', warp:'Time Warp', focus:'Focus Potion',
    mirror:'Mirror Relic', storm:'Storm Relic', oracle:'Oracle Relic', vortex:'Vortex Relic',
    prism:'Prism Relic', nova:'Nova Relic', echo:'Echo Relic', compass:'Compass Relic',
    anchor:'Anchor Relic', lantern:'Lantern Relic', tome:'Tome Relic', cipher:'Cipher Relic',
    dust:'Dust Relic', coin:'Coin Relic', badge:'Badge Relic', rune:'Rune Relic',
    glitch:'Glitch Relic', pouch:'Pouch Relic', scroll:'Scroll Relic', spark:'Spark Relic',
  };

  function $(id) { return document.getElementById(id); }

  function spawnStars(count) {
    var w = $('result-stars');
    if (!w) return;
    var colors = ['#fee783','#00ff88','#00e5ff','#ff9500','#ff3bff'];
    for (var i = 0; i < count; i++) {
      var s = document.createElement('div');
      var color = colors[Math.floor(Math.random() * colors.length)];
      s.style.cssText = [
        'position:absolute',
        'left:' + Math.random() * 100 + '%',
        'top:' + Math.random() * 100 + '%',
        'width:3px', 'height:3px',
        'background:' + color,
        'animation:rs-float ' + (1.5 + Math.random() * 2) + 's ease-in-out ' + (Math.random() * 1.5) + 's infinite',
        'opacity:0',
      ].join(';');
      w.appendChild(s);
    }
  }

  /* inject star float animation */
  var sty = document.createElement('style');
  sty.textContent = '@keyframes rs-float{0%,100%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:1;transform:translateY(-10px) scale(1)}80%{opacity:.6;transform:translateY(-20px) scale(.7)}}';
  document.head.appendChild(sty);

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof BVUser === 'undefined') {
      window.location.href = 'battle.html';
      return;
    }

    var u = BVUser.load();
    var r = u.lastResult;

    if (!r) {
      window.location.href = 'battle.html';
      return;
    }

    /* mode label */
    var modeEl = $('mode-label');
    if (r.mode === 'daily') {
      modeEl.textContent = '📅 DAILY MISSION';
    } else {
      var diff = (r.difficulty || 'easy').toUpperCase();
      modeEl.textContent = '⚔ RAID — ' + diff;
      var diffColors = { EASY:'#00ff88', NORMAL:'#ffd000', HARD:'#ff4d4d' };
      modeEl.style.color = diffColors[diff] || '#00e5ff';
      modeEl.style.borderColor = (diffColors[diff] || '#00e5ff') + '44';
    }

    /* title */
    var titleEl = $('result-title');
    var rankLetter = (r.rank || 'D').toUpperCase();
    if (r.mode === 'daily') {
      titleEl.textContent = 'DAILY CLEARED!';
      titleEl.classList.add('cleared');
    } else if (r.won) {
      titleEl.textContent = 'RAID CLEARED!';
      titleEl.classList.add('cleared');
    } else {
      titleEl.textContent = 'RAID FAILED';
      titleEl.classList.add('lose');
    }

    /* rank badge */
    var badgeEl = $('rank-badge');
    var rankMap = { S:'★ S RANK', A:'★ A RANK', B:'★ B RANK', C:'★ C RANK', D:'★ D RANK' };
    badgeEl.textContent = rankMap[rankLetter] || '★ D RANK';
    badgeEl.className = 'rank-badge ' + rankLetter.toLowerCase();

    /* stats */
    $('stat-correct').textContent = r.correct || 0;
    $('stat-wrong').textContent = (r.total - r.correct) || 0;
    $('stat-xp').textContent = '+' + (r.earnedXP || 0) + ' XP';

    /* level up */
    if (r.levelAfter && r.levelBefore && r.levelAfter > r.levelBefore) {
      var lvBanner = $('level-up-banner');
      lvBanner.style.display = '';
      $('level-up-text').textContent = 'LEVEL UP!  Lv' + r.levelBefore + ' → Lv' + r.levelAfter;
    }

    /* rank up */
    if (r.rankAfter && r.rankBefore && r.rankAfter !== r.rankBefore && r.rankAfter !== 'Unranked') {
      var rkBanner = $('rank-up-banner');
      rkBanner.style.display = '';
      var rkColor = RANK_COLORS[r.rankAfter] || '#fee783';
      rkBanner.style.color = rkColor;
      rkBanner.style.borderColor = rkColor + '44';
      $('rank-up-text').textContent = 'RANK UP!  ' + r.rankBefore + ' → ' + r.rankAfter;
    }

    /* item earned */
    if (r.earnedItem) {
      var itemEl = $('item-earned');
      itemEl.style.display = '';
      $('item-name').textContent = ITEM_LABELS[r.earnedItem] || r.earnedItem;
    }

    /* stars */
    var starCount = rankLetter === 'S' ? 40 : rankLetter === 'A' ? 28 : rankLetter === 'B' ? 18 : 10;
    spawnStars(starCount);

    /* buttons */
    $('btn-again').addEventListener('click', function () {
      var href = r.mode === 'raid'
        ? 'battle-play.html?mode=raid&difficulty=' + (r.difficulty || 'easy')
        : 'battle-play.html?mode=daily';
      window.location.href = href;
    });
    $('btn-home').addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  });
})();
