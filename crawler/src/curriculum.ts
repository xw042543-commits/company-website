import { plainText } from "./html.ts";

const BULLET_PREFIX = /^[\s\u00a0]*[•·●▪◦‣]\s*/u;
const ORDER_PREFIX = /^\d{1,3}[.)]\s*/;
const NON_COURSE_LINE = /^(?:note\b|next\s*:|year\s*\d+\b|semester\s*\d+\b|option\s*\d+\s*:|select\b|choose\b|students?\b|all information\b|this (?:component|programme|module)\b|primary major\b|common core\b|programme structure\b|compulsory university courses?\b|programme course elective\b|speciali[sz]ation(?:\s*\/| modules?\b| electives?\b)|(?:programme?|program|core|university|univerity|faculty|faculty open|free|open|external faculty|department|clinical) electives?\b|elective(?: courses?)?\b|electives?\s*\(\d+\)\b|extension\s*\d+\s*\/|kursus elektif\b|pilih\b|flexible studies\b)/i;
const ADMISSIONS_OR_FEE = /(?:\b(?:entry requirements?|qualification|minimum (?:average|score|cgpa|grade)|ielts|toefl|muet|pte academic|international students?|local students?)\b|\d+\s*%|\b(?:RM|MYR|USD)\s*\d)/i;
const INSTRUCTION_TEXT = /(?:\bchoose\s+(?:any\s+)?(?:one|two|three|four|five|seven|\d+)\b|\brefer to (?:the )?(?:attached )?list\b|\bstudents? (?:are )?required\b|\bsubject to availability\b|\bpilih\b|\brujuk\b|\bsila\b|\bsahaja\b)/i;

export function extractOfficialCourseTitles(sectionHtml: string): string[] {
  const candidates: string[] = [];

  // A leaf list item represents one module. Parent list items often contain
  // instructions such as "choose three" plus a nested list, so skip them.
  for (const match of sectionHtml.matchAll(/<li\b[^>]*>((?:(?!<li\b)[\s\S])*?)<\/li>/gi)) {
    candidates.push(plainText(match[1]));
  }

  // Taylor's programme pages encode modules as bullet-prefixed paragraphs.
  for (const match of sectionHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = plainText(match[1]);
    if (BULLET_PREFIX.test(text)) candidates.push(text.replace(BULLET_PREFIX, ""));
  }

  return normalizeOfficialCourseTitles(candidates);
}

export function normalizeOfficialCourseTitles(values: Iterable<string>): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const title = normalizeCandidate(value);
    if (!isOfficialCourseTitle(title)) continue;
    const key = title.toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(title);
  }
  return result;
}

function normalizeCandidate(value: string): string {
  let title = value.normalize("NFKC").replace(BULLET_PREFIX, "").replace(ORDER_PREFIX, "").replace(/\s+/g, " ").trim();
  const labelledCourse = [
    /^Elective University Courses \(Student Holistic Empowerment\):\s*(.+)$/i,
    /^Elective Courses:\s*Student Holistic Empowerment.*?\s-\s(.+)$/i,
    /^Elective Courses:\s*Faculty Course\s*-\s*(.+)$/i,
    /^Elective Courses:\s*University Courses.*?:\s*([A-Z]{2,}\w*\s+.+)$/i,
  ].map((pattern) => title.match(pattern)?.[1]?.trim()).find(Boolean);
  if (labelledCourse) title = labelledCourse;
  title = title.replace(/\s*\(Offered in Year\s*\d+\s+Semester\s*\d+\)\s*$/i, "").trim();
  return title;
}

export function isOfficialCourseTitle(value: string): boolean {
  const title = value.trim();
  if (title.length < 2 || title.length > 180) return false;
  if (NON_COURSE_LINE.test(title) || ADMISSIONS_OR_FEE.test(title) || INSTRUCTION_TEXT.test(title)) return false;
  if (/^(?:year|semester|level|track|mode)\s*[\divx-]*$/i.test(title)) return false;
  if (/^(?:speciali[sz]ation|major|minor|extension|elective)(?:\s+(?:module|package|course)s?)?\s*$/i.test(title)) return false;
  if (/speciali[sz]ation:\s*$/i.test(title)) return false;
  if (/^[A-Z]{2,}\d+[A-Z0-9]*$/i.test(title) || /\b(?:and|or|of|for|to|in|with|&)\s*$/i.test(title)) return false;
  if (/^(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.)/i.test(title)) return false;
  return true;
}

export function validateOfficialCurriculum(body: string): string[] {
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const normalized = normalizeOfficialCourseTitles(lines);
  if (normalized.length !== lines.length || normalized.length === 0) {
    throw new Error("课程结构包含非课程标题或没有可验证的官网课程标题");
  }
  return normalized;
}
