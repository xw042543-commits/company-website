import assert from 'node:assert/strict';
import test from 'node:test';

interface CardContext {
  data: { university: Record<string, unknown>; imageFailed: boolean };
  setData(update: { imageFailed: boolean }): void;
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
    data: { university, imageFailed },
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

test('changing university data resets a failed image so the new image can load', () => {
  const university = { slug: 'upm', imageUrl: 'https://example.com/upm.png' };
  const { context, events } = card(university, true);
  const observer = definition.properties.university.observer;
  assert.ok(observer, 'university updates must reset image failure');

  observer.call(context);

  assert.equal(context.data.imageFailed, false);
  assert.equal(context.data.university, university);
  assert.deepEqual(events, []);
});

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
