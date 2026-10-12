import type { UniversityProgrammeDetailSection } from "./university-api.ts";

export type LocalizedProgrammeSection = {
  title: string;
  body: string;
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
  };
}

function localizedBody(section: UniversityProgrammeDetailSection, locale: "zh" | "en") {
  return localizedText(section.bodyZh, section.bodyEn, locale);
}

function localizedText(zh: string | null, en: string | null, locale: "zh" | "en") {
  return locale === "zh"
    ? zh?.trim() || en?.trim() || ""
    : en?.trim() || zh?.trim() || "";
}
