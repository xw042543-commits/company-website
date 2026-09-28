import { findUniversityBySlug } from "./university-catalog.ts";
import { LOCAL_PROGRAMMES, type LocalProgrammeRecord } from "./local-programmes.generated.ts";
import type { UniversityProgrammePage } from "../lib/university-api.ts";
import { boundedPage, first, pageNumber, type Query } from "../lib/site.ts";

const PAGE_SIZE = 12;

function selectedLevels(query: Query) {
  const raw = query.level;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return new Set(values.map((value) => value.trim()).filter(Boolean));
}

function durationDisplay(value: string) {
  if (!value) return null;
  if (/\b(?:sem|semester|year|month|week|年|月|学期)\b/i.test(value)) return value;
  return `${value} semesters`;
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
    durationDisplay: durationDisplay(record.duration),
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
  const records = LOCAL_PROGRAMMES.filter((record) =>
    record.universityId === university.id && (!levels.size || levels.has(record.level)),
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
