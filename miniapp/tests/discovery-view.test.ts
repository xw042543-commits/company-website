import assert from 'node:assert/strict';
import test from 'node:test';

import type { FilterOption } from '../miniprogram/services/catalogue.ts';
import type { UniversityProgramme } from '../miniprogram/services/universities.ts';
import type { ProgrammeDetail, ProgrammeDetailSection } from '../miniprogram/services/miniapp-data.ts';
import {
  buildProgrammeDocument,
  deriveProgrammeCategories,
  filterProgrammes,
  isTemporarilyLockedSection,
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
    descriptionZh: '专业描述正文', courseModeCode: 'ON_CAMPUS', languageCodes: ['EN'],
    studyPaceDisplay: '全日制', sections: [], imageUrl: null, ...overrides,
  };
}

function section(type: string, sortOrder: number, overrides: Partial<ProgrammeDetailSection> = {}): ProgrammeDetailSection {
  return {
    type, sortOrder, titleZh: `${type}标题`, titleEn: '',
    bodyZh: `${type}正文`, bodyEn: '', ...overrides,
  };
}

test('programme document places one introduction and synthetic basic information before sorted API sections', () => {
  const sections = [
    section('CAREER_OUTLOOK', 30), section('CURRICULUM', 20),
    section('INTRODUCTION', 0, { bodyZh: '重复介绍' }),
    section('ADMISSIONS', 10), section('INTRODUCTION', 5, { bodyZh: '另一个介绍' }),
  ];
  Object.freeze(sections);
  const document = buildProgrammeDocument(detail({ sections }));

  assert.deepEqual(document.map((item) => item.type), [
    'INTRODUCTION', 'BASIC_INFORMATION', 'ADMISSIONS', 'CURRICULUM', 'CAREER_OUTLOOK',
  ]);
  assert.deepEqual(document[0], {
    key: 'INTRODUCTION', type: 'INTRODUCTION', title: '专业描述', body: '专业描述正文', locked: false,
  });
  assert.deepEqual(document[1], {
    key: 'BASIC_INFORMATION', type: 'BASIC_INFORMATION', title: '基本信息', body: '', locked: false,
  });
  assert.deepEqual(document.slice(2).map(({ title, body, locked }) => ({ title, body, locked })), [
    { title: 'ADMISSIONS标题', body: 'ADMISSIONS正文', locked: true },
    { title: 'CURRICULUM标题', body: 'CURRICULUM正文', locked: true },
    { title: 'CAREER_OUTLOOK标题', body: 'CAREER_OUTLOOK正文', locked: false },
  ]);
  assert.deepEqual(sections.map((item) => item.sortOrder), [30, 20, 0, 10, 5]);
});

test('programme document falls back to the first nonblank introduction in API sort order', () => {
  const document = buildProgrammeDocument(detail({
    descriptionZh: ' ', sections: [
      section('INTRODUCTION', 20, { bodyZh: '后续介绍' }),
      section('INTRODUCTION', 0, { bodyZh: '' }),
      section('INTRODUCTION', 10, { bodyZh: '最早可用介绍' }),
    ],
  }));

  assert.deepEqual(document.map((item) => item.type), ['INTRODUCTION', 'BASIC_INFORMATION']);
  assert.equal(document[0]?.body, '最早可用介绍');
});

test('programme document preserves every remaining section with unique stable keys and English text fallback', () => {
  const input = detail({ sections: [
    section('ADMISSIONS', 10), section('ADMISSION_REQUIREMENTS', 10),
    section('OTHER', 15, { titleZh: '', titleEn: 'Details', bodyZh: '', bodyEn: 'English body' }),
    section('OTHER', 15),
  ] });
  const document = buildProgrammeDocument(input);

  assert.deepEqual(document.map((item) => item.type), [
    'INTRODUCTION', 'BASIC_INFORMATION', 'ADMISSIONS', 'ADMISSION_REQUIREMENTS', 'OTHER', 'OTHER',
  ]);
  assert.equal(new Set(document.map((item) => item.key)).size, document.length);
  assert.deepEqual(buildProgrammeDocument(input), document);
  assert.equal(document[4]?.title, 'Details');
  assert.equal(document[4]?.body, 'English body');
});

test('programme document keeps the two public anchors when no description or API sections exist', () => {
  assert.deepEqual(buildProgrammeDocument(detail({ descriptionZh: '' })), [
    { key: 'INTRODUCTION', type: 'INTRODUCTION', title: '专业描述', body: '', locked: false },
    { key: 'BASIC_INFORMATION', type: 'BASIC_INFORMATION', title: '基本信息', body: '', locked: false },
  ]);
});

test('temporary lock applies only to the four admission and curriculum aliases', () => {
  for (const type of ['ADMISSION_REQUIREMENTS', 'ADMISSIONS', 'COURSE_STRUCTURE', 'CURRICULUM']) {
    assert.equal(isTemporarilyLockedSection(type), true, type);
  }
  for (const type of [
    'INTRODUCTION', 'BASIC_INFORMATION', 'LEARNING_OUTCOMES', 'CAREER_OUTLOOK',
    'CAREER_OPPORTUNITIES', 'IDEAL_STUDENT', 'OTHER', '', 'admissions', 'CURRICULUM_EXTRA',
  ]) {
    assert.equal(isTemporarilyLockedSection(type), false, type);
  }
});
