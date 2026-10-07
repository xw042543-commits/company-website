import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => {
  const url = new URL(path, import.meta.url);
  assert.ok(existsSync(url), `${path} must exist`);
  return readFileSync(url, "utf8");
};

test("localized adviser and forbidden pages validate locale and prevent indexing", () => {
  for (const path of ["../app/[locale]/adviser/consultations/page.tsx", "../app/[locale]/forbidden/page.tsx"]) {
    const page = source(path);
    assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
    assert.match(page, /isLocale\(locale\)/);
    assert.match(page, /notFound\(\)/);
    assert.doesNotMatch(page, /["']use client["']/);
  }
  assert.match(source("../app/[locale]/adviser/consultations/page.tsx"), /AdviserConsultationsPanel/);
  const forbidden = source("../app/[locale]/forbidden/page.tsx");
  assert.match(forbidden, /Access denied/);
  assert.match(forbidden, /无权访问/);
  assert.match(forbidden, /\/account/);
  assert.match(forbidden, /href=\{`\/\$\{locale\}`\}/);
});

test("dashboard includes bilingual labels, immutable details and accessible controls", () => {
  const panel = source("../components/adviser-consultations-panel.tsx");
  for (const phrase of ["待处理", "跟进中", "已完成", "New", "In progress", "Completed",
    "Submission time", "Name", "Contact", "University", "Course", "Qualification", "Status",
    "Loading consultations", "No consultations", "Access denied", "updated by another adviser",
    "privacyNoticeVersion", "statusUpdatedByUserId", "statusUpdatedAt", "referenceCode", "notes"]) {
    assert.ok(panel.includes(phrase), `missing ${phrase}`);
  }
  assert.match(panel, /label htmlFor="adviser-search"/);
  assert.match(panel, /label htmlFor="adviser-status"/);
  assert.match(panel, /aria-labelledby="consultation-detail-title"/);
  assert.match(panel, /role="alert"/);
  assert.match(panel, /aria-live="polite"/);
  assert.match(panel, /Close details/);
  assert.match(panel, /loadAdviserConsultations/);
  assert.match(panel, /loadAdviserConsultation/);
  assert.match(panel, /updateAdviserConsultationStatus/);
  assert.match(panel, /result\.status === "ready"/);
  assert.match(panel, /result\.status === "conflict"/);
  assert.match(panel, /router\.replace/);
  assert.match(panel, /300/);
  assert.match(panel, /AbortController|latestRequest/);
  assert.doesNotMatch(panel, /deleteAccount|\bexport(?:Csv|CSV|Data)\b|>\s*(?:Delete|Export|删除|导出)\s*</);
});

test("browser filters stay one-based and reset pagination after a filter change", async () => {
  const { readConsultationFilters, consultationQuery } = await import("./adviser-consultations-ui.ts");
  assert.deepEqual(readConsultationFilters(new URLSearchParams("query=Alice&status=NEW&page=3")),
    { query: "Alice", status: "NEW", page: 3 });
  assert.deepEqual(readConsultationFilters(new URLSearchParams("page=-1&status=INVALID")),
    { query: "", status: "", page: 1 });
  assert.equal(consultationQuery({ query: "Alice", status: "NEW", page: 3 }, { query: "Bob" }), "query=Bob&status=NEW&page=1");
  assert.equal(consultationQuery({ query: "Alice", status: "NEW", page: 3 }, { status: "COMPLETED" }), "query=Alice&status=COMPLETED&page=1");
  assert.equal(consultationQuery({ query: "A&B", status: "", page: 1 }, { page: 2 }), "query=A%26B&page=2");
});

test("superseded requests abort transport and cannot publish late results", async () => {
  const { createLatestRequest, abortableRequest } = await import("./adviser-consultations-ui.ts");
  const latest = createLatestRequest();
  const first = latest.start();
  const second = latest.start();
  assert.equal(first.signal.aborted, true);
  assert.equal(first.isCurrent(), false);
  assert.equal(second.isCurrent(), true);
  let receivedSignal: AbortSignal | null = null;
  const transport: typeof fetch = async (_url, options) => { receivedSignal = options?.signal as AbortSignal; return new Response("{}"); };
  await abortableRequest(second.signal, transport)("https://example.test/api", { signal: AbortSignal.timeout(5000) });
  latest.cancel();
  assert.equal(second.isCurrent(), false);
  assert.equal((receivedSignal as unknown as AbortSignal).aborted, true);
});
