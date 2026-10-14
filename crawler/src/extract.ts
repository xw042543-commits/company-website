import { createHash } from "node:crypto";
import { decodeHtml, jsonLdOf, plainText } from "./html.ts";
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
    ? [...extractTaylorsListing(page, source), ...extractTaylorsDetail(page, source)]
    : source.sourceKey === "university-of-malaya" ? [...extractUmListing(page, source), ...extractUmDetail(page, source)] : [];
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

function extractUmDetail(page: PageSnapshot, source: SourceDefinition): ProgrammeCandidate[] {
  const name = plainText(page.html.match(/<h3\b[^>]*>[\s\S]*?<strong\b[^>]*>([\s\S]*?)<\/strong>[\s\S]*?<\/h3>/i)?.[1] ?? "");
  const overviewHtml = umSection(page.html, "Programme Overview");
  if (!name || !overviewHtml || !/^(?:Bachelor|Doctor of Medicine)\b/i.test(name)) return [];

  const overviewText = structuredText(overviewHtml);
  const durationDisplay = overviewText.match(/Duration:\s*([^\n]+)/i)?.[1]?.trim() ?? null;
  let descriptionText = overviewText.replace(/Duration:\s*[^\n]+/i, "").trim();
  let curriculum = structuredText(umSection(page.html, "Programme Structure") ?? "");
  // A small number of UM pages place the year-by-year structure inside the
  // overview block without a Programme Structure heading. Keep that official
  // material, but do not mix it into the programme description.
  if (!curriculum) {
    const embeddedStructure = descriptionText.match(/\n(?=Year\s+1(?:\s+Year\s+2)+\b)/i);
    if (embeddedStructure?.index !== undefined) {
      curriculum = descriptionText.slice(embeddedStructure.index + 1).trim();
      descriptionText = descriptionText.slice(0, embeddedStructure.index).trim();
    }
  }
  const description = descriptionText || null;
  const career = structuredText(umSection(page.html, "Career Prospects") ?? "");
  const tuitionHtml = umSection(page.html, "Tuition Fee") ?? "";
  const internationalTuition = tuitionHtml.match(/International[\s\S]*?<p\b[^>]*>\s*(RM\s*[\d,]+(?:\.\d{1,2})?)/i)?.[1] ?? null;
  const tuitionAmount = internationalTuition ? Number(internationalTuition.replace(/[^\d.]/g, "")) : null;
  const intakeText = structuredText(umSection(page.html, "Intake") ?? "");
  const intakes = intakeText.split("\n").map((value) => value.trim())
    .filter((value) => /\bIntake\b/i.test(value) && !/^Note:/i.test(value) && value.length <= 100)
    .map((displayText) => ({ displayText, date: null }));
  const entryHtml = umSection(page.html, "Entry Requirement") ?? "";
  const internationalEntry = structuredText(entryHtml.split(/<!--\s*INTERNATIONAL\s*-->/i)[1] ?? entryHtml);
  const englishHtml = umSection(page.html, "English Language Requirements") ?? "";
  const internationalEnglish = structuredText(englishHtml.match(/id=["']english2["'][^>]*>([\s\S]*)/i)?.[1] ?? englishHtml);
  const admissions = [internationalEntry, internationalEnglish && `English language requirements\n${internationalEnglish}`].filter(Boolean).join("\n\n");
  const faculty = plainText(page.html.match(/my-bc-item[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>[\s\S]*?<li\b[^>]*class=["'][^"']*my-bc-active/i)?.[1] ?? "") || null;
  const evidence: Evidence[] = [evidenceOf(page, "name", name), evidenceOf(page, "officialUrl", page.url)];
  for (const [field, value] of [["description", description], ["durationDisplay", durationDisplay], ["tuition", internationalTuition], ["intakes", intakeText], ["admissions", admissions], ["curriculum", curriculum], ["careerOpportunities", career]] as const) {
    if (value) evidence.push(evidenceOf(page, field, value));
  }
  const sections: ProgrammeCandidate["sections"] = [];
  if (admissions) sections.push({ type: "ADMISSIONS", titleRaw: "Entry Requirement", bodyRaw: admissions, sourceUrl: page.url, sourceCheckedAt: page.fetchedAt });
  if (curriculum) sections.push({ type: "CURRICULUM", titleRaw: "Programme Structure", bodyRaw: curriculum, sourceUrl: page.url, sourceCheckedAt: page.fetchedAt });
  if (career) sections.push({ type: "CAREER_OPPORTUNITIES", titleRaw: "Career Prospects", bodyRaw: career, sourceUrl: page.url, sourceCheckedAt: page.fetchedAt });
  return [{
    candidateId: stableId("programme", `${source.sourceKey}|${page.url.toLocaleLowerCase("en")}`), programmeCode: null, universityCode: null,
    ...splitLanguage(name, "name"), subjectCategoryCode: null, subjectCategoryRaw: faculty,
    studyLevelCode: null, studyLevelRaw: "Undergraduate", courseModeCode: null,
    courseModeRaw: durationDisplay?.match(/Full[ -]?time/i)?.[0] ?? null,
    durationDisplay, durationMonths: durationMonths(durationDisplay), ...splitLanguage(description, "description"), officialUrl: page.url, status: "DRAFT",
    tuition: { min: tuitionAmount, max: tuitionAmount, currency: tuitionAmount === null ? null : "MYR", display: internationalTuition, feePeriod: "UNKNOWN", rmbMin: null, rmbMax: null, exchangeRate: null, exchangeRateDate: null, totalRmbMin: null, totalRmbMax: null },
    languages: [], intakes, sections, evidence,
  }];
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

function extractTaylorsDetail(page: PageSnapshot, source: SourceDefinition): ProgrammeCandidate[] {
  if (!/\/explore-all-programmes\/[^/]+\/undergraduate\/[^/]+\.html$/i.test(new URL(page.url).pathname)) return [];
  const name = page.title?.split(/\s+\|\s+/)[0]?.trim() ?? null;
  if (!name || !/\b(?:Bachelor|Diploma|American Degree Transfer Program|Intensive English)\b/i.test(name)) return [];
  const candidate = programmeFromExplicitPage({ name, description: null, studyLevelRaw: "Undergraduate", detailUrl: page.url }, page, source, 0);
  const overview = structuredText(htmlSectionById(page.html, "overview") ?? "");
  const curriculum = cleanSectionHeading(structuredText(htmlSectionById(page.html, "programme-structure") ?? ""), "Programme Structure");
  const admissions = cleanSectionHeading(structuredText(htmlSectionById(page.html, "entry-requirements") ?? ""), "Entry Requirements");
  const career = cleanSectionHeading(structuredText(htmlSectionById(page.html, "future-careers") ?? ""), "Future Careers");
  const duration = overview.match(/(?:^|\n)Duration\n([^\n]+)/i)?.[1]?.trim() ?? null;
  const internationalFee = overview.match(/((?:USD|MYR)\s*[\d,]+(?:\.\d{1,2})?)\s*\(International\)/i)?.[1] ?? null;
  const feeAmount = internationalFee ? Number(internationalFee.replace(/[^\d.]/g, "")) : null;
  const feeCurrency = internationalFee?.match(/^(USD|MYR)/i)?.[1]?.toUpperCase() ?? null;
  candidate.durationDisplay = duration;
  candidate.durationMonths = durationMonths(duration);
  candidate.courseModeRaw = duration?.match(/Full[ -]?time/i)?.[0] ?? null;
  candidate.tuition = { ...candidate.tuition, min: feeAmount, max: feeAmount, currency: feeCurrency, display: internationalFee ? `${internationalFee} (International)` : null };
  if (admissions) candidate.sections.push({ type: "ADMISSIONS", titleRaw: "Entry Requirements", bodyRaw: admissions, sourceUrl: page.url, sourceCheckedAt: page.fetchedAt });
  if (curriculum) candidate.sections.push({ type: "CURRICULUM", titleRaw: "Programme Structure", bodyRaw: curriculum, sourceUrl: page.url, sourceCheckedAt: page.fetchedAt });
  if (career) candidate.sections.push({ type: "CAREER_OPPORTUNITIES", titleRaw: "Future Careers", bodyRaw: career, sourceUrl: page.url, sourceCheckedAt: page.fetchedAt });
  for (const [field, value] of [["durationDisplay", duration], ["tuition", internationalFee], ["admissions", admissions], ["curriculum", curriculum], ["careerOpportunities", career]] as const) {
    if (value) candidate.evidence.push(evidenceOf(page, field, value));
  }
  return [candidate];
}

function programmeFromExplicitPage(value: { name: string; description: string | null; studyLevelRaw: string | null; subjectCategoryRaw?: string | null; detailUrl: string }, page: PageSnapshot, source: SourceDefinition, index: number): ProgrammeCandidate {
  const evidence = [evidenceOf(page, "name", value.name), evidenceOf(page, "detailUrl", value.detailUrl)];
  if (value.description) evidence.push(evidenceOf(page, "description", value.description));
  if (value.studyLevelRaw) evidence.push(evidenceOf(page, "studyLevelRaw", value.studyLevelRaw));
  return {
    candidateId: stableId("programme", `${source.sourceKey}|${value.detailUrl.toLocaleLowerCase("en")}`), programmeCode: null, universityCode: null,
    ...splitLanguage(value.name, "name"), subjectCategoryCode: null, subjectCategoryRaw: value.subjectCategoryRaw ?? null,
    studyLevelCode: null, studyLevelRaw: value.studyLevelRaw, courseModeCode: null, courseModeRaw: null,
    durationDisplay: null, durationMonths: null, ...splitLanguage(value.description, "description"), status: "DRAFT",
    tuition: { min: null, max: null, currency: null, display: null, feePeriod: "UNKNOWN", rmbMin: null, rmbMax: null, exchangeRate: null, exchangeRateDate: null, totalRmbMin: null, totalRmbMax: null },
    officialUrl: value.detailUrl, languages: [], intakes: [], sections: [], evidence,
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
  const price = source.sourceKey === "taylors-university" ? null : numeric(offer?.price);
  const lowPrice = source.sourceKey === "taylors-university" ? null : numeric(offer?.lowPrice) ?? price;
  const highPrice = source.sourceKey === "taylors-university" ? null : numeric(offer?.highPrice) ?? price;
  const currency = source.sourceKey === "taylors-university" ? null : text(offer?.priceCurrency);
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
    ...splitLanguage(description, "description"), officialUrl: urlText(node.url, page.url) ?? page.url, status: "DRAFT",
    tuition: { min: lowPrice, max: highPrice, currency, display: lowPrice === null && highPrice === null ? null : `${lowPrice ?? ""}${lowPrice !== highPrice && highPrice !== null ? `–${highPrice}` : ""} ${currency ?? ""}`.trim(), feePeriod: "UNKNOWN", rmbMin: null, rmbMax: null, exchangeRate: null, exchangeRateDate: null, totalRmbMin: null, totalRmbMax: null },
    languages, intakes, sections: [], evidence,
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
function umSection(html: string, title: string): string | null {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<h4\\b[^>]*class=["'][^"']*title-2[^"']*["'][^>]*>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/h4>([\\s\\S]*?)(?=<h4\\b[^>]*class=["'][^"']*title-2|<\\/section>)`, "i"));
  return match?.[1] ?? null;
}
function htmlSectionById(html: string, id: string): string | null {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<section\\b[^>]*\\bid=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/section>`, "i"))?.[1] ?? null;
}
function cleanSectionHeading(value: string, heading: string): string {
  return value.replace(new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "").trim();
}
function structuredText(html: string): string {
  return decodeHtml(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(?:li|p|h[1-6]|div|ol|ul)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[\t\f\v ]+/g, " ").replace(/\s*\n\s*/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 50_000);
}
function durationMonths(value: string | null): number | null {
  const years = value?.match(/(\d+(?:\.\d+)?)\s*Years?/i)?.[1];
  return years ? Math.round(Number(years) * 12) : null;
}
function deduplicate<T>(items: T[], key: (item: T) => string): T[] { const seen = new Set<string>(); return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; }); }

export function mergeProgrammeCandidates(items: ProgrammeCandidate[]): ProgrammeCandidate[] {
  const merged = new Map<string, ProgrammeCandidate>();
  for (const item of items) {
    const key = canonicalProgrammeUrl(item.officialUrl) || item.candidateId;
    const current = merged.get(key);
    if (!current) { merged.set(key, item); continue; }
    for (const key of ["nameZh", "nameEn", "subjectCategoryRaw", "studyLevelRaw", "courseModeRaw", "durationDisplay", "durationMonths", "descriptionZh", "descriptionEn"] as const) {
      if (current[key] === null && item[key] !== null) (current as Record<string, unknown>)[key] = item[key];
    }
    for (const key of ["min", "max", "currency", "display", "rmbMin", "rmbMax", "exchangeRate", "exchangeRateDate", "totalRmbMin", "totalRmbMax"] as const) {
      if (current.tuition[key] === null && item.tuition[key] !== null) (current.tuition as Record<string, unknown>)[key] = item.tuition[key];
    }
    current.languages = deduplicate([...current.languages, ...item.languages], (entry) => entry.rawText);
    current.intakes = deduplicate([...current.intakes, ...item.intakes], (entry) => `${entry.displayText}|${entry.date}`);
    current.sections = deduplicate([...current.sections, ...item.sections], (entry) => `${entry.type}|${entry.sourceUrl}`);
    if (!current.officialUrl || item.officialUrl.length < current.officialUrl.length) current.officialUrl = item.officialUrl;
    current.evidence = deduplicate([...current.evidence, ...item.evidence], (entry) => `${entry.field}|${entry.sourceUrl}|${entry.rawText}`);
  }
  return [...merged.values()];
}

function canonicalProgrammeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    url.hostname = url.hostname.toLocaleLowerCase("en");
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.href.toLocaleLowerCase("en");
  } catch {
    return "";
  }
}
