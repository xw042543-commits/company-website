import { findUniversityBySlug } from "./university-catalog.ts";
import { LOCAL_PROGRAMMES, type LocalProgrammeRecord } from "./local-programmes.generated.ts";
import type { UniversityProgrammePage } from "../lib/university-api.ts";
import { boundedPage, first, pageNumber, type Query } from "../lib/site.ts";
import type { FilterOptions } from "../lib/filter-options-api.ts";

const PAGE_SIZE = 12;

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en");
}

const SUBJECT_GROUPS = [
  ["business", "商业与管理", "Business and management", /business|management|account|finance|econom|marketing|entrepreneur|logistic/i],
  ["computing", "计算机与信息技术", "Computing and IT", /comput|information technology|data|software|cyber|artificial intelligence/i],
  ["engineering", "工程与技术", "Engineering and technology", /engineer|technology|aerospace|mechanical|electrical|electronic|civil|chemical/i],
  ["health", "医学与健康", "Medicine and health", /medic|health|nurs|pharmacy|dental|clinical|psychology|optometry|biomedical/i],
  ["science", "自然科学", "Natural sciences", /science|biology|chemistry|physics|mathemat|biotech|environment/i],
  ["arts", "艺术、人文与社会科学", "Arts, humanities and social sciences", /arts|humanit|social|language|communication|media|creative|politic|history/i],
  ["education", "教育", "Education", /education|teaching|pedagogy/i],
  ["law", "法律", "Law", /\blaw\b|legal/i],
  ["hospitality", "酒店、旅游与服务", "Hospitality, tourism and services", /hospitality|tourism|culinary|event|service/i],
  ["architecture", "建筑与建成环境", "Architecture and built environment", /architect|built environment|planning|survey|construction|design/i],
  ["agriculture", "农业与兽医", "Agriculture and veterinary studies", /agricultur|veterinary|forestry/i],
] as const;

function subjectGroup(record: LocalProgrammeRecord) {
  const text = `${record.facultyEn} ${record.facultyZh} ${record.nameEn} ${record.nameZh}`;
  return SUBJECT_GROUPS.find(([, , , pattern]) => pattern.test(text))?.[0] ?? "other";
}

function modeGroup(value: string) {
  const text = normalize(value);
  if (!text) return "";
  if (text.includes("research") || text === "r") return "research";
  if (text.includes("mixed") || text === "m" || text.includes("c&r")) return "mixed";
  if (text.includes("clinical")) return "clinical";
  return "coursework";
}

export function localFilterOptions(): FilterOptions {
  return {
    countries: [{ code: "MY", nameZh: "马来西亚", nameEn: "Malaysia" }],
    subjectCategories: [
      ...SUBJECT_GROUPS.map(([code, nameZh, nameEn]) => ({ code, nameZh, nameEn })),
      { code: "other", nameZh: "其他专业", nameEn: "Other subjects" },
    ],
    studyLevels: [
      { code: "bachelor", nameZh: "本科", nameEn: "Bachelor’s" },
      { code: "master", nameZh: "硕士", nameEn: "Master’s" },
      { code: "doctorate", nameZh: "博士", nameEn: "Doctorate" },
    ],
    courseModes: [
      { code: "coursework", nameZh: "授课型", nameEn: "Coursework" },
      { code: "research", nameZh: "研究型", nameEn: "Research" },
      { code: "mixed", nameZh: "混合型", nameEn: "Mixed mode" },
      { code: "clinical", nameZh: "临床型", nameEn: "Clinical" },
    ],
    languages: [{ code: "ENGLISH", nameZh: "英语", nameEn: "English" }],
  };
}

function durationInMonths(value: string) {
  const amount = Number(value.match(/\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(amount)) return null;
  const text = normalize(value);
  if (text.includes("year") || text.includes("年")) return Math.round(amount * 12);
  if (text.includes("semester") || text.includes("学期")) return Math.round(amount * 6);
  if (text.includes("month") || text.includes("月")) return Math.round(amount);
  return null;
}

function intakeMatches(value: string, selected: string) {
  if (!selected) return true;
  const month = Number(selected.slice(5, 7));
  const names = ["", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const text = normalize(value);
  return Boolean(month) && (text.includes(String(month)) || text.includes(names[month]));
}

function tuitionAmounts(value: string) {
  return [...value.replaceAll(",", "").matchAll(/\d+(?:\.\d+)?/g)]
    .map((match) => Number(match[0]))
    .filter((amount) => Number.isFinite(amount) && amount >= 100);
}

function recordMatches(record: LocalProgrammeRecord, query: Query) {
  const keyword = normalize(first(query, "q"));
  const category = normalize(first(query, "category"));
  const level = normalize(first(query, "level"));
  const mode = normalize(first(query, "mode"));
  const language = normalize(first(query, "language"));
  const duration = Number(first(query, "duration"));
  const searchable = normalize([record.nameZh, record.nameEn, record.facultyZh, record.facultyEn].join(" "));
  const recordCategory = subjectGroup(record);
  const recordMode = modeGroup(record.mode);
  const recordDuration = durationInMonths(record.duration);
  const tuitionMin = Number(first(query, "tuitionMin"));
  const tuitionMax = Number(first(query, "tuitionMax"));
  const fees = tuitionAmounts(record.tuition);

  return (!keyword || searchable.includes(keyword))
    && (!category || recordCategory === category)
    && (!level || normalize(record.level) === level)
    && (!mode || recordMode === mode)
    && (!language || language === "english")
    && (!duration || recordDuration === duration)
    && (!tuitionMin || fees.some((fee) => fee >= tuitionMin))
    && (!tuitionMax || fees.some((fee) => fee <= tuitionMax))
    && intakeMatches(record.intakes, first(query, "intake"));
}

export function localProgrammeMatches(query: Query, locale: "zh" | "en") {
  const hasProgrammeFilter = ["q", "category", "level", "mode", "language", "duration", "intake", "tuitionMin", "tuitionMax"]
    .some((name) => Boolean(first(query, name)));
  const matches = new Map<string, { count: number; courses: { id: string; name: string; level?: string; language?: string }[] }>();

  for (const [index, record] of LOCAL_PROGRAMMES.entries()) {
    if (hasProgrammeFilter && !recordMatches(record, query)) continue;
    const current = matches.get(record.universityId) ?? { count: 0, courses: [] };
    current.count += 1;
    if (current.courses.length < 3) current.courses.push({
      id: `${record.universityId}-${record.level}-${index + 1}`,
      name: (locale === "zh" ? record.nameZh : record.nameEn) || record.nameEn || record.nameZh,
      level: record.level.toUpperCase(),
      language: "ENGLISH",
    });
    matches.set(record.universityId, current);
  }
  return { hasProgrammeFilter, matches };
}

function selectedLevels(query: Query) {
  const raw = query.level;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return new Set(values.map((value) => value.trim()).filter(Boolean));
}

export function formatProgrammeDuration(value: string) {
  if (!value) return null;
  return /^\d+(?:\.\d+)?(?:\s*\+\s*\d+)?$/.test(value.trim())
    ? `${value.trim()} semesters`
    : value;
}

function interviewDisplay(value: string, locale: "zh" | "en") {
  if (!value) return "";
  if (["√", "Y", "YES"].includes(value.toUpperCase())) return locale === "zh" ? "需要" : "Required";
  if (["X", "N", "NO"].includes(value.toUpperCase())) return locale === "zh" ? "不需要" : "Not required";
  return value;
}

function description(record: LocalProgrammeRecord, locale: "zh" | "en") {
  const parts = [
    record.academicRequirement && `${locale === "zh" ? "学术要求" : "Academic requirement"}: ${record.academicRequirement}`,
    record.englishRequirement && `${locale === "zh" ? "英语要求" : "English requirement"}: ${record.englishRequirement}`,
    record.registrationFee && `${locale === "zh" ? "注册费" : "Registration fee"}: ${record.registrationFee}`,
    record.interview && `${locale === "zh" ? "面试" : "Interview"}: ${interviewDisplay(record.interview, locale)}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

function toProgramme(record: LocalProgrammeRecord, index: number) {
  const code = `${record.universityId}-${record.level}-${index + 1}`;
  return {
    id: index + 1,
    programmeCode: code.toUpperCase(),
    slug: code,
    nameZh: record.nameZh || null,
    nameEn: record.nameEn || null,
    descriptionZh: description(record, "zh") || null,
    descriptionEn: description(record, "en") || null,
    categoryCode: record.facultyEn || record.facultyZh,
    categoryDisplayZh: record.facultyZh,
    categoryDisplayEn: record.facultyEn,
    studyLevelCode: record.level,
    courseModeCode: record.mode || null,
    languageCodes: [],
    durationMonths: null,
    durationDisplay: formatProgrammeDuration(record.duration),
    tuitionMin: null,
    tuitionMax: null,
    tuitionCurrency: null,
    tuitionFeePeriod: "",
    tuitionTotalRmbMin: null,
    tuitionTotalRmbMax: null,
    exchangeRate: null,
    exchangeRateDate: null,
    tuitionDisplay: record.tuition || null,
    intakeMonths: [],
    intakeDisplayTexts: record.intakes ? record.intakes.split(" · ") : [],
  };
}

export function localProgrammePage(slug: string, query: Query): UniversityProgrammePage {
  const university = findUniversityBySlug(slug);
  if (!university) return { items: [], page: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 0 };

  const levels = selectedLevels(query);
  const keyword = normalize(first(query, "q"));
  const records = LOCAL_PROGRAMMES.filter((record) =>
    record.universityId === university.id
    && (!levels.size || levels.has(record.level))
    && (!keyword || normalize([record.nameZh, record.nameEn, record.facultyZh, record.facultyEn].join(" ")).includes(keyword)),
  );
  const totalItems = records.length;
  const totalPages = totalItems ? Math.ceil(totalItems / PAGE_SIZE) : 0;
  const page = boundedPage(pageNumber(first(query, "page")), totalPages);
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: records.slice(start, start + PAGE_SIZE).map((record, offset) => toProgramme(record, start + offset)),
    page,
    pageSize: PAGE_SIZE,
    totalItems,
    totalPages,
  };
}

export function localProgrammeLevels(slug: string) {
  const university = findUniversityBySlug(slug);
  if (!university) return [];
  return ["bachelor", "master", "doctorate"].filter((level) =>
    LOCAL_PROGRAMMES.some((record) => record.universityId === university.id && record.level === level),
  );
}
