/**
 * Maps English award/result labels to Chinese translations.
 * Tournament names are proper nouns and stay in English.
 * Only the result/placement labels get translated.
 */
const awardLabelZh: Record<string, string> = {
  // Placements
  Champion: "冠军",
  "Grand Champion": "总冠军",
  "Co-champion": "联合冠军",
  Finalist: "决赛入围",
  "Grand Finalist": "总决赛入围",
  "Semi-Finalist": "半决赛入围",
  Semifinalist: "半决赛入围",
  "Semi-finalist": "半决赛入围",
  Quarterfinalist: "四分之一决赛入围",
  Octofinalist: "十六强",
  "Runner-up": "亚军",

  // Speaker awards
  "Top Speaker": "最佳演讲者",
  "Top Debater": "最佳辩手",
  "Best Delegate": "最佳代表",
  "Champion Senior Speaker": "高级组最佳演讲者",
  "Champion Junior Speaker": "初级组最佳演讲者",
  "Champion Junior Novice Speaker": "初级新手组最佳演讲者",

  // Numbered placements
  "1st Place": "第一名",
  "1st Place (Prelim)": "第一名（预赛）",
  "2nd Place": "第二名",
  "2nd Speaker": "第二名演讲者",
  "2nd Place Junior Speaker": "初级组第二名演讲者",
  "2nd Place Senior Speaker": "高级组第二名演讲者",
  "3rd Place": "第三名",
  "3rd Speaker": "第三名演讲者",
  "3rd Place Speaker": "第三名演讲者",
  "3rd Place (Ind.)": "第三名（个人）",
  "3rd Place Senior Team": "高级组第三名团队",
  "4th Place": "第四名",
  "4th Place Junior Team": "初级组第四名团队",
  "5th Place": "第五名",
  "5th Place (Ind.)": "第五名（个人）",
  "5th Place Junior Speaker": "初级组第五名演讲者",
  "8th Place Senior Speaker": "高级组第八名演讲者",
  "9th Place": "第九名",
  "9th Place Speaker": "第九名演讲者",

  // Qualifiers
  "Gold Bid": "金牌晋级资格",
  "Nationals Qualifier": "全国赛晋级",
  "Provincial Qualifier": "省级赛晋级",
  "Senior Provincial Qualifier": "高级组省级赛晋级",
  "Junior Champion": "初级组冠军",
  "Senior Grand Finalist": "高级组总决赛入围",
  "Junior Grand Finalist": "初级组总决赛入围",

  // WSC specific
  "1st Place — Team Challenge": "第一名 — 团队挑战赛",
  "1st Place — Team Debate": "第一名 — 团队辩论",
  "1st Place — Sr Writing Scholars": "第一名 — 高级写作学者",
  "1st Place — Tournament of Champions Qualifier": "第一名 — 冠军赛晋级资格",
  "1st Place — Team Qualifiers": "第一名 — 团队晋级资格",
  "1st Place — Debate Champion": "第一名 — 辩论冠军",
  "1st Place — Team Bowl": "第一名 — 团队碗赛",
  "1st Place — Sr Writing Champion": "第一名 — 高级写作冠军",
  "1st Place — Sr Scholars Champion": "第一名 — 高级学者冠军",
  "2nd Place — North American Team": "第二名 — 北美队",
  "2nd Place — Team Challenge": "第二名 — 团队挑战赛",
  "2nd Place — Champion Scholars": "第二名 — 冠军学者",
  "3rd Place — North American Team": "第三名 — 北美队",
  "3rd Place — Sr Team Challenge": "第三名 — 高级团队挑战赛",
  "3rd Place — Team Writing": "第三名 — 团队写作",
  "3rd Place — Team Debate": "第三名 — 团队辩论",
  "Tournament of Champions Qualifiers — All Teams": "冠军赛晋级资格 — 全部团队",
  "Global Qualifiers — All Teams": "全球赛晋级资格 — 全部团队",

  // Writing awards (coach)
  "Writing Award Finalist": "写作奖决赛入围",
};

function normalizeAwardLabel(label: string): string {
  return label.replace(/â€”/g, "—").replace(/\s+/g, " ").trim();
}

const normalizedZhMap = new Map<string, string>(
  Object.entries(awardLabelZh).map(([key, value]) => [normalizeAwardLabel(key).toLowerCase(), value])
);

/**
 * Translate an award/result label based on locale.
 * Returns original English label if no translation found or locale is English.
 */
export function translateAwardLabel(label: string, locale: string): string {
  if (locale !== "zh") return label;
  const normalized = normalizeAwardLabel(label);
  const translated = normalizedZhMap.get(normalized.toLowerCase());
  return translated ?? label;
}

