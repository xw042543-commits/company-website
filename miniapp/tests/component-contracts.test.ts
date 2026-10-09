import assert from 'node:assert/strict';
import test from 'node:test';

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
  data: { post: Record<string, unknown>; reacting: boolean; imageFailed: boolean; displayTime: string };
  setData(update: Partial<CommunityCardContext['data']>): void;
  triggerEvent(name: string, detail: unknown): void;
}

interface CommunityCardDefinition {
  properties: { post: { observer: (this: CommunityCardContext) => void } };
  data: { imageFailed: boolean; displayTime: string };
  methods: {
    imageError(this: CommunityCardContext): void;
    open(this: CommunityCardContext): void;
    react(this: CommunityCardContext): void;
    report(this: CommunityCardContext): void;
  };
}

async function loadCommunityCard(): Promise<CommunityCardDefinition> {
  let registered: CommunityCardDefinition | undefined;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Component');
  Object.defineProperty(globalThis, 'Component', { configurable: true, value(definition: CommunityCardDefinition) { registered = definition; } });
  try { await import(new URL('../miniprogram/components/community-post-card/index.ts?contract', import.meta.url).href); }
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
