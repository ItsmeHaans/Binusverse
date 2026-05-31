(function () {
  /* ── Inject mascot HTML ── */
  var div = document.createElement('div');
  div.className = 'mascot-wrap';
  div.id = 'mascot-wrap';
  div.title = 'Pixel Companion';
  div.innerHTML =
    '<div class="mascot-bubble hidden" id="mascot-bubble"></div>' +
    '<svg class="mascot-svg" viewBox="0 0 32 48" width="80" height="120"' +
    '     xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' +
    '  <rect x="10" y="0"  width="12" height="2"  fill="#6d28d9"/>' +
    '  <rect x="8"  y="2"  width="16" height="2"  fill="#7c3aed"/>' +
    '  <rect x="9"  y="4"  width="14" height="6"  fill="#6d28d9"/>' +
    '  <rect x="10" y="5"  width="2"  height="2"  fill="#fee783"/>' +
    '  <rect x="11" y="6"  width="1"  height="1"  fill="#fff"/>' +
    '  <rect x="5"  y="10" width="22" height="3"  fill="#4c1d95"/>' +
    '  <rect x="9"  y="13" width="14" height="10" fill="#fde68a"/>' +
    '  <rect x="11" y="16" width="3"  height="3"  fill="#1e1b4b"/>' +
    '  <rect x="18" y="16" width="3"  height="3"  fill="#1e1b4b"/>' +
    '  <rect x="12" y="16" width="1"  height="1"  fill="#fff"/>' +
    '  <rect x="19" y="16" width="1"  height="1"  fill="#fff"/>' +
    '  <rect x="13" y="20" width="6"  height="2"  fill="#c2410c"/>' +
    '  <rect x="14" y="21" width="4"  height="1"  fill="#fca5a5"/>' +
    '  <rect x="10" y="23" width="12" height="2"  fill="#fde68a"/>' +
    '  <rect x="11" y="25" width="10" height="1"  fill="#fde68a"/>' +
    '  <rect x="7"  y="26" width="18" height="14" fill="#5b21b6"/>' +
    '  <rect x="6"  y="27" width="2"  height="12" fill="#4c1d95"/>' +
    '  <rect x="24" y="27" width="2"  height="12" fill="#4c1d95"/>' +
    '  <rect x="7"  y="26" width="18" height="2"  fill="#7c3aed"/>' +
    '  <rect x="13" y="28" width="6"  height="12" fill="#6d28d9"/>' +
    '  <rect x="15" y="29" width="2"  height="2"  fill="#fee783"/>' +
    '  <rect x="14" y="30" width="4"  height="1"  fill="#fee783"/>' +
    '  <rect x="15" y="31" width="2"  height="2"  fill="#fee783"/>' +
    '  <rect x="2"  y="27" width="4"  height="3"  fill="#fde68a"/>' +
    '  <rect x="1"  y="28" width="2"  height="10" fill="#92400e"/>' +
    '  <rect x="0"  y="27" width="3"  height="2"  fill="#b45309"/>' +
    '  <rect x="0"  y="22" width="3"  height="3"  fill="#fee783"/>' +
    '  <rect x="1"  y="21" width="1"  height="1"  fill="#fff"/>' +
    '  <rect x="0"  y="25" width="1"  height="2"  fill="#fee783"/>' +
    '  <rect x="2"  y="25" width="1"  height="2"  fill="#fee783"/>' +
    '  <rect x="26" y="27" width="4"  height="3"  fill="#fde68a"/>' +
    '  <rect x="27" y="30" width="3"  height="2"  fill="#fde68a"/>' +
    '  <rect x="9"  y="40" width="5"  height="3"  fill="#1e1b4b"/>' +
    '  <rect x="18" y="40" width="5"  height="3"  fill="#1e1b4b"/>' +
    '  <rect x="8"  y="42" width="6"  height="2"  fill="#4c1d95"/>' +
    '  <rect x="18" y="42" width="6"  height="2"  fill="#4c1d95"/>' +
    '  <rect x="7"  y="38" width="18" height="3"  fill="#4c1d95"/>' +
    '  <rect class="mascot-spark s1" x="28" y="14" width="2" height="2" fill="#fee783"/>' +
    '  <rect class="mascot-spark s2" x="2"  y="18" width="2" height="2" fill="#c084fc"/>' +
    '  <rect class="mascot-spark s3" x="30" y="30" width="2" height="2" fill="#00e5ff"/>' +
    '  <rect class="mascot-spark s4" x="1"  y="10" width="2" height="2" fill="#fee783"/>' +
    '</svg>';
  document.body.appendChild(div);

  /* ── Behaviour ── */
  var TIPS = [
    'Train daily to\nkeep your streak!',
    'Check your\nGrimoire stats!',
    'Battle more to\nlevel up faster!',
    'Weak topics need\nmore practice!',
    'Daily quiz done?\nGood work!',
    'Discuss answers\non The Commons!',
    'Aim for a\n5x streak bonus!',
    'Every battle\ncounts. Keep going!',
  ];
  var timer = null;
  var bubble = document.getElementById('mascot-bubble');

  div.addEventListener('click', function () {
    clearTimeout(timer);
    bubble.innerHTML = TIPS[0 | Math.random() * TIPS.length].replace(/\n/g, '<br>');
    bubble.classList.remove('hidden');
    timer = setTimeout(function () { bubble.classList.add('hidden'); }, 3000);
  });

  setTimeout(function () {
    if (!bubble.classList.contains('hidden')) return;
    bubble.innerHTML = 'Click me!';
    bubble.classList.remove('hidden');
    timer = setTimeout(function () { bubble.classList.add('hidden'); }, 2500);
  }, 4000);
})();
