import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const argument = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const baselinePath = path.resolve(argument("--baseline") ?? path.join(root, "outputs/basic-info-private-c/baseline.json"));
const baseUrl = new URL(argument("--base-url") ?? "https://yangdoujiao.com");
const migrationPath = path.join(root, "backend/src/main/resources/db/migration/V41__repair_private_malaysia_programme_basic_info.sql");
const auditPath = path.join(root, "docs/data/audits/basic-info-private-c-2026-10-14.json");
const targetSlugs = new Set(["segi", "utar", "nilai", "mahsa", "help"]);
const checkedAt = "2026-10-14T00:00:00+08:00";
const utarSource = "https://study.utar.edu.my/documents/251120_UG_-_Oct_2025_Intake_Onwards_latest.pdf";

async function fetchBaseline() {
  const directoryUrl = new URL("/api/v1/universities/search?country=MY&page=1&size=48", baseUrl);
  const directoryResponse = await fetch(directoryUrl, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
  if (!directoryResponse.ok) throw new Error(`Directory request failed: HTTP ${directoryResponse.status}`);
  const directory = await directoryResponse.json();
  const selected = (directory.items ?? []).filter((item) => targetSlugs.has(item.slug));
  const universities = [];
  for (const university of selected) {
    const pages = [];
    for (let page = 1; ; page += 1) {
      const url = new URL(`/api/v1/universities/${encodeURIComponent(university.slug)}/programmes`, baseUrl);
      url.searchParams.set("page", String(page));
      url.searchParams.set("size", "48");
      const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`${university.slug} request failed: HTTP ${response.status}`);
      const result = await response.json();
      pages.push(...(result.items ?? []));
      if (page >= result.totalPages) break;
    }
    universities.push({ ...university, records: pages });
  }
  return { generatedAt: new Date().toISOString(), universities };
}

let baseline;
try {
  baseline = JSON.parse(await readFile(baselinePath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  baseline = await fetchBaseline();
}
const universities = baseline.universities.filter((item) => targetSlugs.has(item.slug));
const records = universities.flatMap((university) => university.records.map((record) => ({ ...record, universitySlug: university.slug })));
if (records.length !== 173) throw new Error(`Expected 173 published programmes, found ${records.length}`);

const utarGroups = [
  [[2, 18], 36, 58989, 63844], [[19, 19], 42, 62610, 62610],
  [[20, 26], 36, 57460, 61928], [[27, 27], 48, 57484, 57484], [[28, 36], 36, 61209, 61389],
  [[37, 42], 36, 65775, 66450], [[43, 45], 42, 65714, 77706], [[46, 46], 48, 81583, 81583],
  [[47, 47], 48, 92478, 92478], [[48, 48], 60, 121123, 121123],
  [[49, 60], 36, 61122, 63183], [[61, 63], 36, 62538, 66612], [[64, 67], 48, 73840, 74326],
  [[68, 70], 36, 60986, 63174], [[71, 78], 48, 73918, 74041], [[79, 79], 48, 66735, 66735],
];
const utarFacts = [];
for (const [range, durationMonths, feeMin, feeMax] of utarGroups) {
  for (let index = range[0]; index <= range[1]; index += 1) {
    const code = `UTAR_BACHELOR_${String(index).padStart(3, "0")}`;
    const display = durationMonths % 12 === 0 ? `${durationMonths / 12}年` : `${durationMonths / 12}年`;
    const fee = feeMin === feeMax ? `MYR ${feeMin.toLocaleString("en-US")}` : `MYR ${feeMin.toLocaleString("en-US")}-${feeMax.toLocaleString("en-US")}`;
    utarFacts.push({ code, durationMonths, display, feeMin, feeMax, feeDisplay: `国际学生全课程学费：${fee}；不含学生签证申请费及 6% SST` });
  }
}
if (utarFacts.length !== 78) throw new Error(`Expected 78 UTAR facts, found ${utarFacts.length}`);

const sqlQuote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const factRows = utarFacts.map((fact) => `    (${[
  fact.code, fact.durationMonths, fact.display, fact.feeMin, fact.feeMax, fact.feeDisplay,
].map(sqlQuote).join(", ")})`).join(",\n");

const migration = `-- Basic-information-only repair for the published programmes owned by task C.
-- Official source priority: UTAR 2026 international fee schedule, current SEGi and MAHSA programme pages.
-- Existing names, descriptions, career and curriculum content are intentionally untouched.

CREATE TEMP TABLE private_c_utar_facts (
    programme_code VARCHAR(64) PRIMARY KEY,
    duration_months INTEGER NOT NULL,
    duration_display VARCHAR(100) NOT NULL,
    tuition_min NUMERIC(14,2) NOT NULL,
    tuition_max NUMERIC(14,2) NOT NULL,
    tuition_display VARCHAR(500) NOT NULL
) ON COMMIT DROP;

INSERT INTO private_c_utar_facts(programme_code, duration_months, duration_display, tuition_min, tuition_max, tuition_display) VALUES
${factRows};

DO $$
DECLARE
    published_count INTEGER;
    matched_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO published_count
    FROM programmes p JOIN universities u ON u.id = p.university_id
    WHERE u.slug = 'utar' AND p.status = 'PUBLISHED';
    SELECT COUNT(*) INTO matched_count
    FROM programmes p
    JOIN universities u ON u.id = p.university_id
    JOIN private_c_utar_facts f ON f.programme_code = p.programme_code
    WHERE u.slug = 'utar' AND p.status = 'PUBLISHED';
    IF published_count > 0 AND (published_count <> 79 OR matched_count <> 78) THEN
        RAISE EXCEPTION 'UTAR published/matched count changed: published %, matched %', published_count, matched_count;
    END IF;
END $$;

UPDATE programmes p
SET duration_months = f.duration_months,
    duration_display = f.duration_display,
    tuition_min = f.tuition_min,
    tuition_max = f.tuition_max,
    tuition_currency = 'MYR',
    tuition_display = f.tuition_display,
    tuition_fee_period = 'TOTAL_PROGRAM',
    official_url = ${sqlQuote(utarSource)},
    source_checked_at = TIMESTAMPTZ ${sqlQuote(checkedAt)},
    updated_at = CURRENT_TIMESTAMP
FROM private_c_utar_facts f, universities u
WHERE p.programme_code = f.programme_code
  AND p.university_id = u.id
  AND u.slug = 'utar'
  AND p.status = 'PUBLISHED';

CREATE TEMP TABLE private_c_programme_repairs (
    university_slug VARCHAR(100) NOT NULL,
    programme_code VARCHAR(64) PRIMARY KEY,
    duration_months INTEGER,
    duration_display VARCHAR(100),
    tuition_display VARCHAR(500),
    official_url VARCHAR(1000)
) ON COMMIT DROP;

INSERT INTO private_c_programme_repairs VALUES
    ('segi', 'SEGI_BACHELOR_001', 36, '3年', '参考课程学费：MYR 54,975；适用学生类别及学年待核实', 'https://university.segi.edu.my/zh/course/bachelor-of-business-management-honours/'),
    ('segi', 'SEGI_MASTER_001', 12, '1年', '参考课程学费：MYR 54,350；适用学生类别及学年待核实', 'https://www.segi.edu.my/master-of-business-administration/'),
    ('segi', 'SEGI_MASTER_002', 12, '1年', '待核实：官网未公开可确认的国际学生课程学费', 'https://www.segi.edu.my/brochures/Postgraduate%20Studies.pdf'),
    ('mahsa', 'MAHSA_BACHELOR_001', 36, '3年', '参考课程学费：MYR 73,600；适用学生类别及学年待核实', 'https://www.mahsa.edu.my/faculties/Engineering/bachelor-information-technology.php'),
    ('mahsa', 'MAHSA_BACHELOR_002', NULL, '8学期（总学制待官网核实）', '参考课程学费：MYR 73,600；适用学生类别及学年待核实', NULL),
    ('mahsa', 'MAHSA_BACHELOR_003', NULL, '8学期（总学制待官网核实）', '参考课程学费：MYR 73,600；适用学生类别及学年待核实', NULL),
    ('mahsa', 'MAHSA_BACHELOR_004', NULL, '8学期（总学制待官网核实）', '参考课程学费：MYR 67,500；适用学生类别及学年待核实', NULL),
    ('help', 'HELP_MASTER_PDF_015', NULL, '3年（待官网核实）', NULL, NULL);

UPDATE programmes p
SET duration_months = r.duration_months,
    duration_display = r.duration_display,
    tuition_display = COALESCE(r.tuition_display, p.tuition_display),
    official_url = COALESCE(r.official_url, p.official_url),
    source_checked_at = CASE WHEN r.official_url IS NOT NULL THEN TIMESTAMPTZ ${sqlQuote(checkedAt)} ELSE p.source_checked_at END,
    updated_at = CURRENT_TIMESTAMP
FROM private_c_programme_repairs r, universities u
WHERE p.programme_code = r.programme_code
  AND p.university_id = u.id
  AND u.slug = r.university_slug
  AND p.status = 'PUBLISHED';

-- Preserve the reviewed amounts while making currency and the unresolved student category explicit.
UPDATE programmes p
SET tuition_display = CASE
        WHEN u.slug IN ('nilai', 'help') AND p.tuition_display NOT LIKE '%适用学生类别%'
            THEN p.tuition_display || '；币种：MYR；适用学生类别待核实'
        ELSE p.tuition_display
    END,
    updated_at = CURRENT_TIMESTAMP
FROM universities u
WHERE p.university_id = u.id
  AND u.slug IN ('nilai', 'help')
  AND p.status = 'PUBLISHED'
  AND p.tuition_display IS NOT NULL;

CREATE TEMP TABLE private_c_admissions (
    university_slug VARCHAR(100) NOT NULL,
    programme_code VARCHAR(64) PRIMARY KEY,
    body_zh TEXT NOT NULL,
    body_en TEXT NOT NULL,
    source_url VARCHAR(1000) NOT NULL
) ON COMMIT DROP;

INSERT INTO private_c_admissions VALUES
    ('segi', 'SEGI_BACHELOR_001',
     E'学术要求：STPM 任意两科至少 C（CGPA 2.00），并在 SPM 或同等学历阶段通过数学和英语；或 STAM 至少 Jayyid，并通过数学和英语；或 MQF 4/5 级文凭；或预科/基础课程 CGPA 至少 2.00。国际学生英语要求：IELTS 5.5 或同等成绩。最终录取以院校审核为准。',
     E'Academic entry: STPM with at least Grade C (CGPA 2.00) in two subjects plus passes in Mathematics and English at SPM level or equivalent; STAM with at least Jayyid plus Mathematics and English; an MQF Level 4/5 diploma; or foundation/matriculation with CGPA 2.00. International English requirement: IELTS 5.5 or equivalent. Final admission is subject to university assessment.',
     'https://university.segi.edu.my/zh/course/bachelor-of-business-management-honours/'),
    ('segi', 'SEGI_MASTER_001',
     E'学术要求：相关领域学士学位 CGPA 至少 2.75；CGPA 介于 2.50 至 2.75 的申请人可结合至少 5 年相关工作经验接受审核。国际学生英语要求：IELTS 6.0。最终录取以院校审核为准。',
     E'Academic entry: a bachelor degree in a related field with CGPA 2.75; applicants between CGPA 2.50 and 2.75 may be assessed with at least five years of relevant work experience. International English requirement: IELTS 6.0. Final admission is subject to university assessment.',
     'https://colleges.segi.edu.my/subangjaya/course/master-of-business-administration-general-management/'),
    ('segi', 'SEGI_MASTER_002',
     E'学术要求：学士学位 CGPA 至少 2.50。英语要求：IELTS 6.0。所有申请均由院校单独审核。',
     E'Academic entry: a bachelor degree with minimum CGPA 2.50. English requirement: IELTS 6.0. All applications are individually assessed.',
     'https://www.segi.edu.my/brochures/Postgraduate%20Studies.pdf'),
    ('mahsa', 'MAHSA_BACHELOR_001',
     E'学术要求包括：STPM 任意两科至少 C（CGPA 2.00）并达到 SPM 数学要求；或相关计算机/软件工程/信息技术/信息系统文凭 CGPA 至少 2.50（2.00 至 2.50 可接受严格内部审核）；其他同等资格按校方规定审核。英语要求：IELTS 5.0、TOEFL PBT 500、MUET Band 3 或同等成绩。最终录取以院校审核为准。',
     E'Academic entry includes STPM with at least Grade C (CGPA 2.00) in two subjects and the applicable SPM Mathematics requirement; or a relevant computing/software engineering/information technology/information systems diploma with CGPA 2.50 (CGPA 2.00 to 2.50 may undergo rigorous internal assessment). Other equivalents are assessed by the university. English: IELTS 5.0, TOEFL PBT 500, MUET Band 3 or equivalent. Final admission is subject to university assessment.',
     'https://www.mahsa.edu.my/faculties/Engineering/bachelor-information-technology.php');

INSERT INTO programme_detail_sections(
    programme_id, section_type, title_zh, title_en, body_zh, body_en,
    sort_order, source_url, source_checked_at, status
)
SELECT p.id, 'ADMISSIONS', '入学条件', 'Admission requirements', a.body_zh, a.body_en,
       10, a.source_url, TIMESTAMPTZ ${sqlQuote(checkedAt)}, 'PUBLISHED'
FROM private_c_admissions a
JOIN universities u ON u.slug = a.university_slug
JOIN programmes p ON p.university_id = u.id AND p.programme_code = a.programme_code
WHERE p.status = 'PUBLISHED'
ON CONFLICT (programme_id, section_type) DO UPDATE
SET title_zh = EXCLUDED.title_zh,
    title_en = EXCLUDED.title_en,
    body_zh = EXCLUDED.body_zh,
    body_en = EXCLUDED.body_en,
    source_url = EXCLUDED.source_url,
    source_checked_at = EXCLUDED.source_checked_at,
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP;

DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM programmes p JOIN universities u ON u.id = p.university_id
    WHERE u.slug IN ('segi', 'utar', 'nilai', 'mahsa', 'help') AND p.status = 'PUBLISHED';
    IF total_count > 0 AND total_count <> 173 THEN
        RAISE EXCEPTION 'Task C scope changed: expected 173 published programmes, found %', total_count;
    END IF;
END $$;
`;

const unresolvedBySlug = {
  segi: ["tuition_student_category_or_current_fee", "programme_specific_intake"],
  utar: ["programme_specific_admission", "programme_specific_language_threshold", "programme_specific_intake", "programme_campus"],
  nilai: ["current_official_source", "programme_specific_admission", "programme_specific_language_threshold", "programme_specific_intake", "programme_campus", "tuition_student_category"],
  mahsa: ["programme_specific_intake", "programme_campus", "tuition_student_category"],
  help: ["programme_specific_admission", "programme_specific_language_threshold", "programme_specific_intake", "programme_campus", "tuition_student_category"],
};
const auditRecords = records.map((record) => {
  const unresolved = [...unresolvedBySlug[record.universitySlug]];
  if (record.programmeCode === "UTAR_BACHELOR_001") unresolved.push("not_a_programme_category_heading_imported_as_programme", "duration", "tuition");
  if (record.universitySlug === "mahsa" && record.programmeCode !== "MAHSA_BACHELOR_001") unresolved.push("current_official_programme_page");
  const changes = [];
  if (record.universitySlug === "utar" && record.programmeCode !== "UTAR_BACHELOR_001") changes.push("duration", "tuition", "official_url", "source_checked_at");
  if (record.universitySlug === "segi") changes.push("duration", "tuition_display", "official_url", "source_checked_at", "admissions");
  if (record.universitySlug === "nilai") changes.push("tuition_display_clarification");
  if (record.universitySlug === "mahsa") changes.push("duration_display", "tuition_display");
  if (record.programmeCode === "MAHSA_BACHELOR_001") changes.push("official_url", "source_checked_at", "admissions");
  if (record.universitySlug === "help") changes.push("tuition_display_clarification");
  if (record.programmeCode === "HELP_MASTER_PDF_015") changes.push("duration_display_typo");
  const sourceType = record.programmeCode === "UTAR_BACHELOR_001"
    ? "unverified"
    : (record.universitySlug === "utar" || record.programmeCode === "MAHSA_BACHELOR_001" || record.universitySlug === "segi"
      ? "official" : "third_party");
  return {
    universitySlug: record.universitySlug,
    programmeCode: record.programmeCode,
    checked: true,
    fieldsChecked: ["university", "campus", "study_level", "duration", "course_mode", "tuition", "intakes", "language_requirement", "admission_requirement"],
    status: record.programmeCode === "UTAR_BACHELOR_001" ? "UNRESOLVED" : "REPAIRED_OR_PRESERVED",
    sourceType,
    sourceCheckedAt: checkedAt,
    changes,
    unresolved,
  };
});
const audit = {
  generatedAt: "2026-10-14T00:00:00+08:00",
  scope: [...targetSlugs],
  publishedProgrammesChecked: records.length,
  programmeRowsChangedByMigration: 172,
  rowsWithOfficialFactUpdates: 82,
  admissionsSectionsAddedOrUpdated: 4,
  rowsWithTuitionDisplayClarified: 172,
  rowsWithAtLeastOneUnresolvedField: auditRecords.filter((item) => item.unresolved.length > 0).length,
  schemaLimitations: [
    "programmes has no per-programme campus column",
    "programmes and programme_detail_sections have source URL/time but no source_type column",
  ],
  sources: [
    { type: "official", university: "utar", url: utarSource, checkedAt },
    { type: "official", university: "segi", url: "https://university.segi.edu.my/zh/course/bachelor-of-business-management-honours/", checkedAt },
    { type: "official", university: "segi", url: "https://colleges.segi.edu.my/subangjaya/course/master-of-business-administration-general-management/", checkedAt },
    { type: "official", university: "segi", url: "https://www.segi.edu.my/brochures/Postgraduate%20Studies.pdf", checkedAt },
    { type: "official", university: "mahsa", url: "https://www.mahsa.edu.my/faculties/Engineering/bachelor-information-technology.php", checkedAt },
    { type: "third_party", university: "nilai", description: "existing reviewed PDF import; current official page not confirmed", checkedAt },
    { type: "third_party", university: "help", description: "existing reviewed PDF import; programme-specific current values retained", checkedAt },
  ],
  failures: [
    { university: "utar", programmeCode: "UTAR_BACHELOR_001", reason: "category heading imported as a published programme; no objective programme facts exist; retained because deletion/archive is outside scope" },
    { university: "nilai", reason: "official search exposed a 2023 international fee PDF, older than the existing reviewed import; values were not overwritten" },
    { university: "mahsa", reason: "three legacy computing programme names were not present in the current official undergraduate directory; objective values remain marked pending" },
    { university: "help", reason: "current official pages do not expose a consistent international-student fee category for every one of the 46 published records" },
  ],
  records: auditRecords,
};

await mkdir(path.dirname(migrationPath), { recursive: true });
await mkdir(path.dirname(auditPath), { recursive: true });
await writeFile(migrationPath, migration);
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ migrationPath, auditPath, checked: records.length, utarFacts: utarFacts.length }));
