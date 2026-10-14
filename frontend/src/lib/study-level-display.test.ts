import assert from "node:assert/strict";
import test from "node:test";

import { canonicalStudyLevelCode, studyLevelDisplayName, uniqueStudyLevelDisplayNames } from "./study-level-display.ts";

test("uses the five canonical Chinese study-level names", () => {
  assert.equal(studyLevelDisplayName("zh", { code: "FOUNDATION", nameEn: "Foundation" }), "预科");
  assert.equal(studyLevelDisplayName("zh", { code: "DIPLOMA", nameZh: "大专/文凭", nameEn: "Diploma" }), "大专");
  assert.equal(studyLevelDisplayName("zh", { code: "BACHELOR", nameEn: "Bachelor's Degree" }), "本科");
  assert.equal(studyLevelDisplayName("zh", { code: "MASTER", nameEn: "Master's Degree" }), "硕士");
  assert.equal(studyLevelDisplayName("zh", { code: "DOCTORATE", nameEn: "Doctorate" }), "博士");
});

test("normalizes doctoral English aliases without changing their stored value", () => {
  for (const nameEn of ["PhD", "Ph.D.", "Doctor", "Doctorate", "Doctoral Degree", "Doctor of Philosophy"]) {
    assert.equal(studyLevelDisplayName("zh", { code: nameEn, nameEn }), "博士");
  }
});

test("maps before removing duplicate display names", () => {
  assert.deepEqual(uniqueStudyLevelDisplayNames("zh", [
    { code: "DIPLOMA", nameZh: "文凭" },
    { code: "diploma", nameZh: "大专" },
    { code: "DOCTOR", nameEn: "Doctor" },
    { code: "PHD", nameEn: "PhD" },
  ]), ["大专", "博士"]);
  assert.equal(canonicalStudyLevelCode({ code: "Doctoral Degree" }), "doctorate");
});

test("keeps unknown levels and English labels available as fallbacks", () => {
  assert.equal(studyLevelDisplayName("zh", { code: "FOUNDATION", nameZh: "预科", nameEn: "Foundation" }), "预科");
  assert.equal(studyLevelDisplayName("en", { code: "PHD", nameEn: "PhD" }), "PhD");
});
