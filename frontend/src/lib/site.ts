export type Locale = "zh" | "en";
export const isLocale = (value: string): value is Locale => value === "zh" || value === "en";
export const words = (locale: Locale, zh: string, en: string) => locale === "zh" ? zh : en;
export const navigation = [
  ["", "首页", "Home"], ["planning", "规划", "Planning"],
  ["universities", "院校一览", "Universities"], ["language", "语言", "Language"],
  ["scholarships", "奖学金", "Scholarships"], ["programmes", "留学项目", "Study abroad programmes"],
  ["news", "新闻", "News"], ["about", "关于我们", "About us"],
] as const;
export const levels = [
  ["foundation", "预科", "Foundation"], ["bachelor", "本科", "Bachelor’s"],
  ["master", "硕士", "Master’s"], ["doctorate", "博士", "Doctorate"],
] as const;
export const countries = [
  ["GB", "英国", "United Kingdom"], ["US", "美国", "United States"],
  ["AU", "澳大利亚", "Australia"], ["CA", "加拿大", "Canada"],
  ["NZ", "新西兰", "New Zealand"], ["SG", "新加坡", "Singapore"],
  ["JP", "日本", "Japan"], ["KR", "韩国", "South Korea"], ["MY", "马来西亚", "Malaysia"],
] as const;
export const continents = [
  ["EU", "欧洲", "Europe"], ["NA", "北美洲", "North America"],
  ["SA", "南美洲", "South America"], ["AS", "亚洲", "Asia"],
  ["AF", "非洲", "Africa"], ["OC", "大洋洲", "Oceania"],
] as const;
export type Query = Record<string, string | string[] | undefined>;
export const first = (query: Query, name: string) => {
  const value = query[name];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
};
export const pageNumber = (value: string) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : 1;
export function pageLink(path: string, query: Query, page: number) {
  const params = new URLSearchParams();
  for (const key of Object.keys(query)) {
    const value = first(query, key);
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return `${path}?${params}`;
}
