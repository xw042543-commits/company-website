import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { ModerationDetail } from "./adviser-community-api.ts";

const historyHead: ModerationDetail = {
  targetType: "POST", targetId: "42", status: "HIDDEN", body: "Version 2 content", postId: null, parentCommentId: null,
  version: 2, openReportCount: 0, reports: [], actionsNextCursor: "older-actions",
  actions: [{ id: "2", command: "HIDE", reasonCode: "SPAM", previousStatus: "PUBLISHED", nextStatus: "HIDDEN", createdAt: "2026-10-09T00:00:00Z" }],
};
const changedHistoryPage: ModerationDetail = {
  ...historyHead, version: 3, status: "PUBLISHED", body: "Version 3 content", actionsNextCursor: null,
  actions: [{ id: "1", command: "HIDE", reasonCode: "SPAM", previousStatus: "PUBLISHED", nextStatus: "HIDDEN", createdAt: "2026-10-08T00:00:00Z" }],
};
const refreshedHistoryHead: ModerationDetail = {
  ...changedHistoryPage, actionsNextCursor: "older-actions",
  actions: [{ id: "3", command: "RESTORE", reasonCode: "APPEAL_ACCEPTED", previousStatus: "HIDDEN", nextStatus: "PUBLISHED", createdAt: "2026-10-09T01:00:00Z" }, ...historyHead.actions],
};

test("history version change discards the cursor page and displays freshly loaded head decisions", async () => {
  const { resolveModerationHistoryPage } = await import("./adviser-community-ui.ts");
  let reloads = 0;
  const result = await resolveModerationHistoryPage(historyHead, changedHistoryPage, async () => {
    reloads += 1;
    return { status: "ready", value: refreshedHistoryHead };
  });
  assert.equal(reloads, 1);
  assert.deepEqual(result, { status: "ready", value: refreshedHistoryHead });
  if (result.status === "ready") assert.deepEqual(result.value.actions.map((action) => action.id), ["3", "2"]);
});

test("history head reload failure never publishes a partial cursor page and can retry safely", async () => {
  const { resolveModerationHistoryPage, canSubmitModeration } = await import("./adviser-community-ui.ts");
  const failed = await resolveModerationHistoryPage(historyHead, changedHistoryPage, async () => ({ status: "unavailable" }));
  assert.deepEqual(failed, { status: "unavailable" });
  assert.equal(canSubmitModeration({ command: "RESTORE", reasonCode: "APPEAL_ACCEPTED", version: historyHead.version, needsReload: failed.status !== "ready" }), false);
  const retried = await resolveModerationHistoryPage(historyHead, changedHistoryPage, async () => ({ status: "ready", value: refreshedHistoryHead }));
  assert.deepEqual(retried, { status: "ready", value: refreshedHistoryHead });
});

test("same-version history continuation merges older decisions without a head reload", async () => {
  const { resolveModerationHistoryPage } = await import("./adviser-community-ui.ts");
  const page = { ...changedHistoryPage, version: 2, actions: [historyHead.actions[0], ...changedHistoryPage.actions] };
  const result = await resolveModerationHistoryPage(historyHead, page, async () => { assert.fail("unchanged version must not reload the head"); });
  assert.equal(result.status, "ready");
  if (result.status === "ready") assert.deepEqual(result.value.actions.map((action) => action.id), ["2", "1"]);
});

test("requires an allowlisted reason and current safe version before submitting", async () => {
  const { canSubmitModeration } = await import("./adviser-community-ui.ts");
  assert.equal(canSubmitModeration({ command: "HIDE", reasonCode: "", version: 2 }), false);
  assert.equal(canSubmitModeration({ command: "HIDE", reasonCode: "SPAM", version: 2, confirmed: true }), true);
  for (const version of [-1, NaN, 1.5, Number.MAX_SAFE_INTEGER]) {
    assert.equal(canSubmitModeration({ command: "HIDE", reasonCode: "SPAM", version, confirmed: true }), false);
  }
  assert.equal(canSubmitModeration({ command: "RESTORE", reasonCode: "SPAM", version: 2 }), false);
  assert.equal(canSubmitModeration({ command: "RESTORE", reasonCode: "APPEAL_ACCEPTED", version: 2 }), true);
  assert.equal(canSubmitModeration({ command: "REJECT_REPORT", reasonCode: "REPORT_UNFOUNDED", version: 0 }), true);
});

test("hide and ban require explicit confirmation and in-flight or stale detail cannot submit", async () => {
  const { canSubmitModeration } = await import("./adviser-community-ui.ts");
  for (const command of ["HIDE", "BAN"] as const) {
    assert.equal(canSubmitModeration({ command, reasonCode: "SPAM", version: 2 }), false);
    assert.equal(canSubmitModeration({ command, reasonCode: "SPAM", version: 2, confirmed: true, busy: true }), false);
    assert.equal(canSubmitModeration({ command, reasonCode: "SPAM", version: 2, confirmed: true, needsReload: true }), false);
  }
});

test("optional mute expiry defaults to 24 hours and accepts only future times within 30 days", async () => {
  const { muteExpiry, canSubmitModeration } = await import("./adviser-community-ui.ts");
  const now = Date.parse("2026-10-09T00:00:00Z");
  assert.equal(muteExpiry("", now), "2026-10-10T00:00:00.000Z");
  for (const expiry of ["bad", "2026-10-08T00:00:00Z", "2026-10-09T00:00:00Z", "2026-11-09T00:00:00Z"]) {
    assert.equal(muteExpiry(expiry, now), null);
    assert.equal(canSubmitModeration({ command: "MUTE", reasonCode: "SPAM", version: 2, expiry, now }), false);
  }
  assert.equal(muteExpiry("2026-10-10T02:00:00Z", now), "2026-10-10T02:00:00.000Z");
  assert.equal(canSubmitModeration({ command: "MUTE", reasonCode: "SPAM", version: 2, now }), true);
});

test("conflict refresh preserves selected target and invalidates its current version", async () => {
  const { afterModerationFailure } = await import("./adviser-community-ui.ts");
  const state = { selectedId: "42", selectedType: "POST" as const, refreshDetail: false };
  assert.deepEqual(afterModerationFailure(state, { status: "conflict" }), {
    ...state, refreshDetail: true, needsReload: true,
  });
  assert.deepEqual(afterModerationFailure(state, { status: "unavailable" }), { ...state, refreshDetail: false });
});

test("queue filters emit only allowlisted fields and reject reversed time bounds", async () => {
  const { moderationQueueFilters } = await import("./adviser-community-ui.ts");
  assert.deepEqual(moderationQueueFilters({ status: "PENDING", targetType: "", reasonCode: "", from: "", to: "" }), { status: "PENDING", size: 20 });
  assert.equal(moderationQueueFilters({ status: "PENDING", targetType: "POST", reasonCode: "SPAM", from: "2026-10-10T00:00:00Z", to: "2026-10-09T00:00:00Z" }), null);
});

test("failure copy is fixed and excludes arbitrary server content", async () => {
  const { moderationErrorText } = await import("./adviser-community-ui.ts");
  assert.match(moderationErrorText("en", "unauthorized"), /sign in/);
  assert.match(moderationErrorText("en", "forbidden"), /Access denied/);
  assert.equal(moderationErrorText("en", "<private report note>"), moderationErrorText("en", "error"));
});

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("community entry validates locale, prevents indexing and inherits adviser console", () => {
  const page = source("../app/[locale]/adviser/community/page.tsx");
  assert.match(page, /isLocale\(locale\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.match(page, /adviser-console/);
  assert.match(page, /AdviserCommunityPanel/);
  assert.match(page, /adviserNavigation/);
  assert.doesNotMatch(page, /["']use client["']/);
});

test("workspace keeps selection local, uses strict client and never logs report contents", () => {
  const panel = source("../components/adviser-community-panel.tsx");
  assert.match(panel, /useState<.*SelectedTarget/);
  for (const method of ["loadCommunityModerationQueue", "loadCommunityModerationDetail", "submitCommunityModerationAction", "afterModerationFailure", "canSubmitModeration", "createLatestRequest", "abortableRequest"]) assert.ok(panel.includes(method));
  assert.doesNotMatch(panel, /useSearchParams|history\.|router\.push|console\.|localStorage|sessionStorage|dangerouslySetInnerHTML/);
  assert.match(panel, /returnTo:\s*`\/\$\{locale\}\/adviser\/community`/);
  assert.match(panel, /aria-live="polite"/);
  assert.match(panel, /another adviser/);
});

test("workspace exposes labeled filters, report aggregate, action history and guarded controls", () => {
  const panel = source("../components/adviser-community-panel.tsx");
  for (const id of ["community-target-type", "community-report-reason", "community-from", "community-to", "community-command", "community-decision-reason", "community-expiry", "community-confirm"]) assert.ok(panel.includes(`htmlFor="${id}"`));
  for (const phrase of ["待审核", "已处理", "已隐藏", "Report summary", "Action history", "Loading queue", "No items", "Close details", "actionsNextCursor", "openReportCount", "role=\"alert\"", "fieldset disabled={busy}"]) assert.ok(panel.includes(phrase), `missing ${phrase}`);
  assert.match(panel, /type="checkbox"/);
  assert.match(panel, /aria-labelledby="community-detail-title"/);
});

test("community stylesheet includes responsive sizing and reduced-motion rules", () => {
  const css = source("../app/globals.css");
  assert.match(css, /\.community-filters/);
  assert.match(css, /\.community-workspace[\s\S]*min-width:\s*0/);
  assert.match(css, /\.community-workspace[\s\S]*min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*community/);
});
