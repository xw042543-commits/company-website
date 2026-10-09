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
  readonly locked: boolean;
}

const TEMPORARILY_LOCKED_SECTIONS: ReadonlySet<string> = new Set([
  'ADMISSION_REQUIREMENTS', 'ADMISSIONS', 'COURSE_STRUCTURE', 'CURRICULUM',
]);

export function isTemporarilyLockedSection(type: string): boolean {
  return TEMPORARILY_LOCKED_SECTIONS.has(type);
}

function sectionBody(section: ProgrammeDetailSection): string {
  return section.bodyZh.trim() ? section.bodyZh : section.bodyEn;
}

export function buildProgrammeDocument(programme: ProgrammeDetail): ProgrammeDocumentSection[] {
  const sections = [...programme.sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const introduction = sections.find((section) => section.type === 'INTRODUCTION' && sectionBody(section).trim());
  const body = programme.descriptionZh.trim()
    ? programme.descriptionZh
    : introduction ? sectionBody(introduction) : '';

  return [
    { key: 'INTRODUCTION', type: 'INTRODUCTION', title: '专业描述', body, locked: false },
    { key: 'BASIC_INFORMATION', type: 'BASIC_INFORMATION', title: '基本信息', body: '', locked: false },
    ...sections.filter((section) => section.type !== 'INTRODUCTION').map((section, index) => ({
      key: `${section.type}-${index}`,
      type: section.type,
      title: section.titleZh.trim() ? section.titleZh : section.titleEn,
      body: sectionBody(section),
      locked: isTemporarilyLockedSection(section.type),
    })),
  ];
}
