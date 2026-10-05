import type { Locale } from "./site.ts";

export function programmeDetailPath(
  locale: Locale,
  universitySlug: string,
  programmeIdentifier: string,
) {
  return `/${locale}/universities/${encodeURIComponent(universitySlug)}/programmes/${encodeURIComponent(programmeIdentifier)}`;
}
