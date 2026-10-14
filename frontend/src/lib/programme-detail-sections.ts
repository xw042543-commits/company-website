import type { UniversityProgrammeDetailSection } from "./university-api.ts";

export type LocalizedProgrammeSection = {
  title: string;
  body: string;
  sourceUrl: string | null;
  sourceCheckedAt: string | null;
};

export function findProgrammeSection(
  sections: readonly UniversityProgrammeDetailSection[],
  types: readonly string[],
  locale: "zh" | "en",
): LocalizedProgrammeSection | null {
  const aliases = new Set(types);
  const section = [...sections]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .find((candidate) => aliases.has(candidate.type) && localizedBody(candidate, locale));
  if (!section) return null;

  return {
    title: localizedText(section.titleZh, section.titleEn, locale),
    body: localizedBody(section, locale),
    sourceUrl: officialSourceUrl(section.sourceUrl),
    sourceCheckedAt: section.sourceCheckedAt ?? null,
  };
}

export function findOfficialProgrammeSection(
  sections: readonly UniversityProgrammeDetailSection[],
  types: readonly string[],
  locale: "zh" | "en",
): LocalizedProgrammeSection | null {
  const section = findProgrammeSection(sections, types, locale);
  return section?.sourceUrl ? section : null;
}

export function parseOfficialCurriculumItems(body: string): string[] {
  const items: string[] = [];
  const seen = new Set<string>();
  for (const line of body.split(/\r?\n/)) {
    const explicit = line.trim().match(/^\d{2}\|[^|]+\|([^|]+)$/);
    let value = explicit?.[1]?.trim() || line.trim();
    value = value.replace(/^(?:Year\s+\d+(?:\s*-\s*Year\s+\d+)?\s*)+/i, "").trim();
    if (!value || curriculumBoilerplate(value)) continue;
    const key = value.toLocaleLowerCase("en");
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(value);
  }
  return items;
}

function curriculumBoilerplate(value: string) {
  return /^(?:\d{1,3}[.)]\s*)?(?:\[?select\]?|note:?|next\s*:|year\s*\d+\b|semester\s*\d+\b|option\s*\d+\s*:|#?pre-?requisite|students?\b|compulsory university courses?\b|programme course elective\b|speciali[sz]ation(?:\s*\/| modules?\b| electives?\b)|(?:programme?|program|core|university|univerity|faculty|faculty open|free|open|external faculty|department|clinical) electives?\b|elective(?: courses?)?\b|kursus elektif\b|pilih\b|flexible studies\b|\*{1,2}(?:taken|pass)\b)/i.test(value)
    || /(?:\bchoose\s+(?:any\s+)?(?:one|two|three|four|five|seven|\d+)\b|\brefer to (?:the )?(?:attached )?list\b|\bstudents? (?:are )?required\b|\bsubject to availability\b|\bpilih\b|\brujuk\b|\bsila\b|\bsahaja\b|\bentry requirements?\b|\bminimum (?:average|score|cgpa|grade)\b|\b(?:ielts|toefl|muet)\b|\d+\s*%)/i.test(value)
    || /^参考学习领域|^参考课程结构|^illustrative study areas/i.test(value);
}

function officialSourceUrl(value: string | null | undefined) {
  return value?.startsWith("https://") ? value : null;
}

function localizedBody(section: UniversityProgrammeDetailSection, locale: "zh" | "en") {
  return localizedText(section.bodyZh, section.bodyEn, locale);
}

function localizedText(zh: string | null, en: string | null, locale: "zh" | "en") {
  return locale === "zh"
    ? zh?.trim() || en?.trim() || ""
    : en?.trim() || zh?.trim() || "";
}
