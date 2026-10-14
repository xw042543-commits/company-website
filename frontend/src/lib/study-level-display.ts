import { formatEnglishDisplayText } from "./display-text.ts";

type Locale = "zh" | "en";

export type StudyLevelDisplaySource = {
  code?: string | null | undefined;
  nameZh?: string | null | undefined;
  nameEn?: string | null | undefined;
};

export const studyLevelKeys = ["foundation", "diploma", "bachelor", "master", "doctorate"] as const;
export type StudyLevelKey = typeof studyLevelKeys[number];

const canonicalChineseNames: Record<StudyLevelKey, string> = {
  foundation: "预科",
  diploma: "大专",
  bachelor: "本科",
  master: "硕士",
  doctorate: "博士",
};

const canonicalEnglishNames: Record<StudyLevelKey, string> = {
  foundation: "Foundation",
  diploma: "Diploma",
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
};

function normalized(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("en").replace(/[^a-z\u4e00-\u9fff]/g, "") ?? "";
}

export function canonicalStudyLevel(values: Array<string | null | undefined>): StudyLevelKey | null {
  const candidates = values.map(normalized).filter(Boolean);
  for (const value of candidates) {
    if (value.includes("预科") || value.includes("foundation") || value.includes("preuniversity")) return "foundation";
    if (value.includes("博士") || value === "phd" || value.includes("doctorate")
      || value === "doctor" || value.includes("doctoral") || value.includes("doctorofphilosophy")) return "doctorate";
    if (value.includes("硕士") || value.includes("master")) return "master";
    if (value.includes("本科") || value.includes("bachelor") || value === "undergraduate") return "bachelor";
    if (value.includes("大专") || value.includes("文凭") || value.includes("diploma")) return "diploma";
  }
  return null;
}

export function studyLevelDisplayName(locale: Locale, source: StudyLevelDisplaySource) {
  const key = canonicalStudyLevel([source.code, source.nameZh, source.nameEn]);
  if (locale === "zh" && key) return canonicalChineseNames[key];

  const fallback = locale === "zh"
    ? source.nameZh?.trim() || source.nameEn?.trim() || source.code?.trim() || ""
    : source.nameEn?.trim() || source.nameZh?.trim() || source.code?.trim() || "";
  return locale === "en" ? formatEnglishDisplayText(fallback) : fallback;
}

export function canonicalStudyLevelCode(source: StudyLevelDisplaySource): StudyLevelKey | null {
  return canonicalStudyLevel([source.code, source.nameZh, source.nameEn]);
}

export function canonicalStudyLevelOptions() {
  return studyLevelKeys.map((code) => ({
    code,
    nameZh: canonicalChineseNames[code],
    nameEn: canonicalEnglishNames[code],
  }));
}

export function uniqueStudyLevelDisplayNames(locale: Locale, sources: readonly StudyLevelDisplaySource[]) {
  return [...new Set(sources.map((source) => studyLevelDisplayName(locale, source)).filter(Boolean))];
}

export function normalizeStudyLevelOptions<T extends StudyLevelDisplaySource>(sources: readonly T[]): T[] {
  const seen = new Set<string>();
  return sources.flatMap((source) => {
    const identity = canonicalStudyLevelCode(source) ?? (normalized(source.code) || studyLevelDisplayName("zh", source));
    if (!identity || seen.has(identity)) return [];
    seen.add(identity);
    return [{ ...source, nameZh: studyLevelDisplayName("zh", source) }];
  });
}
