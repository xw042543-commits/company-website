import { UNIVERSITY_CATALOG } from "./university-catalog.ts";

type SearchLocale = "en" | "zh";

const COURSE_SUGGESTIONS = {
  en: ["Accounting", "Architecture", "Artificial Intelligence", "Business", "Business Analytics", "Chemical Engineering", "Civil Engineering", "Computer Science", "Cyber Security", "Data Science", "Design", "Economics", "Education", "Electrical and Electronic Engineering", "Engineering", "Engineering Management", "English Language Studies", "Finance", "Hospitality Management", "Information Technology", "Law", "Marketing", "Mechanical Engineering", "Medicine", "Pharmacy", "Psychology", "Software Engineering"],
  zh: ["会计", "建筑学", "人工智能", "商科", "商业分析", "化学工程", "土木工程", "计算机科学", "网络安全", "数据科学", "设计", "经济学", "教育学", "电子与电气工程", "工程", "工程管理", "英语语言", "金融", "酒店管理", "信息技术", "法律", "市场营销", "机械工程", "医学", "药学", "心理学", "软件工程"],
} as const;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function courseSuggestions(locale: SearchLocale): string[] {
  const secondaryLocale: SearchLocale = locale === "zh" ? "en" : "zh";
  return unique([...COURSE_SUGGESTIONS[locale], ...COURSE_SUGGESTIONS[secondaryLocale]]);
}

export function matchingSuggestions(suggestions: string[], query: string, limit = 7): string[] {
  const normalizedQuery = query.normalize("NFKC").trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];

  const fuzzyEnabled = /^[a-z][a-z0-9 ]{3,}$/i.test(normalizedQuery);
  const ranked = suggestions.flatMap((suggestion) => {
    const normalizedSuggestion = suggestion.normalize("NFKC").toLocaleLowerCase();
    if (normalizedSuggestion.startsWith(normalizedQuery)) return [{ suggestion, rank: 0, distance: 0 }];
    if (normalizedSuggestion.includes(normalizedQuery)) return [{ suggestion, rank: 1, distance: 0 }];
    if (!fuzzyEnabled) return [];

    const distances = normalizedSuggestion
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)
      .map(word => editDistance(word, normalizedQuery));
    const distance = Math.min(...distances);
    const maximumDistance = normalizedQuery.length >= 8 ? 2 : 1;
    return distance <= maximumDistance ? [{ suggestion, rank: 2, distance }] : [];
  });

  return ranked
    .sort((a, b) => a.rank - b.rank || a.distance - b.distance || a.suggestion.localeCompare(b.suggestion))
    .slice(0, limit)
    .map(({ suggestion }) => suggestion);
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

export function universitySuggestions(locale: SearchLocale): string[] {
  return unique(UNIVERSITY_CATALOG.flatMap((university) => [
    locale === "zh" ? university.nameZh : university.nameEn,
    ...university.aliases,
    locale === "zh" ? university.countryZh : university.countryEn,
    locale === "zh" ? university.cityZh : university.cityEn,
  ]));
}
