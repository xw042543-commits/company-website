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
}

export interface ProgrammeContentBlock { readonly label: string; readonly text: string }
export interface ProgrammeCurriculumItem { readonly number: string; readonly nameZh: string; readonly nameEn: string }

function sectionBody(section: ProgrammeDetailSection): string {
  return section.bodyZh.trim() ? section.bodyZh : section.bodyEn;
}

function firstSection(sections: readonly ProgrammeDetailSection[], types: readonly string[]): string {
  const aliases = new Set(types);
  return [...sections]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .filter((section) => aliases.has(section.type))
    .map(sectionBody)
    .find((body) => body.trim()) || '';
}

export function buildProgrammeDocument(programme: ProgrammeDetail): ProgrammeDocumentSection[] {
  const introduction = programme.descriptionZh.trim()
    || firstSection(programme.sections, ['INTRODUCTION']);
  const career = firstSection(programme.sections, ['CAREER_OPPORTUNITIES', 'CAREER_OUTLOOK']);
  const curriculum = firstSection(programme.sections, ['CURRICULUM', 'COURSE_STRUCTURE']);

  const curriculumItems = parseCurriculumItems(curriculum);
  const careerBlocks = parseLabelledBlocks(career);
  return [
    documentSection('INTRODUCTION', 'INTRODUCTION', '专业介绍', introduction),
    documentSection('BASIC_INFORMATION', 'BASIC_INFORMATION', '专业基本信息', '', true),
    { ...documentSection('CAREER_PROSPECTS', 'CAREER_PROSPECTS', '专业前景', career), contentBlocks: careerBlocks },
    { ...documentSection('CURRICULUM', 'CURRICULUM', '专业课程', curriculum), curriculumItems,
      notice: curriculumItems.length ? '参考学习领域，非官方课程表' : '' },
  ];
}

function documentSection(key: string, type: string, title: string, body: string, available = Boolean(body)): ProgrammeDocumentSection {
  return { key, type, title, body, available, contentBlocks: [], curriculumItems: [], notice: '' };
}

export function parseCurriculumItems(body: string): ProgrammeCurriculumItem[] {
  const items: ProgrammeCurriculumItem[] = [];
  for (const line of body.split(/\r?\n/)) {
    const match = line.trim().match(/^(\d{2})\|([^|]+)\|([^|]+)$/);
    if (!match) continue;
    const [, number, nameZh, nameEn] = match;
    if (!number || !nameZh || !nameEn) continue;
    items.push({ number, nameZh: nameZh.trim(), nameEn: nameEn.trim() });
  }
  return items;
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
