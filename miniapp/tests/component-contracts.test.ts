import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import type { ProgrammeDocumentSection } from '../miniprogram/utils/discovery-view.ts';
import type { ProgrammeDetail } from '../miniprogram/services/miniapp-data.ts';

interface CardContext {
  data: { university: Record<string, unknown>; imageFailed: boolean; [key: string]: unknown };
  setData(update: Partial<CardContext['data']>): void;
  triggerEvent(name: string, detail: { slug: unknown }): void;
}

interface CardDefinition {
  data?: { imageFailed?: boolean };
  properties: { university: { observer?: (this: CardContext) => void } };
  methods: {
    imageError?: (this: CardContext) => void;
    select: (this: CardContext) => void;
  };
}

async function loadUniversityCard(): Promise<CardDefinition> {
  let registered: CardDefinition | undefined;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Component');
  Object.defineProperty(globalThis, 'Component', {
    configurable: true,
    value(definition: CardDefinition) { registered = definition; },
  });
  try {
    await import(new URL('../miniprogram/components/university-card/index.ts', import.meta.url).href);
  } finally {
    if (original) Object.defineProperty(globalThis, 'Component', original);
    else Reflect.deleteProperty(globalThis, 'Component');
  }
  assert.ok(registered, 'the native component must register its definition');
  return registered;
}

const definition = await loadUniversityCard();

interface ProgrammePageContext {
  data: {
    universitySlug: string; programmeId: string; state: string;
    programme: ProgrammeDetail | null; documentSections: ProgrammeDocumentSection[];
    basicFacts: Array<{ label: string; value: string }>;
    universityLogoUrl: string | null; imageFailed: boolean; logoLetter: string;
    favorite: boolean; saving: boolean; [key: string]: unknown;
  };
  favoriteRevision: number;
  setData(update: Record<string, unknown>): void;
}

interface ProgrammePageDefinition {
  data: ProgrammePageContext['data'];
  loadPage(this: ProgrammePageContext): Promise<void>;
  setupNavigation(this: ProgrammePageContext): void;
  imageError(this: ProgrammePageContext): void;
  toggleFavorite(this: ProgrammePageContext): Promise<void>;
  back(this: ProgrammePageContext): void;
  consult(this: ProgrammePageContext): void;
}

let programmePage: ProgrammePageDefinition | undefined;
async function loadProgrammePage(): Promise<ProgrammePageDefinition> {
  if (programmePage) return programmePage;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Page');
  Object.defineProperty(globalThis, 'Page', { configurable: true, value(page: ProgrammePageDefinition) { programmePage = page; } });
  try { await import(new URL('../miniprogram/pages/programme-detail/index.ts', import.meta.url).href); }
  finally {
    if (original) Object.defineProperty(globalThis, 'Page', original);
    else Reflect.deleteProperty(globalThis, 'Page');
  }
  assert.ok(programmePage);
  return programmePage;
}

test('programme document template clears custom navigation and renders semantic facts and safe locked previews', async () => {
  const base = '../miniprogram/pages/programme-detail/';
  const [markup, styles, configText] = await Promise.all(['index.wxml', 'index.wxss', 'index.json'].map((file) => readFile(new URL(base + file, import.meta.url), 'utf8')));
  const config = JSON.parse(configText!);
  assert.equal(config.navigationStyle, 'custom');
  assert.match(markup!, /class="custom-header"/);
  assert.match(markup!, /statusBarHeight/);
  assert.match(markup!, /navigationRight/);
  assert.match(markup!, /bindtap="back"[^>]+aria-label="返回"/);
  assert.match(markup!, /专业详情/);
  assert.match(styles!, /\.custom-header[^}]+background:#f5d66f/);
  assert.match(markup!, /class="identity-row"/);
  assert.match(markup!, /universityLogoUrl && !imageFailed/);
  assert.match(markup!, /mode="aspectFit"[^>]+binderror="imageError"/);
  assert.match(markup!, /logoLetter/);
  assert.match(markup!, /wx:for="\{\{documentSections\}\}"/);
  assert.match(markup!, /专业描述/);
  assert.match(markup!, /基本信息/);
  assert.doesNotMatch(markup!, /\srole\s*=/, 'native WeChat templates must use aria-role rather than the HTML role attribute');
  assert.match(markup!, /class="programme-title"[^>]+aria-role="heading"[^>]+aria-level="1"/);
  assert.match(markup!, /class="section-title"[^>]+aria-role="heading"[^>]+aria-level="2"/);
  assert.match(markup!, /class="facts-table"[^>]+aria-role="table"/);
  assert.match(markup!, /wx:for="\{\{basicFacts\}\}"[^>]+aria-role="row"/);
  assert.match(markup!, /class="fact-label"[^>]+aria-role="rowheader"/);
  assert.match(markup!, /class="fact-value"[^>]+aria-role="cell"/);
  const locked = markup!.match(/<view wx:elif="\{\{section.locked\}\}"[\s\S]*?(?=<view wx:else)/)?.[0];
  assert.ok(locked, 'locked branches must be distinct from public body rendering');
  assert.match(locked, /aria-hidden="true"/);
  assert.match(locked, /本节内容暂未开放/);
  assert.doesNotMatch(locked, /section\.body|<button|积分|支付|购买|解锁|价格|¥|RM|MYR/);
  assert.doesNotMatch(markup!, /aria-label="[^"]*(?:section|item)\.body/);
  assert.match(styles!, /filter:blur\(/);
  assert.match(styles!, /env\(safe-area-inset-bottom\)/);
  assert.match(styles!, /word-break:break-word/);
  assert.match(styles!, /\.fact-row:nth-child\(even\)/);
  assert.match(markup!, /bindtap="toggleFavorite"/);
  assert.match(markup!, /disabled="\{\{saving\}\}"/);
  assert.match(markup!, /bindtap="consult"/);
  assert.doesNotMatch(markup!, /activeTab|selectTab/);
});

test('programme page builds ordered document and meaningful facts with logo and audited missing-value fallbacks', async () => {
  const page = await loadProgrammePage();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  try {
    for (const scenario of ['complete', 'empty', 'pace'] as const) {
      const complete = scenario !== 'empty';
      const universitySlug = complete ? 'asia-pacific-university' : 'contract-programme-empty';
      const programmeId = scenario === 'pace' ? '805' : '804';
      const payload = {
        id: 804, slug: 'computer-science', nameZh: '计算机科学学士', nameEn: 'Bachelor of Computer Science',
        universitySlug, universityNameZh: '亚太科技大学', universityNameEn: complete ? 'APU' : '',
        descriptionZh: '专业描述正文', cityZh: complete ? '吉隆坡' : '',
        studyLevelCode: complete ? 'BACHELOR' : '', durationDisplay: complete ? '3年' : '',
        courseModeCode: scenario === 'complete' ? 'ON_CAMPUS' : '', studyPaceDisplay: complete ? '全日制' : '',
        languageCodes: complete ? [' EN ', '', 'ZH'] : [], intakeDisplayTexts: complete ? ['9月', ' ', '1月'] : [],
        tuitionDisplay: complete ? 'RM 90,000' : '', sections: [
          { type: 'CAREER_OUTLOOK', titleZh: '职业方向', bodyZh: '公开就业信息', sortOrder: 30 },
          { type: 'INTRODUCTION', titleZh: '介绍', bodyZh: '重复介绍', sortOrder: 0 },
          { type: 'ADMISSIONS', titleZh: '录取要求', bodyZh: '隐藏录取内容', sortOrder: 10 },
        ],
      };
      Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }), setNavigationBarTitle() {},
        request(options: { success(response: unknown): void }) {
          options.success({ statusCode: 200, data: payload, header: {}, cookies: [] });
          return { abort() {} };
        },
      } });
      const context: ProgrammePageContext = {
        favoriteRevision: 0, data: { ...page.data, universitySlug, programmeId, imageFailed: true },
        setData(update) { Object.assign(this.data, update); },
      };
      await page.loadPage.call(context);
      assert.equal(context.data.state, 'ready');
      assert.ok(Array.isArray(context.data.documentSections), 'the programme page must expose ordered document sections');
      assert.ok(Array.isArray(context.data.basicFacts), 'the programme page must expose fact rows');
      assert.deepEqual(context.data.documentSections.map((section) => section.type), ['INTRODUCTION', 'BASIC_INFORMATION', 'ADMISSIONS', 'CAREER_OUTLOOK']);
      assert.equal(context.data.documentSections[0]?.body, '专业描述正文');
      assert.deepEqual(context.data.basicFacts, complete ? [
        { label: '学历', value: 'BACHELOR' }, { label: '学制', value: '3年' },
        { label: '模式／方式', value: scenario === 'pace' ? '全日制' : 'ON_CAMPUS' }, { label: '授课语言', value: 'EN · ZH' },
        { label: '开学日期', value: '9月 · 1月' }, { label: '学习地点', value: '吉隆坡' },
        { label: '学费', value: 'RM 90,000' },
      ] : [
        { label: '学历', value: '待确认' }, { label: '学制', value: '待确认' },
        { label: '模式／方式', value: '待确认' }, { label: '授课语言', value: '待确认' },
        { label: '开学日期', value: '请咨询院校' }, { label: '学费', value: '请咨询最新费用' },
      ]);
      assert.equal(context.data.imageFailed, false);
      assert.equal(context.data.logoLetter, complete ? 'A' : 'U');
      assert.equal(context.data.universityLogoUrl, complete ? 'https://yangdoujiao.com/universities/asia-pacific-university.png' : null);
      page.imageError.call(context);
      assert.equal(context.data.imageFailed, true);
    }
  } finally {
    if (original) Object.defineProperty(globalThis, 'wx', original);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

test('programme navigation clears capsule and keeps back and consultation actions reachable', async () => {
  const page = await loadProgrammePage();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  let backs = 0;
  const toasts: string[] = [];
  Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
    getWindowInfo: () => ({ statusBarHeight: 44, windowWidth: 320 }),
    getMenuButtonBoundingClientRect: () => ({ top: 52, left: 220, width: 88, height: 32 }),
    navigateBack() { backs++; }, showToast({ title }: { title: string }) { toasts.push(title); },
  } });
  try {
    const context: ProgrammePageContext = { favoriteRevision: 0, data: { ...page.data }, setData(update) { Object.assign(this.data, update); } };
    assert.equal(typeof page.setupNavigation, 'function', 'programme detail must measure safe custom navigation');
    page.setupNavigation.call(context);
    assert.equal(context.data.statusBarHeight, 44);
    assert.equal(context.data.navigationHeight, 48);
    assert.equal(context.data.navigationRight, 112);
    page.back.call(context);
    page.consult.call(context);
    assert.equal(backs, 1);
    assert.deepEqual(toasts, ['顾问咨询正在接入']);
    Object.defineProperty(globalThis, 'wx', { configurable: true, value: {} });
    const legacy: ProgrammePageContext = { ...context, data: { ...page.data } };
    page.setupNavigation.call(legacy);
    assert.equal(legacy.data.statusBarHeight, 20);
    assert.equal(legacy.data.navigationHeight, 44);
    assert.equal(legacy.data.navigationRight, 96);
  } finally {
    if (original) Object.defineProperty(globalThis, 'wx', original);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

function card(university: Record<string, unknown>, imageFailed = false) {
  const events: Array<{ name: string; detail: { slug: unknown } }> = [];
  const context: CardContext = {
    data: { ...definition.data, university, imageFailed },
    setData(update) { Object.assign(this.data, update); },
    triggerEvent(name, detail) { events.push({ name, detail }); },
  };
  return { context, events };
}

test('university card initially allows its remote image to render', () => {
  assert.equal(definition.data?.imageFailed, false);
});

test('an image error switches the university card into fallback state', () => {
  const university = { slug: 'um', imageUrl: 'https://example.com/um.png' };
  const { context, events } = card(university);
  assert.ok(definition.methods.imageError, 'the card must handle image errors');

  definition.methods.imageError.call(context);
  definition.methods.imageError.call(context);

  assert.equal(context.data.imageFailed, true);
  assert.equal(context.data.university, university);
  assert.deepEqual(events, []);
});

test('same-image metadata updates preserve the university card fallback', () => {
  const { context, events } = card({ slug: 'um', imageUrl: 'https://example.com/um.png' });
  const observer = definition.properties.university.observer;
  assert.ok(observer);
  assert.ok(definition.methods.imageError);
  observer.call(context);
  definition.methods.imageError.call(context);

  const university = {
    slug: 'um', imageUrl: 'https://example.com/um.png', nameZh: 'Updated name', programmeCount: 8,
  };
  context.data.university = university;
  observer.call(context);

  assert.equal(context.data.imageFailed, true);
  assert.equal(context.data.university, university);
  assert.deepEqual(events, []);
});

for (const [previousUrl, imageUrl] of [
  ['https://example.com/um.png', 'https://example.com/upm.png'],
  ['https://example.com/um.png', null],
  [null, 'https://example.com/upm.png'],
] as const) {
  test(`changing an image from ${previousUrl} to ${imageUrl} resets its failure`, () => {
    const { context, events } = card({ slug: 'um', imageUrl: previousUrl });
    const observer = definition.properties.university.observer;
    assert.ok(observer);
    assert.ok(definition.methods.imageError);
    observer.call(context);
    definition.methods.imageError.call(context);

    const university = { slug: 'upm', imageUrl };
    context.data.university = university;
    observer.call(context);

    assert.equal(context.data.imageFailed, false);
    assert.equal(context.data.university, university);
    assert.deepEqual(events, []);
  });
}

test('selection emits only the validated slug in either image state', () => {
  for (const imageFailed of [false, true]) {
    for (const { university, slug } of [
      { university: { slug: 'um', imageUrl: 'https://example.com/um.png' }, slug: 'um' },
      { university: { slug: 42 }, slug: undefined },
      { university: {}, slug: undefined },
    ]) {
      const { context, events } = card(university, imageFailed);

      definition.methods.select.call(context);

      assert.deepEqual(events, [{ name: 'select', detail: { slug } }]);
      assert.equal(context.data.imageFailed, imageFailed);
    }
  }
});

interface CommunityCardContext {
  data: { post: Record<string, unknown>; reacting: boolean; imageFailed: boolean; observedImageUrl: string | null; displayTime: string };
  setData(update: Partial<CommunityCardContext['data']>): void;
  triggerEvent(name: string, detail: unknown): void;
}

interface CommunityCardDefinition {
  properties: { post: { observer: (this: CommunityCardContext) => void } };
  data: { imageFailed: boolean; observedImageUrl: string | null; displayTime: string };
  methods: {
    imageError(this: CommunityCardContext): void;
    open(this: CommunityCardContext): void;
    react(this: CommunityCardContext): void;
    report(this: CommunityCardContext): void;
  };
}

let communityImport = 0;
async function loadCommunityCard(): Promise<CommunityCardDefinition> {
  let registered: CommunityCardDefinition | undefined;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Component');
  Object.defineProperty(globalThis, 'Component', { configurable: true, value(definition: CommunityCardDefinition) { registered = definition; } });
  try { await import(new URL(`../miniprogram/components/community-post-card/index.ts?contract=${++communityImport}`, import.meta.url).href); }
  finally {
    if (original) Object.defineProperty(globalThis, 'Component', original);
    else Reflect.deleteProperty(globalThis, 'Component');
  }
  assert.ok(registered);
  return registered;
}

test('community card has safe image fallback and emits only explicit actions', async () => {
  const communityCard = await loadCommunityCard();
  const events: Array<{ name: string; detail: unknown }> = [];
  const context: CommunityCardContext = {
    data: { post: { id: '9', publishedAt: '2026-10-08T08:00:00Z' }, reacting: false, ...communityCard.data },
    setData(update) { Object.assign(this.data, update); },
    triggerEvent(name, detail) { events.push({ name, detail }); },
  };
  communityCard.properties.post.observer.call(context);
  communityCard.methods.imageError.call(context);
  communityCard.methods.open.call(context);
  communityCard.methods.react.call(context);
  communityCard.methods.report.call(context);
  assert.equal(context.data.imageFailed, true);
  assert.match(context.data.displayTime, /^2026-10-08/);
  assert.deepEqual(events, [
    { name: 'open', detail: { id: '9' } },
    { name: 'react', detail: { post: context.data.post } },
    { name: 'report', detail: { id: '9' } },
  ]);
});

test('community card only clears a failed avatar when its URL changes', async () => {
  const communityCard = await loadCommunityCard();
  const context: CommunityCardContext = {
    data: { post: { id: '9', authorAvatarUrl: 'https://example.test/a.png', publishedAt: '2026-10-08T08:00:00Z' }, reacting: false, ...communityCard.data },
    setData(update) { Object.assign(this.data, update); }, triggerEvent() {},
  };
  communityCard.properties.post.observer.call(context);
  communityCard.methods.imageError.call(context);
  context.data.post = { ...context.data.post, likeCount: 4 };
  communityCard.properties.post.observer.call(context);
  assert.equal(context.data.imageFailed, true);
  context.data.post = { ...context.data.post, authorAvatarUrl: 'https://example.test/b.png' };
  communityCard.properties.post.observer.call(context);
  assert.equal(context.data.imageFailed, false);
});

interface ResultCardDefinition extends CardDefinition {
  methods: CardDefinition['methods'] & { toggleFavorite(this: CardContext): void };
}

test('directory photo card has native image loading, labelled independent actions and a branded fallback', async () => {
  const markup = await readFile(new URL('../miniprogram/components/university-result-card/index.wxml', import.meta.url), 'utf8');
  assert.match(markup, /mode="aspectFill"/);
  assert.match(markup, /lazy-load/);
  assert.match(markup, /fade-show/);
  assert.match(markup, /binderror="imageError"/);
  assert.match(markup, /catchtap="toggleFavorite"/);
  assert.match(markup, /aria-label="\{\{favorite \? '取消收藏' : '收藏院校'\}\}"/);
  assert.match(markup, /洋豆角/);
  assert.doesNotMatch(markup, /ranking|排名|QS/);
});

test('directory photo card preserves an image failure for metadata updates and emits select and favorite slugs', async () => {
  let resultCard: ResultCardDefinition | undefined;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Component');
  Object.defineProperty(globalThis, 'Component', { configurable: true, value(definition: ResultCardDefinition) { resultCard = definition; } });
  try { await import(new URL('../miniprogram/components/university-result-card/index.ts', import.meta.url).href); }
  finally {
    if (original) Object.defineProperty(globalThis, 'Component', original);
    else Reflect.deleteProperty(globalThis, 'Component');
  }
  assert.ok(resultCard);
  const events: Array<{ name: string; detail: { slug: unknown } }> = [];
  const context: CardContext = {
    data: { ...resultCard.data, imageFailed: false, university: { slug: 'segi-university', coverImageUrl: 'https://example.test/campus.jpg', imageUrl: 'https://example.test/logo.jpg' } },
    setData(update) { Object.assign(this.data, update); },
    triggerEvent(name, detail) { events.push({ name, detail }); },
  };
  const observer = resultCard.properties.university.observer;
  assert.ok(observer);
  observer.call(context);
  assert.equal(context.data.displayImageUrl, 'https://example.test/campus.jpg');
  resultCard.methods.imageError!.call(context);
  context.data.university = { ...context.data.university, nameEn: 'Updated university name' };
  observer.call(context);
  assert.equal(context.data.imageFailed, true);
  resultCard.methods.select.call(context);
  resultCard.methods.toggleFavorite.call(context);
  assert.deepEqual(events, [
    { name: 'select', detail: { slug: 'segi-university' } },
    { name: 'favorite', detail: { slug: 'segi-university' } },
  ]);
  context.data.university = { slug: 'segi-university', coverImageUrl: null, imageUrl: 'https://example.test/logo.jpg' };
  observer.call(context);
  assert.equal(context.data.displayImageUrl, 'https://example.test/logo.jpg');
  assert.equal(context.data.imageFailed, false);
  context.data.university = { slug: 'segi-university', coverImageUrl: null, imageUrl: null };
  observer.call(context);
  assert.equal(context.data.displayImageUrl, null);
});

test('directory uses inline option menus, an outside dismiss layer and matching photo skeletons', async () => {
  const markup = await readFile(new URL('../miniprogram/pages/universities/index.wxml', import.meta.url), 'utf8');
  const config = JSON.parse(await readFile(new URL('../miniprogram/pages/universities/index.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(markup, /<picker/);
  assert.match(markup, /(?:bind|catch)tap="openFilter"/);
  assert.match(markup, /^<view[^>]+bindtap="closeFilters"/, 'taps anywhere outside the menus must dismiss them');
  assert.match(markup, /bindtap="selectFilter"/);
  assert.match(markup, /catchtap="closeFilters"/);
  assert.match(markup, /filter-option--selected/);
  assert.match(markup, /✓/);
  assert.match(markup, /university-result-card/);
  assert.match(markup, /photo-skeleton/);
  assert.match(markup, /class="filter-clear"[^>]+disabled="\{\{state === 'loading' && !query && country === 'ALL' && level === 'ALL' && category === 'ALL'\}\}"/, 'reset is disabled during a neutral reload but remains usable for an active search');
  assert.equal(config.usingComponents['university-result-card'], '/components/university-result-card/index');
  assert.equal(config.usingComponents['university-card'], undefined);
});

test('university profile has safe custom navigation, independent media fallbacks and discovery actions', async () => {
  const base = '../miniprogram/pages/university-detail/';
  const markup = await readFile(new URL(base + 'index.wxml', import.meta.url), 'utf8');
  const styles = await readFile(new URL(base + 'index.wxss', import.meta.url), 'utf8');
  const config = JSON.parse(await readFile(new URL(base + 'index.json', import.meta.url), 'utf8'));
  assert.equal(config.navigationStyle, 'custom');
  assert.match(markup, /class="custom-header"/);
  assert.match(markup, /statusBarHeight/);
  assert.match(markup, /navigationRight/);
  assert.match(markup, /bindtap="back"[^>]+aria-label="返回"/);
  assert.match(styles, /\.custom-header[^}]+background:#f5d66f/);
  assert.match(markup, /binderror="imageError"/);
  assert.match(markup, /detail-cover--fallback/);
  assert.match(markup, /logoFailed/);
  assert.match(markup, /binderror="logoError"/);
  assert.match(markup, /data-section="introduction"[^>]+bindtap="selectSection"/);
  assert.match(markup, /data-section="programmes"[^>]+bindtap="selectSection"/);
  assert.match(markup, /院校简介/);
  assert.match(markup, /专业查询/);
  assert.match(markup, /正在审核整理中，可在专业查询中查看已发布专业/);
  assert.match(markup, /wx:if="\{\{programmeIntakeDisplays\[item.id\]\}\}"/);
  assert.match(markup, /入学时间：\{\{programmeIntakeDisplays\[item.id\]\}\}/);
  assert.match(markup, /wx:for="\{\{programmeCategories\}\}"/);
  assert.match(markup, /bindtap="selectCategory"/);
  assert.match(markup, /wx:for="\{\{visibleProgrammes\}\}"/);
  assert.match(markup, /bindtap="openProgramme"/);
  assert.match(markup, /bindtap="toggleFavorite"/);
  assert.match(markup, /bindtap="consult"/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /\.consult-button,\.save-button[^}]+box-sizing:border-box/, 'fixed action height must include padding within the reserved bottom space');
  assert.match(styles, /word-break:break-word/);
  assert.doesNotMatch(markup, /ranking|排名|QS|院校状态|countryCode/);
});

interface UniversityDetailPageContext {
  data: {
    activeSection: string; activeCategory: string;
    programmeCategories: Array<{ code: string; label: string }>;
    programmes: Array<Record<string, unknown>>; visibleProgrammes: Array<Record<string, unknown>>;
    imageFailed: boolean; logoFailed: boolean;
    [key: string]: unknown;
  };
  setData(update: Record<string, unknown>): void;
}

interface UniversityDetailPageDefinition {
  data: UniversityDetailPageContext['data'];
  loadPage(this: UniversityDetailPageContext): Promise<void>;
  setupNavigation(this: UniversityDetailPageContext): void;
  toggleFavorite(this: UniversityDetailPageContext): void;
  onShow(this: UniversityDetailPageContext): void;
  openProgramme(this: UniversityDetailPageContext, event: unknown): void;
  back(this: UniversityDetailPageContext): void;
  consult(this: UniversityDetailPageContext): void;
  selectSection(this: UniversityDetailPageContext, event: unknown): void;
  selectCategory(this: UniversityDetailPageContext, event: unknown): void;
  imageError(this: UniversityDetailPageContext): void;
  logoError(this: UniversityDetailPageContext): void;
}

let universityDetailPage: UniversityDetailPageDefinition | undefined;
async function loadUniversityDetailPage(): Promise<UniversityDetailPageDefinition> {
  if (universityDetailPage) return universityDetailPage;
  let registered: UniversityDetailPageDefinition | undefined;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Page');
  Object.defineProperty(globalThis, 'Page', { configurable: true, value(page: UniversityDetailPageDefinition) { registered = page; } });
  try { await import(new URL('../miniprogram/pages/university-detail/index.ts', import.meta.url).href); }
  finally {
    if (original) Object.defineProperty(globalThis, 'Page', original);
    else Reflect.deleteProperty(globalThis, 'Page');
  }
  assert.ok(registered);
  universityDetailPage = registered;
  return registered;
}

test('university profile defaults to introduction and filters locally without losing tab or category state', async () => {
  const page = await loadUniversityDetailPage();
  assert.equal(page.data.activeSection, 'introduction');
  assert.equal(page.data.activeCategory, 'ALL');
  const programmes = [{ id: 1, categoryCode: 'BUSINESS' }, { id: 2, categoryCode: 'UNLISTED' }];
  const context: UniversityDetailPageContext = {
    data: { ...page.data, programmes, visibleProgrammes: [...programmes], programmeCategories: [
      { code: 'ALL', label: '全部学院' }, { code: 'BUSINESS', label: '商科' }, { code: 'UNLISTED', label: 'UNLISTED' },
    ] },
    setData(update) { Object.assign(this.data, update); },
  };
  const event = (dataset: Record<string, unknown>) => ({ currentTarget: { dataset } });
  page.selectSection.call(context, event({ section: 'programmes' }));
  page.selectCategory.call(context, event({ code: 'UNLISTED' }));
  assert.equal(context.data.activeSection, 'programmes');
  assert.equal(context.data.activeCategory, 'UNLISTED');
  assert.deepEqual(context.data.visibleProgrammes.map((item) => item.id), [2]);
  page.selectSection.call(context, event({ section: 'introduction' }));
  page.selectSection.call(context, event({ section: 'programmes' }));
  assert.equal(context.data.activeCategory, 'UNLISTED');
  page.selectCategory.call(context, event({ code: 'INVALID' }));
  page.selectSection.call(context, event({ section: 'INVALID' }));
  assert.equal(context.data.activeCategory, 'UNLISTED');
  assert.equal(context.data.activeSection, 'programmes');
  page.selectCategory.call(context, event({ code: 'ALL' }));
  assert.deepEqual(context.data.visibleProgrammes.map((item) => item.id), [1, 2]);
  assert.deepEqual(context.data.programmes, programmes);
  page.imageError.call(context);
  assert.equal(context.data.imageFailed, true);
  assert.equal(context.data.logoFailed, false);
  page.logoError.call(context);
  assert.equal(context.data.logoFailed, true);
});

test('university profile loads real catalogue labels and remains ready when catalogue fails', async () => {
  const page = await loadUniversityDetailPage();
  const { resetFilterOptionsCache } = await import('../miniprogram/services/catalogue.ts');
  const original = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  try {
    for (const catalogueAvailable of [true, false]) {
      resetFilterOptionsCache();
      const slug = catalogueAvailable ? 'contract-labels' : 'contract-fallback';
      const paths: string[] = [];
      Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
        setNavigationBarTitle() {},
        request(options: { url: string; success(response: unknown): void; fail(response: unknown): void }) {
          const path = new URL(options.url).pathname;
          paths.push(path);
          if (path.endsWith('/filter-options') && !catalogueAvailable) {
            options.fail({ errMsg: 'offline' });
          } else {
            const data = path.endsWith('/filter-options') ? {
              countries: [], subjectCategories: [{ code: 'COMPUTING', nameZh: '计算机科学', nameEn: 'Computing' }],
              studyLevels: [], courseModes: [], languages: [],
            } : path.endsWith('/programmes') ? {
              items: [{ id: 1, slug: 'computer-science', nameZh: '计算机科学学士', nameEn: 'Bachelor of Computer Science', categoryCode: 'COMPUTING' }],
              page: 1, pageSize: 50, totalItems: 1, totalPages: 1,
            } : { id: 1, slug, nameZh: '测试大学', nameEn: 'Test University', cityZh: '吉隆坡', countryNameZh: '马来西亚', descriptionZh: '第一段\n\n第二段' };
            options.success({ statusCode: 200, data, header: {}, cookies: [] });
          }
          return { abort() {} };
        },
      } });
      const context: UniversityDetailPageContext = {
        data: { ...page.data, slug },
        setData(update) { Object.assign(this.data, update); },
      };
      await page.loadPage.call(context);
      assert.equal(context.data.state, 'ready');
      assert.deepEqual(context.data.programmeCategories, [
        { code: 'ALL', label: '全部学院' },
        { code: 'COMPUTING', label: catalogueAvailable ? '计算机科学' : 'COMPUTING' },
      ]);
      assert.deepEqual(context.data.visibleProgrammes.map((item) => item.id), [1]);
      assert.equal(context.data.location, '吉隆坡，马来西亚');
      assert.deepEqual(context.data.descriptionParagraphs, ['第一段', '第二段']);
      assert.ok(paths.includes('/api/v1/catalog/filter-options'));
    }
  } finally {
    resetFilterOptionsCache();
    if (original) Object.defineProperty(globalThis, 'wx', original);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

test('university profile clears the capsule and preserves favourites and validated programme routes', async () => {
  const page = await loadUniversityDetailPage();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  let saved: unknown = [];
  const navigations: string[] = [];
  const toasts: string[] = [];
  let backCalls = 0;
  Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
    getWindowInfo: () => ({ statusBarHeight: 44, windowWidth: 320 }),
    getMenuButtonBoundingClientRect: () => ({ top: 52, left: 220, width: 88, height: 32 }),
    getStorageSync: () => saved,
    setStorageSync: (_key: string, value: unknown) => { saved = value; },
    showToast: ({ title }: { title: string }) => { toasts.push(title); },
    navigateTo: ({ url }: { url: string }) => { navigations.push(url); },
    navigateBack: () => { backCalls++; },
  } });
  try {
    const context: UniversityDetailPageContext = {
      data: { ...page.data, slug: 'apu' },
      setData(update) { Object.assign(this.data, update); },
    };
    page.setupNavigation.call(context);
    assert.equal(context.data.statusBarHeight, 44);
    assert.equal(context.data.navigationHeight, 48);
    assert.equal(context.data.navigationRight, 112);
    page.toggleFavorite.call(context);
    assert.deepEqual(saved, ['apu']);
    assert.equal(context.data.favorite, true);
    saved = [];
    page.onShow.call(context);
    assert.equal(context.data.favorite, false);
    page.openProgramme.call(context, { currentTarget: { dataset: { id: 7 } } });
    page.openProgramme.call(context, { currentTarget: { dataset: { id: 'invalid' } } });
    assert.deepEqual(navigations, ['/pages/programme-detail/index?universitySlug=apu&programmeId=7']);
    page.back.call(context);
    assert.equal(backCalls, 1);
    page.consult.call(context);
    assert.deepEqual(toasts, ['已收藏', '专业资料暂时无法打开', '咨询功能正在接入']);
  } finally {
    if (original) Object.defineProperty(globalThis, 'wx', original);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

test('university profile fetches every programme page sequentially before exposing complete categories and counts', async () => {
  const page = await loadUniversityDetailPage();
  const { resetFilterOptionsCache } = await import('../miniprogram/services/catalogue.ts');
  const original = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  try {
    for (const outcome of ['complete', 'offline', 'incomplete'] as const) {
      resetFilterOptionsCache();
      const slug = `contract-pagination-${outcome}`;
      const requestedPages: number[] = [];
      let inFlight = 0;
      let maximumInFlight = 0;
      const readySnapshots: Array<{ count: unknown; rows: number }> = [];
      Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
        setNavigationBarTitle() {},
        request(options: { url: string; success(response: unknown): void; fail(response: unknown): void }) {
          const url = new URL(options.url);
          if (url.pathname.endsWith('/programmes')) {
            const pageNumber = Number(url.searchParams.get('page'));
            assert.equal(url.searchParams.get('size'), '50');
            requestedPages.push(pageNumber);
            inFlight++;
            maximumInFlight = Math.max(maximumInFlight, inFlight);
            queueMicrotask(() => {
              inFlight--;
              if (outcome === 'offline' && pageNumber === 2) {
                options.fail({ errMsg: 'offline' });
                return;
              }
              const length = pageNumber === 3 ? (outcome === 'incomplete' ? 0 : 1) : 50;
              const items = Array.from({ length }, (_, index) => {
                const id = (pageNumber - 1) * 50 + index + 1;
                return { id, slug: `programme-${id}`, nameZh: `专业 ${id}`, nameEn: `Programme ${id}`,
                  categoryCode: pageNumber === 1 ? 'BUSINESS' : 'NEW_CATEGORY', studyLevelCode: 'BACHELOR',
                  durationDisplay: '3年', tuitionDisplay: '', intakeDisplayTexts: id === 51 ? ['一月', '九月'] : [],
                };
              });
              options.success({ statusCode: 200, data: { items, page: pageNumber, pageSize: 50, totalItems: 101, totalPages: 3 }, header: {}, cookies: [] });
            });
          } else {
            const data = url.pathname.endsWith('/filter-options') ? {
              countries: [], subjectCategories: [{ code: 'BUSINESS', nameZh: '商科', nameEn: 'Business' }],
              studyLevels: [], courseModes: [], languages: [],
            } : { id: 1, slug, nameZh: '测试大学', nameEn: 'Test University', descriptionZh: '' };
            options.success({ statusCode: 200, data, header: {}, cookies: [] });
          }
          return { abort() {} };
        },
      } });
      const context: UniversityDetailPageContext = {
        data: { ...page.data, slug },
        setData(update) {
          Object.assign(this.data, update);
          if (update.state === 'ready') readySnapshots.push({ count: this.data.programmeCount, rows: this.data.visibleProgrammes.length });
        },
      };
      await page.loadPage.call(context);
      assert.deepEqual(requestedPages, outcome === 'offline' ? [1, 2] : [1, 2, 3]);
      assert.equal(maximumInFlight, 1);
      if (outcome !== 'complete') {
        assert.equal(context.data.state, outcome === 'offline' ? 'offline' : 'failed');
        assert.deepEqual(readySnapshots, []);
        assert.deepEqual(context.data.visibleProgrammes, []);
        assert.equal(context.data.programmeCount, 0);
        continue;
      }
      assert.equal(context.data.state, 'ready');
      assert.deepEqual(readySnapshots, [{ count: 101, rows: 101 }]);
      assert.equal(context.data.programmes.length, 101);
      assert.deepEqual(context.data.programmes.map((item) => item.id), Array.from({ length: 101 }, (_, index) => index + 1));
      assert.deepEqual(context.data.programmeCategories, [
        { code: 'ALL', label: '全部学院' }, { code: 'BUSINESS', label: '商科' }, { code: 'NEW_CATEGORY', label: 'NEW_CATEGORY' },
      ]);
      assert.equal((context.data.programmeIntakeDisplays as Record<number, string>)[51], '一月、九月');
      assert.equal((context.data.programmeIntakeDisplays as Record<number, string>)[1], '');
      page.selectCategory.call(context, { currentTarget: { dataset: { code: 'NEW_CATEGORY' } } });
      assert.equal(context.data.visibleProgrammes.length, 51);
      assert.equal(context.data.visibleProgrammes[0]?.id, 51);
      page.selectCategory.call(context, { currentTarget: { dataset: { code: 'ALL' } } });
      assert.equal(context.data.visibleProgrammes.length, 101);
    }
  } finally {
    resetFilterOptionsCache();
    if (original) Object.defineProperty(globalThis, 'wx', original);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

test('programme favourite preserves authentication, duplicate-save guard, add/remove and failed-write rollback', async () => {
  const page = await loadProgrammePage();
  const { sessionStore } = await import('../miniprogram/stores/session.ts');
  const { setAccessTokenReader } = await import('../miniprogram/services/http.ts');
  const { mapProgrammeDetail } = await import('../miniprogram/services/miniapp-data.ts');
  const mapped = mapProgrammeDetail({ id: 902, slug: 'favourite-contract', nameZh: '测试专业', nameEn: 'Test Programme', universitySlug: 'segi-university', universityNameZh: '世纪大学', sections: [] });
  assert.ok(mapped.ok);
  const originalWx = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  const originalAuth = sessionStore.ensureAuthenticated;
  const paths: Array<{ path: string; method: string }> = [];
  const toasts: string[] = [];
  let outcome: 'success' | 'offline' = 'success';
  Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
    showToast({ title }: { title: string }) { toasts.push(title); },
    request(options: { url: string; method: string; success(response: unknown): void; fail(response: unknown): void }) {
      paths.push({ path: new URL(options.url).pathname, method: options.method });
      if (outcome === 'offline') options.fail({ errMsg: 'offline' });
      else options.success({ statusCode: options.method === 'DELETE' ? 204 : 200,
        data: { id: 902, universitySlug: 'segi-university', name: '测试专业', universityName: '世纪大学' }, header: {}, cookies: [] });
      return { abort() {} };
    },
  } });
  try {
    setAccessTokenReader(() => 'contract-token');
    const context: ProgrammePageContext = { favoriteRevision: 0, data: { ...page.data, programme: mapped.value }, setData(update) { Object.assign(this.data, update); } };
    let finishAuth: ((value: Awaited<ReturnType<typeof originalAuth>>) => void) | undefined;
    sessionStore.ensureAuthenticated = () => new Promise((resolve) => { finishAuth = resolve; });
    const pending = page.toggleFavorite.call(context);
    assert.equal(context.data.saving, true);
    await page.toggleFavorite.call(context);
    assert.equal(context.favoriteRevision, 1);
    assert.deepEqual(paths, []);
    assert.ok(finishAuth);
    finishAuth({ ok: false, error: { kind: 'unauthorized', code: 'AUTHENTICATION_REQUIRED' } });
    await pending;
    assert.equal(context.data.saving, false);
    assert.equal(context.data.favorite, false);
    assert.deepEqual(toasts, ['请先完成微信登录']);
    sessionStore.ensureAuthenticated = async () => ({ ok: true, value: { id: 1, displayName: 'Student', avatarUrl: null, bindingStatus: 'LINKED' } });
    await page.toggleFavorite.call(context);
    assert.equal(context.data.favorite, true);
    assert.equal(context.data.saving, false);
    await page.toggleFavorite.call(context);
    assert.equal(context.data.favorite, false);
    outcome = 'offline';
    await page.toggleFavorite.call(context);
    assert.equal(context.data.favorite, false);
    assert.equal(context.data.saving, false);
    assert.deepEqual(paths, [
      { path: '/api/v1/miniapp/me/favorites/902', method: 'POST' },
      { path: '/api/v1/miniapp/me/favorites/902', method: 'DELETE' },
      { path: '/api/v1/miniapp/me/favorites/902', method: 'POST' },
    ]);
    assert.deepEqual(toasts, ['请先完成微信登录', '已收藏专业', '已取消收藏', '操作失败，请重试']);
  } finally {
    sessionStore.ensureAuthenticated = originalAuth;
    setAccessTokenReader(() => null);
    if (originalWx) Object.defineProperty(globalThis, 'wx', originalWx);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});
