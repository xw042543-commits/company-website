import type { OfficialCourseModule } from "./university-api.ts";
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

test("uses verified Chinese translations with original English retained and hides sourced AI", () => {
  const section = { type: "CURRICULUM", titleZh: "课程", titleEn: "Modules", bodyZh: "错误中文",
    bodyEn: "Wrong legacy body", sortOrder: 40, sourceType: "official" as const,
    sourceUrl: "https://study.um.edu.my/programme", sourceCheckedAt: "2026-10-15T00:00:00Z",
    curriculumReviewStatus: "VERIFIED" as const, courseModules: [{ nameZh: "数据库系统", nameEn: "Database Systems",
      courseCode: null, credits: null, requirement: null, curriculumVersion: null,
      sourceUrl: "https://study.um.edu.my/programme", sourceCheckedAt: "2026-10-15T00:00:00Z" }] };
  assert.equal(findOfficialProgrammeSection([section], ["CURRICULUM"], "zh")?.body, "数据库系统");
  assert.equal(findOfficialProgrammeSection([{ ...section, bodyZh: null, bodyEn: null }], ["CURRICULUM"], "zh")?.body, "数据库系统");
  assert.equal(findOfficialProgrammeSection([{ ...section, sourceType: "ai_generated" }], ["CURRICULUM"], "zh"), null);
  assert.equal(findOfficialProgrammeSection([{ ...section, curriculumReviewStatus: "PENDING" }], ["CURRICULUM"], "zh"), null);
  assert.equal(findOfficialProgrammeSection([{ ...section, courseModules: [{...section.courseModules[0], nameEn: "Minimum CGPA 3.0"}] }], ["CURRICULUM"], "zh"), null);
});


test("every official course in the complete reviewed snapshot is renderable without legacy-body fallback", async () => {
  const {readFile}=await import("node:fs/promises");
  const audit=JSON.parse(await readFile(new URL("../../../outputs/official-course-modules-20261015/reviewed-audit.json",import.meta.url),"utf8")) as {records:{programmeCode:string;status:string;modules:OfficialCourseModule[]}[]};
  for(const row of audit.records){
    const section={type:"CURRICULUM",titleZh:"课程",titleEn:"Modules",bodyZh:null,bodyEn:null,sortOrder:40,
      sourceType:"official" as const,sourceUrl:null,sourceCheckedAt:null,
      curriculumReviewStatus:row.status === "VERIFIED" ? "VERIFIED" as const : "PENDING" as const,courseModules:row.modules};
    const view=findOfficialProgrammeSection([section],["CURRICULUM"],"zh");
    assert.equal(view?.courseModules?.length??0,row.modules.length,row.programmeCode);
    if(row.status==="VERIFIED")assert.ok(view?.body.includes(row.modules[0].nameZh),row.programmeCode);
  }
});
