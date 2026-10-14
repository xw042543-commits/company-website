import assert from 'node:assert/strict';
import test from 'node:test';

import type { FilterOption } from '../miniprogram/services/catalogue.ts';
import type { UniversityProgramme } from '../miniprogram/services/universities.ts';
import type { ProgrammeDetail, ProgrammeDetailSection } from '../miniprogram/services/miniapp-data.ts';
import {
  buildProgrammeDocument,
  deriveProgrammeCategories,
  filterProgrammes,
  parseCurriculumItems,
} from '../miniprogram/utils/discovery-view.ts';

function programme(id: number, categoryCode: string): UniversityProgramme {
  return {
    id, categoryCode, slug: `programme-${id}`, nameZh: '专业', nameEn: 'Programme',
    studyLevelCode: 'BACHELOR', durationDisplay: '3年', tuitionDisplay: '待确认',
    intakeDisplayTexts: [],
  };
}

test('programme categories start with ALL and use catalogue Chinese labels in first-seen order', () => {
  const options: FilterOption[] = [
    { code: 'BUSINESS', nameZh: '商业与管理', nameEn: 'Business' },
    { code: 'COMPUTING', nameZh: '计算机科学', nameEn: 'Computing' },
  ];
  const labels = new Map(options.map((option) => [option.code, option.nameZh]));
  const programmes = Object.freeze([
    programme(1, 'COMPUTING'), programme(2, 'BUSINESS'),
    programme(3, 'COMPUTING'), programme(4, 'UNKNOWN'),
  ]);

  assert.deepEqual(deriveProgrammeCategories(programmes, labels), [
    { code: 'ALL', label: '全部学院' },
    { code: 'COMPUTING', label: '计算机科学' },
    { code: 'BUSINESS', label: '商业与管理' },
    { code: 'UNKNOWN', label: 'UNKNOWN' },
  ]);
});

test('programme categories fall back to the code when the Chinese label is empty', () => {
  assert.deepEqual(deriveProgrammeCategories([programme(1, 'BUSINESS')], new Map([
    ['BUSINESS', ''],
  ])), [
    { code: 'ALL', label: '全部学院' },
    { code: 'BUSINESS', label: 'BUSINESS' },
  ]);
});

test('programme categories retain the ALL choice for an empty programme list', () => {
  assert.deepEqual(deriveProgrammeCategories([], new Map()), [{ code: 'ALL', label: '全部学院' }]);
});

test('programme filtering returns all programmes for ALL without modifying the source', () => {
  const programmes = Object.freeze([programme(1, 'COMPUTING'), programme(2, 'BUSINESS')]);
  const filtered = filterProgrammes(programmes, 'ALL');

  assert.deepEqual(filtered.map((item) => item.id), [1, 2]);
  filtered.pop();
  assert.equal(programmes.length, 2);
});

test('programme filtering matches the exact category and preserves programme order', () => {
  const programmes = Object.freeze([
    programme(1, 'BUSINESS'), programme(2, 'business'), programme(3, 'BUSINESS'),
    programme(4, 'BUSINESS_ANALYTICS'),
  ]);

  assert.deepEqual(filterProgrammes(programmes, 'BUSINESS').map((item) => item.id), [1, 3]);
  assert.deepEqual(filterProgrammes(programmes, 'MISSING'), []);
  assert.deepEqual(filterProgrammes([], 'BUSINESS'), []);
});

test('unknown categories remain selectable and returning to ALL restores every programme', () => {
  const programmes = Object.freeze([
    programme(1, 'COMPUTING'), programme(2, 'UNLISTED'), programme(3, 'UNLISTED'),
  ]);
  const categories = deriveProgrammeCategories(programmes, new Map([['COMPUTING', '计算机科学']]));
  assert.deepEqual(categories.find((item) => item.code === 'UNLISTED'), { code: 'UNLISTED', label: 'UNLISTED' });
  assert.deepEqual(filterProgrammes(programmes, 'UNLISTED').map((item) => item.id), [2, 3]);
  assert.deepEqual(filterProgrammes(programmes, 'ALL').map((item) => item.id), [1, 2, 3]);
});

function detail(overrides: Partial<ProgrammeDetail> = {}): ProgrammeDetail {
  return {
    ...programme(1, 'COMPUTING'), programmeCode: 'CS', universitySlug: 'apu',
    universityNameZh: '亚太科技大学', universityNameEn: 'APU', cityZh: '吉隆坡',
    universityLogoUrl: null,
    descriptionZh: '专业描述正文', descriptionEn: 'Programme description', courseModeCode: 'ON_CAMPUS', languageCodes: ['EN'],
    studyPaceDisplay: '全日制', sections: [], imageUrl: null, ...overrides,
  };
}

function section(type: string, sortOrder: number, overrides: Partial<ProgrammeDetailSection> = {}): ProgrammeDetailSection {
  return {
    type, sortOrder, titleZh: `${type}标题`, titleEn: '',
    bodyZh: `${type}正文`, bodyEn: '', sourceUrl: null, sourceCheckedAt: null, ...overrides,
  };
}

test('programme document always exposes the four canonical detail blocks in product order', () => {
  const sections = [
    section('CAREER_OPPORTUNITIES', 30), section('CURRICULUM', 20),
    section('ADMISSIONS', 10),
  ];
  Object.freeze(sections);
  const document = buildProgrammeDocument(detail({ sections }));

  assert.deepEqual(document.map((item) => item.type), [
    'INTRODUCTION', 'BASIC_INFORMATION', 'CAREER_PROSPECTS', 'CURRICULUM',
  ]);
  assert.deepEqual(document[0], {
    key: 'INTRODUCTION', type: 'INTRODUCTION', title: '专业介绍', body: '专业描述正文', available: true,
    contentBlocks: [], curriculumItems: [], notice: '', sourceUrl: '', sourceCheckedLabel: '', official: false,
  });
  assert.deepEqual(document[1], {
    key: 'BASIC_INFORMATION', type: 'BASIC_INFORMATION', title: '专业基本信息', body: '', available: true,
    contentBlocks: [], curriculumItems: [], notice: '', sourceUrl: '', sourceCheckedLabel: '', official: false,
  });
  assert.deepEqual(document.slice(2).map(({ title, body, available }) => ({ title, body, available })), [
    { title: '专业前景', body: 'CAREER_OPPORTUNITIES正文', available: true },
    { title: '专业课程', body: '暂无官方课程资料', available: false },
  ]);
  assert.deepEqual(sections.map((item) => item.sortOrder), [30, 20, 10]);
});

test('programme document falls back to the first nonblank introduction in API sort order', () => {
  const document = buildProgrammeDocument(detail({
    descriptionZh: ' ', sections: [
      section('INTRODUCTION', 20, { bodyZh: '后续介绍' }),
      section('INTRODUCTION', 0, { bodyZh: '' }),
      section('INTRODUCTION', 10, { bodyZh: '最早可用介绍' }),
    ],
  }));

  assert.deepEqual(document.map((item) => item.type), ['INTRODUCTION', 'BASIC_INFORMATION', 'CAREER_PROSPECTS', 'CURRICULUM']);
  assert.equal(document[0]?.body, '最早可用介绍');
});

test('programme document accepts legacy aliases and English body fallback', () => {
  const input = detail({ sections: [
    section('COURSE_STRUCTURE', 10, { bodyZh: '', bodyEn: 'English curriculum' }),
    section('CAREER_OUTLOOK', 5, { bodyZh: '', bodyEn: 'English careers' }),
  ] });
  const document = buildProgrammeDocument(input);

  assert.deepEqual(document.map((item) => item.type), ['INTRODUCTION', 'BASIC_INFORMATION', 'CAREER_PROSPECTS', 'CURRICULUM']);
  assert.equal(new Set(document.map((item) => item.key)).size, document.length);
  assert.deepEqual(buildProgrammeDocument(input), document);
  assert.equal(document[2]?.body, 'English careers');
  assert.equal(document[3]?.body, '暂无官方课程资料');
});

test('programme document keeps canonical blocks without inventing pending content', () => {
  assert.deepEqual(buildProgrammeDocument(detail({ descriptionZh: '' })), [
    { key: 'INTRODUCTION', type: 'INTRODUCTION', title: '专业介绍', body: '', available: false, contentBlocks: [], curriculumItems: [], notice: '', sourceUrl: '', sourceCheckedLabel: '', official: false },
    { key: 'BASIC_INFORMATION', type: 'BASIC_INFORMATION', title: '专业基本信息', body: '', available: true, contentBlocks: [], curriculumItems: [], notice: '', sourceUrl: '', sourceCheckedLabel: '', official: false },
    { key: 'CAREER_PROSPECTS', type: 'CAREER_PROSPECTS', title: '专业前景', body: '', available: false, contentBlocks: [], curriculumItems: [], notice: '', sourceUrl: '', sourceCheckedLabel: '', official: false },
    { key: 'CURRICULUM', type: 'CURRICULUM', title: '专业课程', body: '暂无官方课程资料', available: false, contentBlocks: [], curriculumItems: [], notice: '', sourceUrl: '', sourceCheckedLabel: '', official: false },
  ]);
});

test('official curriculum builds a deduplicated vertical list and ignores old generated templates', () => {
  const body = 'Year 1 Year 2 Year 3 Year 4 Fundamentals of Programming\nDatabase Systems\nDatabase Systems\nNote:\n#Pre-requisite';
  assert.deepEqual(parseCurriculumItems(body), [
    { number: '01', nameZh: '', nameEn: 'Fundamentals of Programming' },
    { number: '02', nameZh: '', nameEn: 'Database Systems' },
  ]);
  const curriculumSection = buildProgrammeDocument(detail({ sections: [section('CURRICULUM', 40, {
    bodyZh: '', bodyEn: body, sourceUrl: 'https://study.um.edu.my/programme', sourceCheckedAt: '2026-10-14T00:00:00Z',
  })] }))[3];
  assert.equal(curriculumSection?.notice, '课程名称来自学校官网');
  assert.equal(curriculumSection?.sourceCheckedLabel, '2026-10-14');
  assert.equal(curriculumSection?.curriculumItems.length, 2);
  const generated = buildProgrammeDocument(detail({ sections: [section('CURRICULUM', 40, {
    bodyZh: '参考学习领域，非官方课程表\n01|程序设计基础|Programming Fundamentals',
  })] }))[3];
  assert.equal(generated?.body, '暂无官方课程资料');
  assert.equal(generated?.curriculumItems.length, 0);
});
