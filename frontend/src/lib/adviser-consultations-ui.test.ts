import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("adviser navigation preserves consultations and exposes exactly one localized moderation item", async () => {
  const { adviserNavigation } = await import("./adviser-consultations-ui.ts");
  for (const locale of ["zh", "en"] as const) {
    const entries = adviserNavigation(locale);
    assert.deepEqual(entries, [
      { href: `/${locale}/adviser/consultations`, label: locale === "zh" ? "咨询管理" : "Consultations" },
      { href: `/${locale}/adviser/community`, label: locale === "zh" ? "U圈审核" : "Community moderation" },
    ]);
  }
});

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
    "Loading consultations", "No consultations", "Access denied",
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

test("contact actions only link validated email addresses and phone numbers", async () => {
  const { contactAction } = await import("./adviser-consultations-ui.ts");
  assert.deepEqual(contactAction(" student@example.com "),
    { kind: "email", href: "mailto:student@example.com" });
  assert.deepEqual(contactAction("+60 12-345 6789"),
    { kind: "phone", href: "tel:+60123456789" });
  for (const unsafe of ["wechat:student", "hello world", "javascript:alert(1)", "a@b"]) {
    assert.equal(contactAction(unsafe), null);
  }
});

test("focused portal paths include auth pages and locale adviser routes only", async () => {
  const { isFocusedPortalPath } = await import("./site.ts");
  for (const path of ["/zh/login", "/zh/register", "/zh/forgot-password", "/zh/adviser/consultations"]) {
    assert.equal(isFocusedPortalPath("zh", path), true, path);
  }
  for (const path of ["/zh", "/zh/account", "/en/adviser/consultations", "/zh/advisers"]) {
    assert.equal(isFocusedPortalPath("zh", path), false, path);
  }
});

test("collection state copy never presents paused intake as active", async () => {
  const { consultationCollectionState } = await import("./adviser-consultations-ui.ts");
  assert.deepEqual(consultationCollectionState("zh", true), {
    tone: "active",
    title: "咨询收集已启用",
    description: "网站访客可以提交新的咨询资料。",
  });
  assert.deepEqual(consultationCollectionState("en", false), {
    tone: "paused",
    title: "Consultation collection is paused",
    description: "New submissions are paused; existing records remain available.",
  });
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

test("conflict notice describes pending, refreshed, and failed reloads in both languages", async () => {
  const { consultationConflictMessage } = await import("./adviser-consultations-ui.ts");
  for (const locale of ["en", "zh"] as const) {
    const pending = consultationConflictMessage(locale, true, false);
    const refreshed = consultationConflictMessage(locale, false, false);
    const failed = consultationConflictMessage(locale, false, true);
    const retrying = consultationConflictMessage(locale, true, true);
    for (const message of [pending, refreshed, failed]) {
      assert.match(message, locale === "en" ? /Your change was not saved/ : /当前修改未保存/);
      assert.match(message, locale === "en" ? /updated by another adviser/ : /其他顾问已更新此记录/);
    }
    assert.match(pending, locale === "en" ? /Reloading the latest record/ : /正在重新载入最新记录/);
    assert.match(refreshed, locale === "en" ? /latest record is loaded.*Review it before updating again/ : /已载入最新记录.*核对后再次更新/);
    assert.doesNotMatch(refreshed, locale === "en" ? /Reloading/ : /正在重新载入/);
    assert.match(failed, locale === "en" ? /Could not reload.*Retry loading the details before updating/ : /未能载入最新记录.*重试载入详情后再更新/);
    assert.doesNotMatch(failed, locale === "en" ? /Reloading|latest record is loaded/ : /正在重新载入|已载入最新记录/);
    assert.equal(retrying, pending);
  }
});
