import type { UniversityProgramme } from '../services/universities';
import type { ProgrammeDetail, ProgrammeDetailSection, OfficialCourseModule } from '../services/miniapp-data';

export interface ProgrammeCategory {
  readonly code: string;
  readonly label: string;
}

export function deriveProgrammeCategories(
  programmes: readonly UniversityProgramme[],
  labels: ReadonlyMap<string, string>,
): ProgrammeCategory[] {
  const categories: ProgrammeCategory[] = [{ code: 'ALL', label: '全部学院' }];
  const seen = new Set<string>(['ALL']);
  for (const programme of programmes) {
    const code = programme.categoryCode;
    if (seen.has(code)) continue;
    seen.add(code);
    categories.push({ code, label: labels.get(code) || code });
  }
  return categories;
}

export function filterProgrammes(
  programmes: readonly UniversityProgramme[],
  categoryCode: string,
): UniversityProgramme[] {
  return programmes.filter((programme) => categoryCode === 'ALL' || programme.categoryCode === categoryCode);
}

export interface ProgrammeDocumentSection {
  readonly key: string;
  readonly type: string;
  readonly title: string;
  readonly body: string;
  readonly available: boolean;
  readonly contentBlocks: readonly ProgrammeContentBlock[];
  readonly curriculumItems: readonly ProgrammeCurriculumItem[];
  readonly notice: string;
  readonly sourceUrl: string;
  readonly sourceCheckedLabel: string;
  readonly official: boolean;
}

export interface ProgrammeContentBlock { readonly label: string; readonly text: string }
export interface ProgrammeCurriculumItem { readonly number: string; readonly nameZh: string; readonly nameEn: string; readonly descriptionZh?: string | null; readonly courseCode?: string | null; readonly credits?: string | null; readonly requirement?: string | null; readonly sourceUrl?: string; readonly sourceCheckedLabel?: string; readonly curriculumVersion?: string | null }

function sectionBody(section: ProgrammeDetailSection): string {
  return section.bodyZh.trim() ? section.bodyZh : section.bodyEn;
}

function firstSection(sections: readonly ProgrammeDetailSection[], types: readonly string[]): ProgrammeDetailSection | undefined {
  const aliases = new Set(types);
  return [...sections]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .filter((section) => aliases.has(section.type))
    .find((section) => sectionBody(section).trim());
}

export function buildProgrammeDocument(programme: ProgrammeDetail): ProgrammeDocumentSection[] {
  const introductionSection = firstSection(programme.sections, ['INTRODUCTION']);
  const careerSection = firstSection(programme.sections, ['CAREER_OPPORTUNITIES', 'CAREER_OUTLOOK']);
  const curriculumSection = [...programme.sections].sort((a,b) => a.sortOrder - b.sortOrder).find(section =>
    ['CURRICULUM', 'COURSE_STRUCTURE'].indexOf(section.type) >= 0 && section.sourceType === 'official'
    && section.curriculumReviewStatus === 'VERIFIED' && Boolean(section.courseModules?.length));
  const introduction = programme.descriptionZh.trim()
    || (introductionSection ? sectionBody(introductionSection) : '');
  const career = careerSection ? sectionBody(careerSection) : '';
  const verifiedModules = curriculumSection?.sourceType === 'official'
    && curriculumSection.curriculumReviewStatus === 'VERIFIED' ? curriculumSection.courseModules ?? [] : [];
  const modulesValid = verifiedModules.every(item => Boolean(item.nameZh && /[\u3400-\u9fff]/u.test(item.nameZh) && item.nameEn && !/[\u3400-\u9fff]/u.test(item.nameEn)
    && !curriculumBoilerplate(item.nameEn) && item.sourceUrl?.startsWith('https://')
    && Number.isFinite(Date.parse(item.sourceCheckedAt))));
  const curriculumItems: ProgrammeCurriculumItem[] = modulesValid ? verifiedModules.map((item: OfficialCourseModule, index) => ({
    number: String(index + 1).padStart(2, '0'), nameZh: item.nameZh, nameEn: item.nameEn, descriptionZh: item.descriptionZh ?? null,
    courseCode: item.courseCode, credits: item.credits, requirement: item.requirement ? (({Elective: '选修', Compulsory: '必修', Required: '必修', Core: '核心', OR: '可选课程'} as Record<string, string>)[item.requirement] ?? item.requirement) : null,
    sourceUrl: item.sourceUrl, sourceCheckedLabel: checkedLabel(item.sourceCheckedAt),
    curriculumVersion: item.curriculumVersion,
  })) : [];
  const curriculum = curriculumItems.map(item => item.nameZh).join('\n');
  const careerBlocks = parseLabelledBlocks(career);
  const careerOfficial = careerSection?.sourceType === 'official'
    || (!careerSection?.sourceType && Boolean(careerSection?.sourceUrl));
  const curriculumOfficial = curriculumItems.length > 0;
  return [
    documentSection('INTRODUCTION', 'INTRODUCTION', '专业介绍', introduction),
    documentSection('BASIC_INFORMATION', 'BASIC_INFORMATION', '专业基本信息', '', true),
    { ...documentSection('CAREER_PROSPECTS', 'CAREER_PROSPECTS', '专业前景', career),
      contentBlocks: careerBlocks, official: careerOfficial,
      notice: career ? provenanceNotice(careerSection?.sourceType, '职业信息', Boolean(careerSection?.sourceUrl)) : '',
      sourceUrl: careerSection?.sourceUrl || '', sourceCheckedLabel: checkedLabel(careerSection?.sourceCheckedAt) },
    { ...documentSection('CURRICULUM', 'CURRICULUM', '专业课程', curriculum || '待核实：暂无官方课程资料', Boolean(curriculum)),
      curriculumItems, official: curriculumOfficial,
      notice: curriculum ? provenanceNotice(curriculumSection?.sourceType, '课程', Boolean(curriculumSection?.sourceUrl)) : '',
      sourceUrl: curriculumSection?.sourceUrl || '', sourceCheckedLabel: checkedLabel(curriculumSection?.sourceCheckedAt) },
  ];
}

function documentSection(key: string, type: string, title: string, body: string, available = Boolean(body)): ProgrammeDocumentSection {
  return { key, type, title, body, available, contentBlocks: [], curriculumItems: [], notice: '',
    sourceUrl: '', sourceCheckedLabel: '', official: false };
}

export function parseCurriculumItems(body: string): ProgrammeCurriculumItem[] {
  const items: ProgrammeCurriculumItem[] = [];
  const seen = new Set<string>();
  for (const line of body.split(/\r?\n/)) {
    const explicit = line.trim().match(/^(\d{2})\|([^|]+)\|([^|]+)$/);
    const nameZh = '';
    let nameEn = explicit?.[3]?.trim() || line.trim();
    nameEn = nameEn.replace(/^(?:Year\s+\d+(?:\s*-\s*Year\s+\d+)?\s*)+/i, '').trim();
    if (!nameEn || /[\u3400-\u9fff]/u.test(nameEn) || curriculumBoilerplate(nameEn)) continue;
    const dedupeKey = `${nameZh}\u0000${nameEn}`.toLocaleLowerCase('en');
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    items.push({ number: String(items.length + 1).padStart(2, '0'), nameZh, nameEn });
  }
  return items;
}

function curriculumBoilerplate(value: string): boolean {
  if (/\b(?:CGPA|GPA|tuition)\b/i.test(value)) return true;
  return /^(?:\d{1,3}[.)]\s*)?(?:\[?select\]?(?=\s|:|$)|note:?|next\s*:|year\s*\d+\b|semester\s*\d+\b|option\s*\d+\s*:|#?pre-?requisite|students?\b|compulsory university courses?\b|programme course elective\b|speciali[sz]ation(?:\s*\/| modules?\b| electives?\b)|(?:programme?|program|core|university|univerity|faculty|faculty open|free|open|external faculty|department|clinical) electives?\b|elective(?: courses?| modules?)?(?:[ _]*(?:\d+|[IVX]+))?\s*(?:$|[:(])|kursus elektif\b|pilih\b|flexible studies\b|\*{1,2}(?:taken|pass)\b)/i.test(value)
    || /(?:\bchoose\s+(?:any\s+)?(?:one|two|three|four|five|seven|\d+)\b|\brefer to (?:the )?(?:attached )?list\b|\bstudents? (?:are )?required\b|\bsubject to availability\b|\bpilih\b|\brujuk\b|\bsila\b|\bsahaja\b|\bentry requirements?\b|\bminimum (?:average|score|cgpa|grade)\b|\b(?:ielts|toefl|muet)\b|\d+\s*%)/i.test(value)
    || /^(?:参考学习领域|参考课程结构|说明[：:]|illustrative study areas|note:)/i.test(value);
}

function provenanceNotice(type: ProgrammeDetailSection['sourceType'] | undefined, subject: string, hasSourceUrl = false): string {
  if (type === 'official' || (!type && hasSourceUrl)) return subject === '课程' ? '课程原文来自学校官网，中文为平台译名' : `${subject}来自学校官网`;
  if (type === 'third_party') return `${subject}来自第三方资料，请以学校官网最新信息为准`;
  return subject === '课程'
    ? '参考学习领域，非官方课程表；不代表院校课程名称、学分或必修安排'
    : '根据专业领域整理的一般职业建议，非院校官方就业说明';
}

function checkedLabel(value: string | null | undefined): string {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

function parseLabelledBlocks(body: string): ProgrammeContentBlock[] {
  const blocks: ProgrammeContentBlock[] = [];
  for (const paragraph of body.split(/\n\s*\n/)) {
    const match = paragraph.trim().match(/^([^：:]{2,12})[：:]\s*(.+)$/s);
    const label = match?.[1]; const text = match?.[2];
    if (label && text) blocks.push({ label: label.trim(), text: text.trim() });
  }
  return blocks.length >= 3 ? blocks : [];
}
