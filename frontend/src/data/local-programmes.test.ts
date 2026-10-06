import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_PROGRAMMES } from "./local-programmes.generated.ts";
import { cleanProgrammeName, findLocalProgrammeBySlug, formatAcademicRequirement, formatFeeDisplay, formatIntakeDisplay, formatProgrammeDuration, localProgrammeMatches, localProgrammePage, splitProgrammeName } from "./local-programmes.ts";

test("generated programme records exclude worksheet headers and shifted columns", () => {
  assert.equal(LOCAL_PROGRAMMES.some((record) => /^(programmes?|courses?)$/i.test(record.nameEn.trim())), false);
  assert.equal(LOCAL_PROGRAMMES.some((record) => !record.mode && /^(coursework|research)$/i.test(record.intakes)), false);
  assert.equal(LOCAL_PROGRAMMES.some((record) => record.registrationFee === "RM 2.75"), false);
  assert.equal(LOCAL_PROGRAMMES.some((record) => record.intakes.includes("FEB (2")), false);
});

test("programme levels follow academic award names", () => {
  assert.equal(LOCAL_PROGRAMMES.some((record) => record.level === "bachelor" && /^Master\b/i.test(record.nameEn)), false);
  assert.equal(LOCAL_PROGRAMMES.some((record) => record.level !== "doctorate" && /^(?:Ph\.?D\.?|Doctor of Philosophy|Doctor Of Engineering)\b/i.test(record.nameEn)), false);
});

test("duration formatting preserves explicit source units", () => {
  assert.equal(formatProgrammeDuration("3"), "3 semesters");
  assert.equal(formatProgrammeDuration("8 +1"), "8 +1 semesters");
  assert.equal(formatProgrammeDuration("3年"), "3年");
  assert.equal(formatProgrammeDuration("2Y - 5 Y"), "2Y - 5 Y");
  assert.equal(formatProgrammeDuration("2-6S"), "2-6S");
  assert.equal(formatProgrammeDuration("6 Semesters"), "6 Semesters");
});

test("fee formatting adds thousands separators without changing smaller values", () => {
  assert.equal(formatFeeDisplay("RM 57400"), "RM 57,400");
  assert.equal(formatFeeDisplay("RM 2520"), "RM 2,520");
  assert.equal(formatFeeDisplay("RM 950"), "RM 950");
  assert.equal(formatFeeDisplay("RM 125000.50 total"), "RM 125,000.5 total");
});

test("programme name formatting removes stray source markers", () => {
  assert.equal(cleanProgrammeName("Bachelor of Agricultural Science #"), "Bachelor of Agricultural Science");
  assert.equal(cleanProgrammeName("农业科学荣誉学士学位#"), "农业科学荣誉学士学位");
});

test("programme presentation separates specialisations and normalizes intake months", () => {
  assert.deepEqual(splitProgrammeName("Bachelor of Business Specialisations: Finance\\Marketing"), {
    name: "Bachelor of Business",
    specialisations: ["Finance", "Marketing"],
  });
  assert.equal(formatIntakeDisplay("MARCH, September", "en"), "March, September");
  assert.equal(formatIntakeDisplay("MARCH, September", "zh"), "3月、9月");
  assert.equal(formatIntakeDisplay("2,5,9", "en"), "February, May, September");
  assert.equal(formatIntakeDisplay("2,5,9", "zh"), "2月、5月、9月");
  assert.equal(formatIntakeDisplay("9月入学", "en"), "September");
  assert.equal(formatIntakeDisplay("2月、4月、9月", "en"), "February, April, September");
});

test("academic requirements localize Gaokao and normalize separators", () => {
  const source = "National Higher School Certificate (grade 65% )//gaokao 520/ CGPA of 3.00";
  assert.equal(formatAcademicRequirement(source, "zh"), "National Higher School Certificate (grade 65%) / 高考 520 / CGPA of 3.00");
  assert.equal(formatAcademicRequirement(source, "en"), "National Higher School Certificate (grade 65%) / Gaokao 520 / CGPA of 3.00");
});

test("programme matches change with keyword and qualification filters", () => {
  const computing = localProgrammeMatches({ q: "computer", level: "bachelor" }, "en");
  const masters = localProgrammeMatches({ q: "computer", level: "master" }, "en");

  assert.equal(computing.hasProgrammeFilter, true);
  assert.ok(computing.matches.size > 0);
  assert.ok([...computing.matches.values()].flatMap((item) => item.courses).every((course) => course.level === "BACHELOR"));
  assert.ok([...masters.matches.values()].flatMap((item) => item.courses).every((course) => course.level === "MASTER"));
  assert.notDeepEqual(
    [...computing.matches.values()].flatMap((item) => item.courses).map((course) => course.id),
    [...masters.matches.values()].flatMap((item) => item.courses).map((course) => course.id),
  );
});

test("university programme pages search names and faculties", () => {
  const all = localProgrammePage("university-of-malaya", {});
  const computing = localProgrammePage("university-of-malaya", { q: "computer" });

  assert.ok(computing.totalItems > 0);
  assert.ok(computing.totalItems < all.totalItems);
  assert.ok(computing.items.every((programme) => /computer/i.test([
    programme.nameEn,
    programme.nameZh,
    programme.categoryDisplayEn,
    programme.categoryDisplayZh,
  ].filter(Boolean).join(" "))));
});

test("APU programmes remain available when the published API catalogue is empty", () => {
  const page = localProgrammePage("asia-pacific-university", {});
  assert.equal(page.totalItems, 57);
  assert.equal(page.items.length, 12);
  assert.ok(page.items.every((programme) => programme.slug.startsWith("apu-")));
});

test("programme URLs remain stable across filters and resolve to their source record", () => {
  const filtered = localProgrammePage("university-of-malaya", { q: "computer" });
  const programme = filtered.items[0];

  assert.ok(programme);
  assert.equal(findLocalProgrammeBySlug("university-of-malaya", programme.slug)?.nameEn, programme.nameEn);
  assert.equal(findLocalProgrammeBySlug("taylors-university", programme.slug), undefined);
});
