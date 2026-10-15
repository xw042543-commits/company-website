export type StudyLevelSource = {
  code?: string | null | undefined;
  nameZh?: string | null | undefined;
  nameEn?: string | null | undefined;
};

export type StudyLevelKey = 'foundation' | 'diploma' | 'bachelor' | 'master' | 'doctorate';

const chineseNames: Readonly<Record<StudyLevelKey, string>> = {
  foundation: '预科',
  diploma: '大专',
  bachelor: '本科',
  master: '硕士',
  doctorate: '博士',
};

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/[^a-z\u4e00-\u9fff]/g, '') ?? '';
}

export function canonicalStudyLevel(source: StudyLevelSource): StudyLevelKey | null {
  const values = [source.code, source.nameZh, source.nameEn].map(normalize).filter(Boolean);
  for (const value of values) {
    if (value.includes('预科') || value.includes('foundation') || value.includes('preuniversity')) return 'foundation';
    if (value.includes('博士') || value === 'phd' || value === 'doctor'
      || value.includes('doctorate') || value.includes('doctoral') || value.includes('doctorofphilosophy')) return 'doctorate';
    if (value.includes('硕士') || value.includes('master')) return 'master';
    if (value.includes('本科') || value.includes('bachelor') || value === 'undergraduate') return 'bachelor';
    if (value.includes('大专') || value.includes('文凭') || value.includes('diploma')) return 'diploma';
  }
  return null;
}

export function studyLevelNameZh(source: StudyLevelSource): string {
  const key = canonicalStudyLevel(source);
  return key ? chineseNames[key] : source.nameZh?.trim() || source.nameEn?.trim() || source.code?.trim() || '';
}

export function uniqueStudyLevelNamesZh(sources: readonly StudyLevelSource[]): string[] {
  return [...new Set(sources.map(studyLevelNameZh).filter(Boolean))];
}

export function normalizeStudyLevelOptions<T extends StudyLevelSource>(options: readonly T[]): T[] {
  const seen = new Set<string>();
  return options.flatMap(option => {
    const nameZh = studyLevelNameZh(option);
    const identity = canonicalStudyLevel(option) ?? normalize(option.code) ?? nameZh;
    if (!identity || seen.has(identity)) return [];
    seen.add(identity);
    return [{ ...option, nameZh }];
  });
}
