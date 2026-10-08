import assert from "node:assert/strict";
import test from "node:test";
import { courseSuggestions, matchingSuggestions, universitySuggestions } from "./search-suggestions.ts";

test("course suggestions support Chinese and English in either locale", () => {
  for (const locale of ["en", "zh"] as const) {
    const suggestions = courseSuggestions(locale);
    assert.ok(suggestions.includes("Computer Science"));
    assert.ok(suggestions.includes("计算机科学"));
  }
});

test("university suggestions include reviewed names, aliases, and location terms", () => {
  const suggestions = universitySuggestions("en");
  assert.ok(suggestions.includes("University of Malaya"));
  assert.ok(suggestions.includes("UM"));
  assert.ok(suggestions.includes("Malaysia"));
  assert.equal(new Set(suggestions).size, suggestions.length);
});

test("keyword matching prioritizes prefix results and respects its limit", () => {
  assert.deepEqual(matchingSuggestions(["Bioengineering", "Engineering", "Chemical Engineering", "English"], "eng", 3), ["Engineering", "English", "Bioengineering"]);
});

test("latin suggestions tolerate a small spelling mistake", () => {
  assert.deepEqual(
    matchingSuggestions(["Computer Science", "Economics", "Education"], "computr"),
    ["Computer Science"],
  );
});

test("short and Chinese queries stay on precise substring matching", () => {
  assert.deepEqual(matchingSuggestions(["University of Malaya", "UM"], "um"), ["UM"]);
  assert.deepEqual(matchingSuggestions(["计算机科学", "数据科学"], "计算"), ["计算机科学"]);
  assert.deepEqual(matchingSuggestions(["计算机科学"], "计蒜"), []);
});
