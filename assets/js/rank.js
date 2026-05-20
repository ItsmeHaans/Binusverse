var RANK_ICONS = {
  'Unranked': { color: '#555555', svg: '<rect x="2" y="2" width="4" height="4" fill="#555"/>' },
  'Bronze':   { color: '#cd7f32', svg: '<rect x="1" y="0" width="6" height="2" fill="#cd7f32"/><rect x="0" y="2" width="8" height="4" fill="#cd7f32"/><rect x="1" y="6" width="6" height="2" fill="#cd7f32"/><rect x="3" y="7" width="2" height="1" fill="#a0521a"/><rect x="1" y="2" width="2" height="2" fill="#e8a060" opacity="0.5"/>' },
  'Silver':   { color: '#a8a9ad', svg: '<rect x="1" y="0" width="6" height="2" fill="#a8a9ad"/><rect x="0" y="2" width="8" height="4" fill="#a8a9ad"/><rect x="1" y="6" width="6" height="2" fill="#a8a9ad"/><rect x="3" y="7" width="2" height="1" fill="#787878"/><rect x="1" y="2" width="2" height="2" fill="#ddd" opacity="0.5"/>' },
  'Gold':     { color: '#ffd700', svg: '<rect x="1" y="0" width="6" height="2" fill="#ffd700"/><rect x="0" y="2" width="8" height="4" fill="#ffd700"/><rect x="1" y="6" width="6" height="2" fill="#ffd700"/><rect x="3" y="7" width="2" height="1" fill="#cc9900"/><rect x="3" y="2" width="2" height="2" fill="#fff" opacity="0.5"/>' },
  'Platinum': { color: '#e5e4e2', svg: '<rect x="1" y="0" width="6" height="1" fill="#e5e4e2"/><rect x="0" y="1" width="8" height="1" fill="#e5e4e2"/><rect x="0" y="2" width="8" height="4" fill="#e5e4e2"/><rect x="1" y="6" width="6" height="2" fill="#e5e4e2"/><rect x="3" y="7" width="2" height="1" fill="#b0b0b0"/><rect x="2" y="3" width="4" height="1" fill="#fff" opacity="0.5"/>' },
  'Diamond':  { color: '#b9f2ff', svg: '<rect x="3" y="0" width="2" height="2" fill="#b9f2ff"/><rect x="1" y="2" width="6" height="2" fill="#b9f2ff"/><rect x="0" y="4" width="8" height="2" fill="#7ad0f0"/><rect x="1" y="6" width="6" height="2" fill="#b9f2ff"/><rect x="3" y="7" width="2" height="1" fill="#7ad0f0"/><rect x="2" y="2" width="2" height="2" fill="#fff" opacity="0.5"/>' },
  'Legend':   { color: '#fee783', svg: '<rect x="0" y="3" width="2" height="2" fill="#fee783"/><rect x="3" y="1" width="2" height="2" fill="#fee783"/><rect x="6" y="3" width="2" height="2" fill="#fee783"/><rect x="0" y="5" width="8" height="3" fill="#fee783"/><rect x="0" y="7" width="8" height="1" fill="#cc9900"/><rect x="1" y="2" width="1" height="1" fill="#fff" opacity="0.6"/><rect x="4" y="1" width="1" height="1" fill="#fff" opacity="0.6"/>' },
};

function getRankStyle(rankPoints) {
  if (rankPoints < 300)
    return { label: "Bronze", color: "#cd7f32", bg: "rgba(205,127,50,0.15)" };
  if (rankPoints < 800)
    return { label: "Silver", color: "#a8a9ad", bg: "rgba(168,169,173,0.15)" };
  if (rankPoints < 1800)
    return { label: "Gold", color: "#ffd700", bg: "rgba(255,215,0,0.15)" };
  if (rankPoints < 3500)
    return {
      label: "Platinum",
      color: "#e5e4e2",
      bg: "rgba(229,228,226,0.15)",
    };
  if (rankPoints < 6000)
    return { label: "Diamond", color: "#b9f2ff", bg: "rgba(185,242,255,0.15)" };
  return { label: "Legend", color: "#fee783", bg: "rgba(254,231,131,0.15)" };
}
