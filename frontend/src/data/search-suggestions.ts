import { UNIVERSITY_CATALOG } from "./university-catalog.ts";

type SearchLocale = "en" | "zh";

const COURSE_SUGGESTIONS = {
  en: ["Accounting", "Architecture", "Artificial Intelligence", "Business", "Computer Science", "Data Science", "Design", "Economics", "Education", "Engineering", "Finance", "Hospitality", "Information Technology", "Law", "Marketing", "Medicine", "Pharmacy", "Psychology"],
  zh: ["会计", "建筑学", "人工智能", "商科", "计算机科学", "数据科学", "设计", "经济学", "教育学", "工程", "金融", "酒店管理", "信息技术", "法律", "市场营销", "医学", "药学", "心理学"],
} as const;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function courseSuggestions(locale: SearchLocale): string[] {
  return [...COURSE_SUGGESTIONS[locale]];
}

export function universitySuggestions(locale: SearchLocale): string[] {
  return unique(UNIVERSITY_CATALOG.flatMap((university) => [
    locale === "zh" ? university.nameZh : university.nameEn,
    ...university.aliases,
    locale === "zh" ? university.countryZh : university.countryEn,
    locale === "zh" ? university.cityZh : university.cityEn,
  ]));
}
