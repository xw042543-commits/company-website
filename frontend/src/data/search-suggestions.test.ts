import assert from "node:assert/strict";
import test from "node:test";
import { courseSuggestions, matchingSuggestions, universitySuggestions } from "./search-suggestions.ts";

test("course suggestions are localized and useful", () => {
  assert.ok(courseSuggestions("en").includes("Computer Science"));
  assert.ok(courseSuggestions("zh").includes("计算机科学"));
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
