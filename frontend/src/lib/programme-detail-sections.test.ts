import assert from "node:assert/strict";
import test from "node:test";

import { findProgrammeSection } from "./programme-detail-sections.ts";

test("finds the earliest matching published section and localizes its content", () => {
  const sections = [
    { type: "COURSE_STRUCTURE", titleZh: null, titleEn: "Curriculum", bodyZh: null, bodyEn: "Later", sortOrder: 20 },
    { type: "CURRICULUM", titleZh: "课程", titleEn: "Curriculum", bodyZh: "核心模块", bodyEn: "Core modules", sortOrder: 10 },
  ];
  assert.deepEqual(findProgrammeSection(sections, ["CURRICULUM", "COURSE_STRUCTURE"], "zh"), {
    title: "课程",
    body: "核心模块",
  });
  assert.deepEqual(findProgrammeSection(sections, ["CURRICULUM"], "en"), {
    title: "Curriculum",
    body: "Core modules",
  });
});

test("skips blank matching sections and returns null when content is unavailable", () => {
  const sections = [
    { type: "CAREER_OPPORTUNITIES", titleZh: "前景", titleEn: null, bodyZh: " ", bodyEn: null, sortOrder: 0 },
  ];
  assert.equal(findProgrammeSection(sections, ["CAREER_OPPORTUNITIES"], "zh"), null);
});
