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
  return [...COURSE_SUGGESTIONS[locale]];
}

export function matchingSuggestions(suggestions: string[], query: string, limit = 7): string[] {
  const normalizedQuery = query.normalize("NFKC").trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];
  return suggestions
    .filter(suggestion => suggestion.normalize("NFKC").toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const aStarts = a.normalize("NFKC").toLocaleLowerCase().startsWith(normalizedQuery);
      const bStarts = b.normalize("NFKC").toLocaleLowerCase().startsWith(normalizedQuery);
      return Number(bStarts) - Number(aStarts) || a.localeCompare(b);
    })
    .slice(0, limit);
}

export function universitySuggestions(locale: SearchLocale): string[] {
  return unique(UNIVERSITY_CATALOG.flatMap((university) => [
    locale === "zh" ? university.nameZh : university.nameEn,
    ...university.aliases,
    locale === "zh" ? university.countryZh : university.countryEn,
    locale === "zh" ? university.cityZh : university.cityEn,
  ]));
}
