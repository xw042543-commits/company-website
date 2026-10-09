import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('campus failure preserves logo fallback and resets when campus changes', () => {
  interface Card {
    data: { university: object; coverFailed: boolean };
    properties: { university: { observer(): void } };
    methods: { coverError(): void };
    setData(value: object): void;
  }
  let card!: Card;
  const source = readFileSync(new URL('../miniprogram/components/university-card/index.ts', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {}).outputText, { Component: (value: Card) => { card = value; } });
  card.setData = (value) => Object.assign(card.data, value);
  card.data.university = { imageUrl: 'logo.png', coverImageUrl: 'campus.jpg' };
  card.properties.university.observer.call(card);
  assert.equal(card.data.coverFailed, false);
  card.methods.coverError.call(card);
  assert.equal(card.data.coverFailed, true);
  card.properties.university.observer.call(card);
  assert.equal(card.data.coverFailed, true);
  card.data.university = { imageUrl: 'logo.png', coverImageUrl: 'new-campus.jpg' };
  card.properties.university.observer.call(card);
  assert.equal(card.data.coverFailed, false);
});
