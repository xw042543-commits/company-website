import type { UniversityProgramme } from '../services/universities';
import type { ProgrammeDetail, ProgrammeDetailSection } from '../services/miniapp-data';

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
export interface ProgrammeCurriculumItem { readonly number: string; readonly nameZh: string; readonly nameEn: string }

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
  const curriculumSection = firstSection(programme.sections, ['CURRICULUM', 'COURSE_STRUCTURE']);
  const introduction = programme.descriptionZh.trim()
    || (introductionSection ? sectionBody(introductionSection) : '');
  const career = careerSection ? sectionBody(careerSection) : '';
  const officialCurriculum = curriculumSection && curriculumSection.sourceUrl
    ? sectionBody(curriculumSection) : '';

  const curriculumItems = parseCurriculumItems(officialCurriculum);
  const careerBlocks = parseLabelledBlocks(career);
  const careerOfficial = Boolean(careerSection?.sourceUrl);
  const curriculumOfficial = Boolean(curriculumSection?.sourceUrl && curriculumItems.length);
  return [
    documentSection('INTRODUCTION', 'INTRODUCTION', '专业介绍', introduction),
    documentSection('BASIC_INFORMATION', 'BASIC_INFORMATION', '专业基本信息', '', true),
    { ...documentSection('CAREER_PROSPECTS', 'CAREER_PROSPECTS', '专业前景', career),
      contentBlocks: careerBlocks, official: careerOfficial,
      notice: career ? (careerOfficial ? '学校官网资料' : '一般职业建议，非院校官方说明') : '',
      sourceUrl: careerSection?.sourceUrl || '', sourceCheckedLabel: checkedLabel(careerSection?.sourceCheckedAt) },
    { ...documentSection('CURRICULUM', 'CURRICULUM', '专业课程', curriculumOfficial ? officialCurriculum : '暂无官方课程资料', curriculumOfficial),
      curriculumItems, official: curriculumOfficial,
      notice: curriculumOfficial ? '课程名称来自学校官网' : '',
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
    const nameZh = explicit?.[2]?.trim() || '';
    let nameEn = explicit?.[3]?.trim() || line.trim();
    nameEn = nameEn.replace(/^(?:Year\s+\d+(?:\s*-\s*Year\s+\d+)?\s*)+/i, '').trim();
    if (!nameEn || curriculumBoilerplate(nameEn)) continue;
    const dedupeKey = `${nameZh}\u0000${nameEn}`.toLocaleLowerCase('en');
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    items.push({ number: String(items.length + 1).padStart(2, '0'), nameZh, nameEn });
  }
  return items;
}

function curriculumBoilerplate(value: string): boolean {
  return /^(?:\d{1,3}[.)]\s*)?(?:\[?select\]?|note:?|next\s*:|year\s*\d+\b|semester\s*\d+\b|option\s*\d+\s*:|#?pre-?requisite|students?\b|compulsory university courses?\b|programme course elective\b|speciali[sz]ation(?:\s*\/| modules?\b| electives?\b)|(?:programme?|program|core|university|univerity|faculty|faculty open|free|open|external faculty|department|clinical) electives?\b|elective(?: courses?)?\b|kursus elektif\b|pilih\b|flexible studies\b|\*{1,2}(?:taken|pass)\b)/i.test(value)
    || /(?:\bchoose\s+(?:any\s+)?(?:one|two|three|four|five|seven|\d+)\b|\brefer to (?:the )?(?:attached )?list\b|\bstudents? (?:are )?required\b|\bsubject to availability\b|\bpilih\b|\brujuk\b|\bsila\b|\bsahaja\b|\bentry requirements?\b|\bminimum (?:average|score|cgpa|grade)\b|\b(?:ielts|toefl|muet)\b|\d+\s*%)/i.test(value)
    || /^参考学习领域|^参考课程结构|^illustrative study areas/i.test(value);
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
