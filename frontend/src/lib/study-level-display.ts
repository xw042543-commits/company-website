import { formatEnglishDisplayText, type Locale } from "./site.ts";

type StudyLevelDisplaySource = {
  code?: string | null;
  nameZh?: string | null;
  nameEn?: string | null;
};

const canonicalChineseNames = {
  diploma: "大专",
  bachelor: "本科",
  master: "硕士",
  doctorate: "博士",
} as const;

function normalized(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("en").replace(/[^a-z\u4e00-\u9fff]/g, "") ?? "";
}

function canonicalLevel(values: Array<string | null | undefined>): keyof typeof canonicalChineseNames | null {
  const candidates = values.map(normalized).filter(Boolean);
  if (candidates.some((value) => value.includes("博士") || value === "phd" || value.includes("doctorate")
    || value.includes("doctoral") || value.includes("doctorofphilosophy"))) return "doctorate";
  if (candidates.some((value) => value.includes("硕士") || value.includes("master"))) return "master";
  if (candidates.some((value) => value.includes("本科") || value.includes("bachelor") || value === "undergraduate")) return "bachelor";
  if (candidates.some((value) => value.includes("大专") || value.includes("文凭") || value.includes("diploma"))) return "diploma";
  return null;
}

export function studyLevelDisplayName(locale: Locale, source: StudyLevelDisplaySource) {
  const key = canonicalLevel([source.code, source.nameZh, source.nameEn]);
  if (locale === "zh" && key) return canonicalChineseNames[key];

  const fallback = locale === "zh"
    ? source.nameZh?.trim() || source.nameEn?.trim() || source.code?.trim() || ""
    : source.nameEn?.trim() || source.nameZh?.trim() || source.code?.trim() || "";
  return locale === "en" ? formatEnglishDisplayText(fallback) : fallback;
}
