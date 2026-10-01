import assert from "node:assert/strict";
import test from "node:test";
import { readSavedItems, SAVED_ITEMS_EVENT, toggleSavedItem, writeSavedItems, type SavedItem } from "./saved-items.ts";

function installBrowserStorage() {
  let value: string | null = null;
  const events: Event[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => value,
        setItem: (_key: string, next: string) => { value = next; },
      },
      dispatchEvent: (event: Event) => { events.push(event); return true; },
    },
  });
  return { events, setRaw: (next: string) => { value = next; } };
}

const university: SavedItem = {
  key: "university:university-of-malaya",
  kind: "university",
  name: "University of Malaya",
  path: "/en/universities/university-of-malaya",
};

test("saved items tolerate invalid browser storage", () => {
  const storage = installBrowserStorage();
  storage.setRaw("not-json");
  assert.deepEqual(readSavedItems(), []);
  storage.setRaw(JSON.stringify([{ kind: "university" }, university]));
  assert.deepEqual(readSavedItems(), [university]);
});

test("saved items deduplicate, toggle, and notify the interface", () => {
  const storage = installBrowserStorage();
  assert.deepEqual(writeSavedItems([university, university]), [university]);
  assert.equal(storage.events.at(-1)?.type, SAVED_ITEMS_EVENT);
  assert.deepEqual(toggleSavedItem(university), []);
  assert.deepEqual(toggleSavedItem(university), [university]);
});
