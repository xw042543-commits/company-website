import { createHash } from "node:crypto";
import { jsonLdOf, plainText } from "./html.ts";
import type { Evidence, PageSnapshot, ProgrammeCandidate, SourceDefinition, UniversityCandidate } from "./types.ts";

type JsonObject = Record<string, unknown>;

export function extractUniversity(page: PageSnapshot, source: SourceDefinition): UniversityCandidate {
  const nodes = jsonLdOf(page.html).filter(isOrganization);
  const node = (nodes[0] ?? {}) as JsonObject;
  const name = text(node.name) ?? source.displayName;
  const description = nodes.length ? text(node.description) : null;
  const logo = urlText(node.logo, page.url);
  const address = firstObject(node.address);
  const city = text(address?.addressLocality);
  const country = text(address?.addressCountry) ?? source.countryRaw;
  const evidence: Evidence[] = [evidenceOf(page, "name", name)];
  if (description) evidence.push(evidenceOf(page, "description", description));
  if (city) evidence.push(evidenceOf(page, "city", city));
  if (text(address?.addressCountry)) evidence.push(evidenceOf(page, "countryRaw", text(address?.addressCountry)!));
  return {
    candidateId: stableId("university", source.sourceKey), universityCode: null,
    ...splitLanguage(name, "name"), countryCode: null, countryRaw: country,
    ...splitLanguage(city, "city"), ...splitLanguage(description, "description"),
    popular: null, status: "DRAFT", campusRaw: null, officialWebsite: new URL(page.url).origin,
    logoSourceUrl: logo, logoLicenceRaw: null, partnerInstitution: null,
    partnershipStatementRaw: null, lastCheckedAt: page.fetchedAt, reviewer: null, evidence,
  };
}

export function extractProgrammes(page: PageSnapshot, source: SourceDefinition): ProgrammeCandidate[] {
  const structured = jsonLdOf(page.html).filter(isProgramme).map((node, index) => programmeFromNode(node as JsonObject, page, source, index));
  const siteSpecific = source.sourceKey === "taylors-university"
    ? extractTaylorsListing(page, source)
    : source.sourceKey === "university-of-malaya" ? extractUmListing(page, source) : [];
  return mergeProgrammeCandidates([...structured, ...siteSpecific]);
}

function extractUmListing(page: PageSnapshot, source: SourceDefinition): ProgrammeCandidate[] {
  const candidates: ProgrammeCandidate[] = [];
  const faculty = plainText(page.html.match(/my-bc-item\s+my-bc-active[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "") || null;
  const cardPattern = /<div\b[^>]*class=["'][^"']*\bcourse-card\b[^"']*["'][^>]*>[\s\S]*?<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/div>/gi;
  for (const match of page.html.matchAll(cardPattern)) {
    const name = plainText(match[3]);
    if (!/^Bachelor\b|^Doctor of Medicine\b/i.test(name)) continue;
    let detailUrl: string;
    try { detailUrl = new URL(decodeAttribute(match[1] ?? match[2]), page.url).href; } catch { continue; }
    candidates.push(programmeFromExplicitPage({ name, description: null, studyLevelRaw: "Undergraduate", subjectCategoryRaw: faculty, detailUrl }, page, source, candidates.length));
  }
  return candidates;
}

function extractTaylorsListing(page: PageSnapshot, source: SourceDefinition): ProgrammeCandidate[] {
  const candidates: ProgrammeCandidate[] = [];
  const anchorPattern = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of page.html.matchAll(anchorPattern)) {
    let url: URL;
    try { url = new URL(decodeAttribute(match[1] ?? match[2]), page.url); } catch { continue; }
    if (!url.pathname.includes("/explore-all-programmes/") || !url.pathname.includes("/undergraduate/")) continue;
    const body = match[3]; const heading = body.match(/<h[2-5]\b[^>]*>([\s\S]*?)<\/h[2-5]>/i);
    const name = heading ? plainText(heading[1]) : null;
    if (!name || !/\b(?:Bachelor|MBBS|Doctor of Medicine)\b/i.test(name)) continue;
    const paragraph = body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i); const description = paragraph ? plainText(paragraph[1]) : null;
    candidates.push(programmeFromExplicitPage({ name, description, studyLevelRaw: "Undergraduate", detailUrl: url.href }, page, source, candidates.length));
  }
  return candidates;
}

function programmeFromExplicitPage(value: { name: string; description: string | null; studyLevelRaw: string | null; subjectCategoryRaw?: string | null; detailUrl: string }, page: PageSnapshot, source: SourceDefinition, index: number): ProgrammeCandidate {
  const evidence = [evidenceOf(page, "name", value.name), evidenceOf(page, "detailUrl", value.detailUrl)];
  if (value.description) evidence.push(evidenceOf(page, "description", value.description));
  if (value.studyLevelRaw) evidence.push(evidenceOf(page, "studyLevelRaw", value.studyLevelRaw));
  return {
    candidateId: stableId("programme", `${source.sourceKey}|${value.detailUrl}|${value.name}`), programmeCode: null, universityCode: null,
    ...splitLanguage(value.name, "name"), subjectCategoryCode: null, subjectCategoryRaw: value.subjectCategoryRaw ?? null,
    studyLevelCode: null, studyLevelRaw: value.studyLevelRaw, courseModeCode: null, courseModeRaw: null,
    durationDisplay: null, durationMonths: null, ...splitLanguage(value.description, "description"), status: "DRAFT",
    tuition: { min: null, max: null, currency: null, display: null, feePeriod: "UNKNOWN", rmbMin: null, rmbMax: null, exchangeRate: null, exchangeRateDate: null, totalRmbMin: null, totalRmbMax: null },
    languages: [], intakes: [], evidence,
  };
}

function programmeFromNode(node: JsonObject, page: PageSnapshot, source: SourceDefinition, index: number): ProgrammeCandidate {
  const name = text(node.name);
  if (!name) throw new Error("课程结构化数据缺少名称");
  const description = text(node.description);
  const duration = text(node.timeToComplete) ?? text(node.duration);
  const attendance = text(node.attendanceMode);
  const category = text(node.educationalLevel) ?? text(node.programType);
  const languages = stringList(node.inLanguage).map((rawText) => ({ code: null, rawText }));
  const offer = firstObject(node.offers);
  const price = numeric(offer?.price); const lowPrice = numeric(offer?.lowPrice) ?? price; const highPrice = numeric(offer?.highPrice) ?? price;
  const currency = text(offer?.priceCurrency);
  const intakes = extractIntakes(node);
  const evidence = [evidenceOf(page, "name", name)];
  for (const [field, value] of [["description", description], ["durationDisplay", duration], ["courseModeRaw", attendance], ["studyLevelRaw", category], ["tuition", lowPrice === null && highPrice === null ? null : `${lowPrice ?? ""}${lowPrice !== highPrice && highPrice !== null ? `–${highPrice}` : ""} ${currency ?? ""}`.trim()]] as const) {
    if (value !== null) evidence.push(evidenceOf(page, field, String(value)));
  }
  return {
    candidateId: stableId("programme", `${source.sourceKey}|${urlText(node.url, page.url) ?? page.url}|${name}`),
    programmeCode: null, universityCode: null, ...splitLanguage(name, "name"),
    subjectCategoryCode: null, subjectCategoryRaw: null, studyLevelCode: null, studyLevelRaw: category,
    courseModeCode: null, courseModeRaw: attendance, durationDisplay: duration, durationMonths: null,
    ...splitLanguage(description, "description"), status: "DRAFT",
    tuition: { min: lowPrice, max: highPrice, currency, display: lowPrice === null && highPrice === null ? null : `${lowPrice ?? ""}${lowPrice !== highPrice && highPrice !== null ? `–${highPrice}` : ""} ${currency ?? ""}`.trim(), feePeriod: "UNKNOWN", rmbMin: null, rmbMax: null, exchangeRate: null, exchangeRateDate: null, totalRmbMin: null, totalRmbMax: null },
    languages, intakes, evidence,
  };
}

function isOrganization(value: unknown): boolean {
  const types = stringList((value as JsonObject)?.["@type"]);
  return types.some((type) => ["CollegeOrUniversity", "EducationalOrganization", "Organization"].includes(type));
}

function isProgramme(value: unknown): boolean {
  const types = stringList((value as JsonObject)?.["@type"]);
  return types.some((type) => ["Course", "EducationalOccupationalProgram"].includes(type));
}

function splitLanguage<T extends "name" | "description" | "city">(value: string | null, prefix: T): Record<`${T}Zh` | `${T}En`, string | null> {
  const chinese = value !== null && /[\u3400-\u9fff]/u.test(value);
  return { [`${prefix}Zh`]: chinese ? value : null, [`${prefix}En`]: chinese ? null : value } as Record<`${T}Zh` | `${T}En`, string | null>;
}

function stableId(kind: string, value: string): string { return `${kind}_${createHash("sha256").update(value).digest("hex").slice(0, 16)}`; }
function evidenceOf(page: PageSnapshot, field: string, rawText: string): Evidence { return { sourceUrl: page.url, fetchedAt: page.fetchedAt, field, rawText: plainText(rawText).slice(0, 4000) }; }
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? plainText(value) : null; }
function numeric(value: unknown): number | null { const result = typeof value === "number" ? value : typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value.trim()) ? Number(value) : null; return result !== null && Number.isFinite(result) && result >= 0 ? result : null; }
function stringList(value: unknown): string[] { return Array.isArray(value) ? value.map(text).filter((item): item is string => item !== null) : text(value) ? [text(value)!] : []; }
function firstObject(value: unknown): JsonObject | null { const item = Array.isArray(value) ? value[0] : value; return item && typeof item === "object" ? item as JsonObject : null; }
function urlText(value: unknown, base: string): string | null { const raw = typeof value === "object" && value ? text((value as JsonObject).url) : text(value); try { return raw ? new URL(raw, base).href : null; } catch { return null; } }
function extractIntakes(node: JsonObject): Array<{ displayText: string; date: string | null }> {
  const values = [node.startDate, ...objects(node.hasCourseInstance).map((item) => item.startDate)].flatMap(stringList);
  return [...new Set(values)].map((displayText) => ({ displayText, date: /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(displayText) ? displayText.slice(0, 10) : null }));
}
function objects(value: unknown): JsonObject[] { return (Array.isArray(value) ? value : value ? [value] : []).filter((item): item is JsonObject => typeof item === "object" && item !== null); }
function decodeAttribute(value: string): string { return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, "\"").replace(/&#39;|&apos;/gi, "'"); }
function deduplicate<T>(items: T[], key: (item: T) => string): T[] { const seen = new Set<string>(); return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; }); }

export function mergeProgrammeCandidates(items: ProgrammeCandidate[]): ProgrammeCandidate[] {
  const merged = new Map<string, ProgrammeCandidate>();
  for (const item of items) {
    const current = merged.get(item.candidateId);
    if (!current) { merged.set(item.candidateId, item); continue; }
    for (const key of ["nameZh", "nameEn", "subjectCategoryRaw", "studyLevelRaw", "courseModeRaw", "durationDisplay", "durationMonths", "descriptionZh", "descriptionEn"] as const) {
      if (current[key] === null && item[key] !== null) (current as Record<string, unknown>)[key] = item[key];
    }
    for (const key of ["min", "max", "currency", "display", "rmbMin", "rmbMax", "exchangeRate", "exchangeRateDate", "totalRmbMin", "totalRmbMax"] as const) {
      if (current.tuition[key] === null && item.tuition[key] !== null) (current.tuition as Record<string, unknown>)[key] = item.tuition[key];
    }
    current.languages = deduplicate([...current.languages, ...item.languages], (entry) => entry.rawText);
    current.intakes = deduplicate([...current.intakes, ...item.intakes], (entry) => `${entry.displayText}|${entry.date}`);
    current.evidence = deduplicate([...current.evidence, ...item.evidence], (entry) => `${entry.field}|${entry.sourceUrl}|${entry.rawText}`);
  }
  return [...merged.values()];
}
