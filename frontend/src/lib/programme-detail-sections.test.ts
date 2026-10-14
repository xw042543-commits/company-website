import assert from "node:assert/strict";
import test from "node:test";

import { findOfficialProgrammeSection, findProgrammeSection, parseOfficialCurriculumItems } from "./programme-detail-sections.ts";

test("finds the earliest matching published section and localizes its content", () => {
  const sections = [
    { type: "COURSE_STRUCTURE", titleZh: null, titleEn: "Curriculum", bodyZh: null, bodyEn: "Later", sortOrder: 20, sourceUrl: null, sourceCheckedAt: null },
    { type: "CURRICULUM", titleZh: "课程", titleEn: "Curriculum", bodyZh: "核心模块", bodyEn: "Core modules", sortOrder: 10, sourceUrl: "https://example.edu/programme", sourceCheckedAt: "2026-10-14T00:00:00Z" },
  ];
  assert.deepEqual(findProgrammeSection(sections, ["CURRICULUM", "COURSE_STRUCTURE"], "zh"), {
    title: "课程",
    body: "核心模块",
    sourceUrl: "https://example.edu/programme",
    sourceCheckedAt: "2026-10-14T00:00:00Z",
    sourceType: null,
  });
  assert.deepEqual(findProgrammeSection(sections, ["CURRICULUM"], "en"), {
    title: "Curriculum",
    body: "Core modules",
    sourceUrl: "https://example.edu/programme",
    sourceCheckedAt: "2026-10-14T00:00:00Z",
    sourceType: null,
  });
});

test("skips blank matching sections and returns null when content is unavailable", () => {
  const sections = [
    { type: "CAREER_OPPORTUNITIES", titleZh: "前景", titleEn: null, bodyZh: " ", bodyEn: null, sortOrder: 0, sourceUrl: null, sourceCheckedAt: null },
  ];
  assert.equal(findProgrammeSection(sections, ["CAREER_OPPORTUNITIES"], "zh"), null);
});

test("only returns curriculum with an official source and parses official module lines", () => {
  const unverified = [{ type: "CURRICULUM", titleZh: "课程", titleEn: null, bodyZh: "模拟课程", bodyEn: null, sortOrder: 1, sourceUrl: null, sourceCheckedAt: null }];
  assert.equal(findOfficialProgrammeSection(unverified, ["CURRICULUM"], "zh"), null);
  assert.deepEqual(parseOfficialCurriculumItems("Year 1 Year 2 Fundamentals of Programming\nDatabase\nDatabase\nNote:"), [
    "Fundamentals of Programming", "Database",
  ]);
  assert.deepEqual(parseOfficialCurriculumItems("Programming\nMinimum average of 65%\nCore Elective (Choose 1)\n1. Elective Course 1\nSoftware Requirements Engineering"), [
    "Programming", "Software Requirements Engineering",
  ]);
});
