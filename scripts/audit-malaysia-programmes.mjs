import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const valueOf = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = new URL(valueOf("--base-url", "https://yangdoujiao.com"));
const output = path.resolve(valueOf("--output", ".data/audits/malaysia-programmes.json"));
const universityFilter = valueOf("--university", "");
const auditDetails = args.includes("--details");
const basicInfoAudit = args.includes("--basic-info");

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "YangdoujiaoDataAudit/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function readProgrammePage(slug, page) {
  const url = new URL(`/api/v1/universities/${encodeURIComponent(slug)}/programmes`, baseUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", "48");
  return readJson(url);
}

function missingFields(programme, includeSections) {
  const sectionTypes = new Set(Array.isArray(programme.sections)
    ? programme.sections.filter((section) => hasText(section.bodyZh) || hasText(section.bodyEn)).map((section) => section.type)
    : []);
  const missing = [
    !hasText(programme.nameZh) && "nameZh",
    !hasText(programme.nameEn) && "nameEn",
    !hasText(programme.categoryCode) && "subjectCategory",
    !hasText(programme.studyLevelCode) && "studyLevel",
    !hasText(programme.courseModeCode) && "courseMode",
    (!Number.isInteger(programme.durationMonths) && !hasText(programme.durationDisplay)) && "duration",
    (!hasText(programme.tuitionDisplay) && programme.tuitionMin == null && programme.tuitionMax == null) && "tuition",
    (!hasText(programme.descriptionZh) && !hasText(programme.descriptionEn)) && "description",
  ].filter(Boolean);
  if (includeSections) {
    if (!sectionTypes.has("ADMISSIONS")) missing.push("admissions");
    if (!sectionTypes.has("CURRICULUM")) missing.push("curriculum");
    if (!sectionTypes.has("CAREER_OPPORTUNITIES")) missing.push("careerOpportunities");
  }
  return missing;
}

function basicInfoIssues(programme) {
  const issues = [];
  const section = (programme.sections ?? []).find((item) => item.type === "ADMISSIONS");
  const duration = String(programme.durationDisplay ?? "").trim();
  const tuition = String(programme.tuitionDisplay ?? "").trim();
  const names = `${programme.nameZh ?? ""} ${programme.nameEn ?? ""}`;
  if (!hasText(programme.studyLevelCode)) issues.push("missing_study_level");
  if (!hasText(programme.courseModeCode)) issues.push("missing_course_mode");
  if (!Number.isInteger(programme.durationMonths) && !duration) issues.push("missing_duration");
  if (/^\d+$/.test(duration)) issues.push("ambiguous_numeric_duration");
  if (!hasText(programme.tuitionCurrency) && (programme.tuitionMin != null || programme.tuitionMax != null)) {
    issues.push("missing_tuition_currency");
  }
  if (!tuition && programme.tuitionMin == null && programme.tuitionMax == null) issues.push("missing_tuition");
  if (tuition && !/(国际|本地|international|malaysian|待核实)/i.test(tuition)) {
    issues.push("tuition_student_category_unspecified");
  }
  if (tuition && !/(每年|\/年|per year|每学期|学期|总学费|全课程|待核实)/i.test(tuition)) {
    issues.push("tuition_period_unspecified");
  }
  if (!Array.isArray(programme.languageCodes) || programme.languageCodes.length === 0) issues.push("missing_language");
  if (!Array.isArray(programme.intakeDisplayTexts) || programme.intakeDisplayTexts.length === 0) issues.push("missing_intake");
  if (!section || (!hasText(section.bodyZh) && !hasText(section.bodyEn))) issues.push("missing_admissions");
  if (section && !hasText(section.bodyZh)) issues.push("admissions_not_simplified_chinese");
  if (!hasText(programme.officialUrl)) issues.push("missing_programme_source");
  if (!programme.sourceCheckedAt) issues.push("missing_source_checked_at");
  if (/(CGPA|GPA|\d+\s*%|雅思|IELTS|入学要求)/i.test(names)) issues.push("possible_requirement_in_name");
  return [...new Set(issues)];
}

async function addProgrammeDetails(slug, programmes) {
  if (!auditDetails && !basicInfoAudit) return programmes;
  const detailed = [];
  for (const programme of programmes) {
    const url = new URL(`/api/v1/universities/${encodeURIComponent(slug)}/programmes/${programme.id}`, baseUrl);
    detailed.push(await readJson(url));
  }
  return detailed;
}

async function main() {
  const directoryUrl = new URL("/api/v1/universities/search", baseUrl);
  directoryUrl.searchParams.set("country", "MY");
  directoryUrl.searchParams.set("page", "1");
  directoryUrl.searchParams.set("size", "48");
  const directory = await readJson(directoryUrl);
  const universities = [];
  const failures = [];

  for (const university of (directory.items ?? []).filter((item) => !universityFilter || item.slug === universityFilter)) {
    try {
      const first = await readProgrammePage(university.slug, 1);
      const pages = [first];
      for (let page = 2; page <= first.totalPages; page++) pages.push(await readProgrammePage(university.slug, page));
      const programmes = await addProgrammeDetails(university.slug, pages.flatMap((item) => item.items ?? []));
      const missing = Object.create(null);
      const incomplete = [];
      const basicInfoIssueCounts = Object.create(null);
      const basicInfoRecords = [];
      for (const programme of programmes) {
        const fields = missingFields(programme, auditDetails || basicInfoAudit);
        for (const field of fields) missing[field] = (missing[field] ?? 0) + 1;
        if (fields.length) incomplete.push({ id: programme.id, programmeCode: programme.programmeCode, nameZh: programme.nameZh, nameEn: programme.nameEn, missing: fields });
        if (basicInfoAudit) {
          const issues = basicInfoIssues(programme);
          for (const issue of issues) basicInfoIssueCounts[issue] = (basicInfoIssueCounts[issue] ?? 0) + 1;
          if (issues.length) basicInfoRecords.push({
            id: programme.id,
            programmeCode: programme.programmeCode,
            nameZh: programme.nameZh,
            nameEn: programme.nameEn,
            issues,
          });
        }
      }
      universities.push({
        id: university.id,
        slug: university.slug,
        nameZh: university.nameZh,
        nameEn: university.nameEn,
        publishedProgrammes: first.totalItems,
        retrievedProgrammes: programmes.length,
        completeProgrammes: programmes.length - incomplete.length,
        missing,
        incomplete,
        basicInfoIssueCounts,
        basicInfoRecords,
        records: programmes.map((programme) => ({
          id: programme.id,
          programmeCode: programme.programmeCode,
          slug: programme.slug,
          nameZh: programme.nameZh,
          nameEn: programme.nameEn,
          categoryCode: programme.categoryCode,
          studyLevelCode: programme.studyLevelCode,
          courseModeCode: programme.courseModeCode,
          durationMonths: programme.durationMonths,
          durationDisplay: programme.durationDisplay,
          tuitionMin: programme.tuitionMin,
          tuitionMax: programme.tuitionMax,
          tuitionCurrency: programme.tuitionCurrency,
          tuitionDisplay: programme.tuitionDisplay,
          officialUrl: programme.officialUrl,
          taxonomySourceType: programme.taxonomySourceType,
          taxonomySourceUrl: programme.taxonomySourceUrl,
          taxonomySourceCheckedAt: programme.taxonomySourceCheckedAt,
          sourceCheckedAt: programme.sourceCheckedAt,
          languageCodes: programme.languageCodes,
          intakeDisplayTexts: programme.intakeDisplayTexts,
          admissions: Array.isArray(programme.sections)
            ? programme.sections.filter((section) => section.type === "ADMISSIONS")
            : [],
          sectionTypes: Array.isArray(programme.sections) ? programme.sections.map((section) => section.type) : [],
        })),
      });
    } catch (error) {
      failures.push({ slug: university.slug, message: error instanceof Error ? error.message : String(error) });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: baseUrl.origin,
    countryCode: "MY",
    publishedUniversities: directory.totalItems,
    auditedUniversities: universities.length,
    detailAudit: auditDetails,
    basicInfoAudit,
    publishedProgrammes: universities.reduce((sum, item) => sum + item.publishedProgrammes, 0),
    universities,
    failures,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, publishedUniversities: report.publishedUniversities, publishedProgrammes: report.publishedProgrammes, failures: failures.length }));
}

await main();
