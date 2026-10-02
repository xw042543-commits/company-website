import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_PROGRAMMES } from "./local-programmes.generated.ts";
import { formatProgrammeDuration, localProgrammeMatches, localProgrammePage } from "./local-programmes.ts";

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
