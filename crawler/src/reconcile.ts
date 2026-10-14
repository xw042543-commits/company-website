import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProgrammeCandidate, ReviewBundle } from "./types.ts";

type ExistingProgramme = {
  programmeCode: string;
  nameZh: string | null;
  nameEn: string | null;
  durationMonths: number | null;
  durationDisplay: string | null;
  tuitionMin: number | null;
  tuitionMax: number | null;
  tuitionCurrency: string | null;
  tuitionDisplay: string | null;
  officialUrl?: string | null;
};

const args = process.argv.slice(2);
const valueOf = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const bundlePath = valueOf("--bundle");
const auditPath = valueOf("--audit");
const universitySlug = valueOf("--university");
const outputRoot = valueOf("--output");
if (!bundlePath || !auditPath || !universitySlug || !outputRoot) {
  throw new Error("用法：node src/reconcile.ts --bundle <审核包> --audit <数据库审计> --university <slug> --output <目录>");
}

function normalizedName(value: string | null | undefined) {
  return value?.normalize("NFKD").toLocaleLowerCase("en").replace(/&/g, "and")
    .replace(/\bbachelor\s+in\b/g, "bachelor of")
    .replace(/\btesl\b/g, "teaching english as a second language")
    .replace(/\bai\b/g, "artificial intelligence")
    .replace(/\bcounselling\b/g, "counseling")
    .replace(/\binformation systems\b/g, "information system")
    .replace(/\bwith honours?\b|\bhonours?\b|\bhons?\b|\bmbbs\b/g, "")
    .replace(/[^a-z0-9]+/g, "") ?? "";
}

function sql(value: string | number | null) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

function textOrNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function canonicalUrl(value: string | null | undefined) {
  try {
    const url = new URL(value ?? "");
    url.hash = "";
    url.search = "";
    url.hostname = url.hostname.toLocaleLowerCase("en");
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.href.toLocaleLowerCase("en");
  } catch {
    return "";
  }
}

function detailEvidence(candidate: ProgrammeCandidate) {
  const official = canonicalUrl(candidate.officialUrl);
  return candidate.evidence.find((item) => canonicalUrl(item.sourceUrl) === official);
}

const bundle = JSON.parse(await readFile(path.resolve(bundlePath), "utf8")) as ReviewBundle;
const audit = JSON.parse(await readFile(path.resolve(auditPath), "utf8"));
const university = audit.universities?.find((item: { slug: string }) => item.slug === universitySlug);
if (!university || !Array.isArray(university.records)) throw new Error(`审计报告中没有院校或完整记录：${universitySlug}`);
const existing = university.records as ExistingProgramme[];
type MatchMethod = "official-url" | "canonical-name" | "unique-prefix";
const matched: Array<{ candidate: ProgrammeCandidate; existing: ExistingProgramme; method: MatchMethod }> = [];
const unmatched: ProgrammeCandidate[] = [];
const ambiguous: Array<{ candidate: ProgrammeCandidate; matches: ExistingProgramme[] }> = [];
for (const candidate of bundle.programmes) {
  const key = normalizedName(candidate.nameEn);
  const official = canonicalUrl(candidate.officialUrl);
  let method: MatchMethod = "official-url";
  let matches = official ? existing.filter((programme) => canonicalUrl(programme.officialUrl) === official) : [];
  if (matches.length === 0) {
    method = "canonical-name";
    matches = key ? existing.filter((programme) => normalizedName(programme.nameEn) === key) : [];
  }
  if (matches.length === 0 && key.length >= 24) {
    matches = existing.filter((programme) => {
      const current = normalizedName(programme.nameEn);
      return current.length >= 24 && (current.startsWith(key) || key.startsWith(current));
    });
    method = "unique-prefix";
  }
  if (matches.length === 1) matched.push({ candidate, existing: matches[0], method });
  else if (matches.length === 0) unmatched.push(candidate);
  else ambiguous.push({ candidate, matches });
}

const conflicts = matched.flatMap(({ candidate, existing: current }) => {
  const fields = [];
  if (candidate.durationMonths !== null && current.durationMonths !== null && candidate.durationMonths !== current.durationMonths) {
    fields.push({ field: "durationMonths", existing: current.durationMonths, official: candidate.durationMonths });
  }
  if (candidate.tuition.currency && current.tuitionCurrency && candidate.tuition.currency !== current.tuitionCurrency) {
    fields.push({ field: "tuitionCurrency", existing: current.tuitionCurrency, official: candidate.tuition.currency });
  } else if (candidate.tuition.min !== null && current.tuitionMin !== null && candidate.tuition.min !== current.tuitionMin) {
    fields.push({ field: "tuitionMin", existing: current.tuitionMin, official: candidate.tuition.min });
  }
  return fields.length ? [{ programmeCode: current.programmeCode, nameEn: candidate.nameEn, fields }] : [];
});

const usable = matched.filter(({ candidate }) => detailEvidence(candidate) !== undefined);
if (usable.length === 0) throw new Error("没有带详情页证据的唯一匹配记录，拒绝生成空迁移");

function assertMax(label: string, value: string | null | undefined, max: number) {
  if (value && value.length > max) throw new Error(`${label} 超过数据库长度限制 ${max}`);
}
for (const { candidate, existing: current } of usable) {
  assertMax(`${current.programmeCode}.nameEn`, candidate.nameEn, 200);
  assertMax(`${current.programmeCode}.durationDisplay`, candidate.durationDisplay, 100);
  assertMax(`${current.programmeCode}.tuitionDisplay`, candidate.tuition.display, 200);
  assertMax(`${current.programmeCode}.officialUrl`, candidate.officialUrl, 1000);
  for (const section of candidate.sections) {
    assertMax(`${current.programmeCode}.${section.type}.title`, section.titleRaw, 200);
    assertMax(`${current.programmeCode}.${section.type}.sourceUrl`, section.sourceUrl, 1000);
  }
  for (const intake of candidate.intakes) assertMax(`${current.programmeCode}.intake`, intake.displayText, 100);
}
const programmeRows = usable.map(({ candidate, existing: current }) => `    (${[
  sql(current.programmeCode), sql(textOrNull(candidate.nameEn)), sql(textOrNull(candidate.descriptionEn)),
  sql(candidate.durationMonths), sql(textOrNull(candidate.durationDisplay)), sql(candidate.tuition.min),
  sql(candidate.tuition.max), sql(candidate.tuition.currency), sql(textOrNull(candidate.tuition.display)),
  sql(candidate.officialUrl), sql(detailEvidence(candidate)?.fetchedAt ?? bundle.generatedAt),
].join(", ")})`);
const sectionRows = usable.flatMap(({ candidate, existing: current }) => candidate.sections.map((section) => `    (${[
  sql(current.programmeCode), sql(section.type), sql(section.titleRaw), sql(section.bodyRaw), sql(section.sourceUrl), sql(section.sourceCheckedAt),
].join(", ")})`));
const intakeRows = usable.flatMap(({ candidate, existing: current }) => candidate.intakes.map((intake) => `    (${[
  sql(current.programmeCode), sql(intake.displayText), sql(candidate.officialUrl),
  sql(detailEvidence(candidate)?.fetchedAt ?? bundle.generatedAt),
].join(", ")})`));
const sectionInsert = sectionRows.length ? `INSERT INTO official_programme_sections VALUES\n${sectionRows.join(",\n")};` : "-- No official detail sections were extracted.";
const intakeInsert = intakeRows.length ? `INSERT INTO official_programme_intakes VALUES\n${intakeRows.join(",\n")};` : "-- No official intake records were extracted.";
const tablePrefix = `official_${universitySlug.replace(/[^a-z0-9]+/gi, "_").toLocaleLowerCase("en")}`;
const updatesTable = `${tablePrefix}_programme_updates`;
const sectionsTable = `${tablePrefix}_programme_sections`;
const intakesTable = `${tablePrefix}_programme_intakes`;
const renderedSectionInsert = sectionInsert.replace("official_programme_sections", sectionsTable);
const renderedIntakeInsert = intakeInsert.replace("official_programme_intakes", intakesTable);
const generatedSection = `(programme_detail_sections.source_url IS NULL AND (
    programme_detail_sections.body_zh LIKE '参考课程结构（非院校官方科目表）%'
    OR programme_detail_sections.body_zh LIKE '参考学习领域，非官方课程表%'
    OR programme_detail_sections.body_zh LIKE '%核心竞争力：建议通过专业技能、跨学科协作%'
    OR programme_detail_sections.body_zh LIKE '%职业说明：岗位准入和发展取决于个人能力%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas only, not the institution%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas, not an official module list%'
    OR programme_detail_sections.body_en LIKE '%Career note: Entry and progression depend on individual capability%'
  ))`;

const migration = `-- Generated from official ${bundle.sourceName} pages captured by the reviewed crawler.
-- This migration fills blank fields and replaces only unsourced generated detail sections.
CREATE TEMP TABLE ${updatesTable} (
  programme_code varchar(64) PRIMARY KEY, name_en varchar(200), description_en text,
  duration_months integer, duration_display varchar(100), tuition_min numeric(14,2),
  tuition_max numeric(14,2), tuition_currency char(3), tuition_display varchar(200),
  official_url varchar(1000) NOT NULL, source_checked_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO ${updatesTable} VALUES
${programmeRows.join(",\n")};

DO $$ BEGIN
  IF (SELECT COUNT(*) FROM ${updatesTable}) <> ${programmeRows.length} THEN
    RAISE EXCEPTION 'Unexpected official programme update count';
  END IF;
  IF (SELECT COUNT(*) FROM ${updatesTable} f JOIN programmes p ON p.programme_code=f.programme_code JOIN universities u ON u.id=p.university_id WHERE u.slug=${sql(universitySlug)}) <> ${programmeRows.length} THEN
    RAISE EXCEPTION 'Not every official programme update matched ${universitySlug}';
  END IF;
END $$;

UPDATE programmes p SET
  name_en = COALESCE(NULLIF(BTRIM(p.name_en), ''), f.name_en),
  description_zh = CASE WHEN p.description_en LIKE '%Exact modules, credits and assessment methods are determined by the university’s current official syllabus.' THEN NULL ELSE p.description_zh END,
  description_en = CASE WHEN NULLIF(BTRIM(p.description_en), '') IS NULL OR p.description_en LIKE '%Exact modules, credits and assessment methods are determined by the university’s current official syllabus.' THEN f.description_en ELSE p.description_en END,
  duration_months = CASE WHEN p.duration_months IS NULL AND NULLIF(BTRIM(p.duration_display), '') IS NULL THEN f.duration_months ELSE p.duration_months END,
  duration_display = CASE WHEN p.duration_months IS NULL AND NULLIF(BTRIM(p.duration_display), '') IS NULL THEN f.duration_display ELSE p.duration_display END,
  tuition_min = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_min ELSE p.tuition_min END,
  tuition_max = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_max ELSE p.tuition_max END,
  tuition_currency = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_currency ELSE p.tuition_currency END,
  tuition_display = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_display ELSE p.tuition_display END,
  official_url = COALESCE(NULLIF(BTRIM(p.official_url), ''), f.official_url),
  source_checked_at = GREATEST(COALESCE(p.source_checked_at, f.source_checked_at), f.source_checked_at),
  updated_at = CURRENT_TIMESTAMP
FROM ${updatesTable} f, universities u
WHERE p.programme_code=f.programme_code AND p.university_id=u.id AND u.slug=${sql(universitySlug)};

CREATE TEMP TABLE ${sectionsTable} (
  programme_code varchar(64), section_type varchar(40), title_en varchar(200), body_en text,
  source_url varchar(1000), source_checked_at timestamptz, PRIMARY KEY(programme_code, section_type)
) ON COMMIT DROP;

${renderedSectionInsert}

INSERT INTO programme_detail_sections (programme_id, section_type, title_en, body_en, sort_order, source_url, source_checked_at, status, created_at, updated_at)
SELECT p.id, s.section_type, s.title_en, s.body_en,
  CASE s.section_type WHEN 'ADMISSIONS' THEN 20 WHEN 'CAREER_OPPORTUNITIES' THEN 30 ELSE 40 END,
  s.source_url, s.source_checked_at, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM ${sectionsTable} s JOIN programmes p ON p.programme_code=s.programme_code JOIN universities u ON u.id=p.university_id
WHERE u.slug=${sql(universitySlug)}
ON CONFLICT (programme_id, section_type) DO UPDATE SET
  title_zh=CASE WHEN ${generatedSection} THEN NULL ELSE programme_detail_sections.title_zh END,
  body_zh=CASE WHEN ${generatedSection} THEN NULL ELSE programme_detail_sections.body_zh END,
  title_en=EXCLUDED.title_en, body_en=EXCLUDED.body_en, source_url=EXCLUDED.source_url,
  source_checked_at=EXCLUDED.source_checked_at, status='PUBLISHED', updated_at=CURRENT_TIMESTAMP
WHERE ${generatedSection} OR NULLIF(BTRIM(programme_detail_sections.body_en), '') IS NULL;

CREATE TEMP TABLE ${intakesTable} (
  programme_code varchar(64), display_text varchar(100), source_url varchar(1000), source_checked_at timestamptz,
  PRIMARY KEY(programme_code, display_text)
) ON COMMIT DROP;

${renderedIntakeInsert}

INSERT INTO programme_intakes (programme_id, display_text, source_url, source_checked_at)
SELECT p.id, i.display_text, i.source_url, i.source_checked_at
FROM ${intakesTable} i JOIN programmes p ON p.programme_code=i.programme_code JOIN universities u ON u.id=p.university_id
WHERE u.slug=${sql(universitySlug)} AND NOT EXISTS (
  SELECT 1 FROM programme_intakes existing WHERE existing.programme_id=p.id
);
`;

const report = {
  generatedAt: new Date().toISOString(),
  universitySlug,
  sourceKey: bundle.sourceKey,
  officialCandidates: bundle.programmes.length,
  matchedCandidates: matched.length,
  matchMethods: Object.fromEntries([...new Set(matched.map((item) => item.method))].map((method) => [method, matched.filter((item) => item.method === method).length])),
  matches: matched.map((item) => ({
    candidateId: item.candidate.candidateId,
    programmeCode: item.existing.programmeCode,
    officialNameEn: item.candidate.nameEn,
    existingNameEn: item.existing.nameEn,
    method: item.method,
    officialUrl: item.candidate.officialUrl,
  })),
  usableOfficialMatches: usable.length,
  unmatched: unmatched.map((item) => ({ candidateId: item.candidateId, nameEn: item.nameEn, officialUrl: item.officialUrl })),
  ambiguous: ambiguous.map((item) => ({ candidateId: item.candidate.candidateId, nameEn: item.candidate.nameEn, programmeCodes: item.matches.map((match) => match.programmeCode) })),
  conflicts,
  generatedRows: { programmes: programmeRows.length, sections: sectionRows.length, intakes: intakeRows.length },
};
const destination = path.resolve(outputRoot);
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, "reconciliation-report.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(destination, "incremental-import.sql"), migration);
console.log(JSON.stringify(report));
