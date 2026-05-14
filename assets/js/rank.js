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
