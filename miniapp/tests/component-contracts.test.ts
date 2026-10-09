import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

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
  assert.equal(config.usingComponents['university-result-card'], '/components/university-result-card/index');
  assert.equal(config.usingComponents['university-card'], undefined);
});
