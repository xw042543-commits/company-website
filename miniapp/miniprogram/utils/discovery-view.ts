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
}

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

  return [
    { key: 'INTRODUCTION', type: 'INTRODUCTION', title: '专业介绍', body: introduction || '专业介绍资料正在整理中，请咨询顾问确认。', available: Boolean(introduction) },
    { key: 'BASIC_INFORMATION', type: 'BASIC_INFORMATION', title: '专业基本信息', body: '', available: true },
    { key: 'CAREER_PROSPECTS', type: 'CAREER_PROSPECTS', title: '专业前景', body: career || '专业前景资料正在整理中，请咨询顾问确认。', available: Boolean(career) },
    { key: 'CURRICULUM', type: 'CURRICULUM', title: '专业课程', body: curriculum || '专业课程资料正在整理中，请咨询顾问确认。', available: Boolean(curriculum) },
  ];
}
