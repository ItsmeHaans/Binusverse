/* =====================================================
   pixel-bg.js — Shared flying pixel background
   BINUSVERSE | matches original index.html particle style
   Self-contained: injects own CSS + DOM, no deps.
===================================================== */
(function () {
  'use strict';

  var css = [
    /* layer */
    '.bv-pixel-bg-layer{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}',

    /* base particle */
    '.bv-pf{position:absolute;image-rendering:pixelated;animation:bvFloatPixel linear infinite;}',

    /* shapes — identical clip-paths to index.css originals */
    '.bv-pf.dm{clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);}',
    '.bv-pf.cr{clip-path:polygon(33% 0%,66% 0%,66% 33%,100% 33%,100% 66%,66% 66%,66% 100%,33% 100%,33% 66%,0 66%,0 33%,33% 33%);}',
    '.bv-pf.tr{clip-path:polygon(50% 0%,100% 100%,0% 100%);}',
    '.bv-pf.hx{clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);}',
    '.bv-pf.pl{clip-path:polygon(40% 0%,60% 0%,60% 40%,100% 40%,100% 60%,60% 60%,60% 100%,40% 100%,40% 60%,0 60%,0 40%,40% 40%);}',
    '.bv-pf.st{clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}',
    '.bv-pf.ar{clip-path:polygon(0% 40%,60% 40%,60% 20%,100% 50%,60% 80%,60% 60%,0% 60%);}',

    /* keyframes — boosted opacity, faster */
    '@keyframes bvFloatPixel{',
      '0%{transform:translateY(0) rotate(0deg);opacity:0;}',
      '8%{opacity:0.55;}',
      '92%{opacity:0.5;}',
      '100%{transform:translateY(-110vh) rotate(380deg);opacity:0;}',
    '}',
    '@keyframes bvFloatSpin{',
      '0%{transform:translateY(0) rotate(0deg);opacity:0;}',
      '8%{opacity:0.6;}',
      '92%{opacity:0.55;}',
      '100%{transform:translateY(-110vh) rotate(720deg);opacity:0;}',
    '}',
    '@keyframes bvFloatDrift{',
      '0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:0;}',
      '8%{opacity:0.5;}',
      '50%{transform:translateY(-55vh) translateX(40px) rotate(180deg);}',
      '92%{opacity:0.45;}',
      '100%{transform:translateY(-110vh) translateX(-20px) rotate(360deg);opacity:0;}',
    '}',

    /* keep content above bg */
    'nav,main,header,footer,section,.navbar{position:relative;z-index:1;}',
    '.navbar{z-index:100;}',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── particles — same mix as original index.html ── */
  var layer = document.createElement('div');
  layer.className = 'bv-pixel-bg-layer';
  layer.setAttribute('aria-hidden', 'true');

  var COLORS  = ['#00c3ff','#fee783','#a855f7','#00ff88','#ff6b6b'];
  var SHAPES  = ['','dm','cr','tr','hx','pl','st','ar'];

  /* original index.html had ~30 hardcoded particles; match that density */
  var PARTICLES = [
    /* SQUARES */
    { shp:'',   col:'#00c3ff', sz:10, dur:9,  del:0,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#fee783', sz:6,  dur:12, del:4,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#a855f7', sz:14, dur:10, del:8,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#00ff88', sz:8,  dur:11, del:2,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#ff6b6b', sz:12, dur:8,  del:11, anim:'bvFloatPixel'  },
    { shp:'',   col:'#00c3ff', sz:7,  dur:13, del:6,  anim:'bvFloatPixel'  },
    /* DIAMONDS */
    { shp:'dm', col:'#fee783', sz:14, dur:11, del:1,  anim:'bvFloatSpin'   },
    { shp:'dm', col:'#00c3ff', sz:10, dur:9,  del:7,  anim:'bvFloatSpin'   },
    { shp:'dm', col:'#a855f7', sz:16, dur:13, del:13, anim:'bvFloatSpin'   },
    { shp:'dm', col:'#ff6b6b', sz:8,  dur:10, del:3,  anim:'bvFloatSpin'   },
    { shp:'dm', col:'#00ff88', sz:12, dur:12, del:9,  anim:'bvFloatSpin'   },
    /* CROSSES */
    { shp:'cr', col:'#00c3ff', sz:16, dur:14, del:5,  anim:'bvFloatDrift'  },
    { shp:'cr', col:'#fee783', sz:12, dur:11, del:14, anim:'bvFloatDrift'  },
    { shp:'cr', col:'#a855f7', sz:18, dur:15, del:2,  anim:'bvFloatDrift'  },
    /* TRIANGLES */
    { shp:'tr', col:'#ff6b6b', sz:14, dur:10, del:10, anim:'bvFloatPixel'  },
    { shp:'tr', col:'#00c3ff', sz:10, dur:9,  del:16, anim:'bvFloatPixel'  },
    { shp:'tr', col:'#fee783', sz:16, dur:12, del:4,  anim:'bvFloatSpin'   },
    /* HEXAGONS */
    { shp:'hx', col:'#00ff88', sz:18, dur:13, del:8,  anim:'bvFloatDrift'  },
    { shp:'hx', col:'#a855f7', sz:12, dur:11, del:15, anim:'bvFloatDrift'  },
    { shp:'hx', col:'#00c3ff', sz:14, dur:10, del:1,  anim:'bvFloatDrift'  },
    /* STARS */
    { shp:'st', col:'#fee783', sz:18, dur:11, del:12, anim:'bvFloatSpin'   },
    { shp:'st', col:'#ff6b6b', sz:14, dur:14, del:6,  anim:'bvFloatSpin'   },
    { shp:'st', col:'#a855f7', sz:20, dur:12, del:18, anim:'bvFloatSpin'   },
    /* PLUS */
    { shp:'pl', col:'#00c3ff', sz:16, dur:13, del:7,  anim:'bvFloatPixel'  },
    { shp:'pl', col:'#00ff88', sz:12, dur:10, del:17, anim:'bvFloatPixel'  },
    { shp:'pl', col:'#fee783', sz:14, dur:9,  del:3,  anim:'bvFloatPixel'  },
    /* ARROWS */
    { shp:'ar', col:'#ff6b6b', sz:20, dur:12, del:11, anim:'bvFloatDrift'  },
    { shp:'ar', col:'#a855f7', sz:16, dur:10, del:5,  anim:'bvFloatDrift'  },
    /* EXTRA randoms */
    { shp:'',   col:'#fee783', sz:8,  dur:11, del:3,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#a855f7', sz:16, dur:8,  del:6,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#00c3ff', sz:10, dur:10, del:1,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#ff6b6b', sz:6,  dur:13, del:8,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#fee783', sz:14, dur:9,  del:4,  anim:'bvFloatSpin'   },
    { shp:'',   col:'#00ff88', sz:8,  dur:11, del:2,  anim:'bvFloatSpin'   },
    { shp:'',   col:'#a855f7', sz:12, dur:10, del:7,  anim:'bvFloatSpin'   },
    { shp:'',   col:'#00c3ff', sz:10, dur:12, del:5,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#ff6b6b', sz:6,  dur:8,  del:9,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#fee783', sz:18, dur:14, del:11, anim:'bvFloatDrift'  },
    { shp:'',   col:'#00ff88', sz:6,  dur:7,  del:13, anim:'bvFloatPixel'  },
    /* EXTRA batch 2 */
    { shp:'dm', col:'#00c3ff', sz:8,  dur:9,  del:2,  anim:'bvFloatSpin'   },
    { shp:'dm', col:'#fee783', sz:12, dur:11, del:14, anim:'bvFloatSpin'   },
    { shp:'tr', col:'#00ff88', sz:10, dur:10, del:7,  anim:'bvFloatPixel'  },
    { shp:'tr', col:'#a855f7', sz:8,  dur:8,  del:3,  anim:'bvFloatSpin'   },
    { shp:'hx', col:'#ff6b6b', sz:10, dur:11, del:6,  anim:'bvFloatDrift'  },
    { shp:'hx', col:'#fee783', sz:16, dur:13, del:11, anim:'bvFloatDrift'  },
    { shp:'st', col:'#00c3ff', sz:12, dur:9,  del:4,  anim:'bvFloatSpin'   },
    { shp:'st', col:'#00ff88', sz:16, dur:12, del:8,  anim:'bvFloatSpin'   },
    { shp:'cr', col:'#ff6b6b', sz:14, dur:13, del:1,  anim:'bvFloatDrift'  },
    { shp:'cr', col:'#00ff88', sz:10, dur:10, del:16, anim:'bvFloatDrift'  },
    { shp:'pl', col:'#ff6b6b', sz:10, dur:11, del:9,  anim:'bvFloatPixel'  },
    { shp:'pl', col:'#a855f7', sz:18, dur:13, del:5,  anim:'bvFloatPixel'  },
    { shp:'ar', col:'#fee783', sz:12, dur:10, del:12, anim:'bvFloatDrift'  },
    { shp:'ar', col:'#00c3ff', sz:14, dur:12, del:3,  anim:'bvFloatDrift'  },
    { shp:'',   col:'#00c3ff', sz:8,  dur:9,  del:15, anim:'bvFloatSpin'   },
    { shp:'',   col:'#fee783', sz:12, dur:10, del:2,  anim:'bvFloatPixel'  },
    { shp:'',   col:'#a855f7', sz:6,  dur:8,  del:10, anim:'bvFloatPixel'  },
    { shp:'',   col:'#ff6b6b', sz:14, dur:11, del:6,  anim:'bvFloatSpin'   },
    { shp:'',   col:'#00ff88', sz:10, dur:9,  del:14, anim:'bvFloatPixel'  },
    { shp:'',   col:'#00c3ff', sz:16, dur:13, del:4,  anim:'bvFloatDrift'  },
    { shp:'dm', col:'#ff6b6b', sz:14, dur:10, del:17, anim:'bvFloatSpin'   },
    { shp:'tr', col:'#fee783', sz:12, dur:11, del:8,  anim:'bvFloatPixel'  },
    { shp:'hx', col:'#00c3ff', sz:8,  dur:9,  del:20, anim:'bvFloatDrift'  },
    { shp:'st', col:'#a855f7', sz:14, dur:12, del:1,  anim:'bvFloatSpin'   },
    { shp:'',   col:'#fee783', sz:6,  dur:8,  del:19, anim:'bvFloatPixel'  },
    { shp:'',   col:'#a855f7', sz:10, dur:10, del:11, anim:'bvFloatSpin'   },
  ];

  /* distribute left positions evenly */
  var count = PARTICLES.length;
  PARTICLES.forEach(function(p, i) {
    var el = document.createElement('div');
    var left = ((i / count) * 100 + Math.random() * (100 / count)).toFixed(1);
    el.className = 'bv-pf' + (p.shp ? ' ' + p.shp : '');
    el.style.cssText =
      'width:'   + p.sz  + 'px;' +
      'height:'  + p.sz  + 'px;' +
      'background:' + p.col + ';' +
      'left:'    + left  + '%;' +
      'top:110%;' +
      'animation:' + p.anim + ' ' + p.dur + 's linear -' + p.del + 's infinite;';
    layer.appendChild(el);
  });

  function inject() {
    if (document.body) {
      document.body.insertBefore(layer, document.body.firstChild);
    }
  }

  if (document.body) {
    inject();
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }

})();
