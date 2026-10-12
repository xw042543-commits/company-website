import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { moderationWaitingHint } from "../lib/adviser-community-ui.ts";

const panel = readFileSync(new URL("./adviser-community-panel.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("pending queue records render server SLA hints as visible and accessible text", () => {
  assert.match(panel, /const waitingHint = moderationWaitingHint\(locale, item\)/);
  assert.match(panel, /waitingHint && <span className="community-sla" role="note" data-sla-state=\{item.slaState\} aria-label=\{waitingHint.ariaLabel\}>\{waitingHint.text\}<\/span>/);
  for (const [slaState, text] of [
    ["ON_TIME", "等待审核 · 未满 12 小时"],
    ["WARNING", "等待审核 · 已满 12 小时"],
    ["OVERDUE", "审核超时 · 已满 24 小时"],
  ] as const) {
    assert.deepEqual(moderationWaitingHint("zh", { status: "PENDING_REVIEW", targetType: "POST", slaState }),
      { text, ariaLabel: `帖子：${text}` });
    assert.equal(moderationWaitingHint("en", { status: "PUBLISHED", targetType: "POST", slaState }), null);
  }
});

test("queue order copy reflects the applied pending versus processed or hidden filter", () => {
  assert.match(panel, /filters.status === "PENDING"\s*\? w\("最久待审优先 · 马来西亚时间", "Longest waiting first · Malaysia time"\)\s*: w\("最新内容优先 · 马来西亚时间", "Newest first · Malaysia time"\)/);
});

test("detail SLA uses only a fresh matching queue version and honestly handles unavailable state", () => {
  assert.match(panel, /!queuePending && !detailPending && !saving && !needsReload && detail/);
  for (const condition of ["item.targetType === detail.targetType", "item.targetId === detail.targetId",
    "item.version === detail.version", "item.status === detail.status"]) assert.ok(panel.includes(condition));
  assert.match(panel, /detail.status === "PENDING_REVIEW" && <div><dt>\{w\("等待状态", "Waiting status"\)\}<\/dt>/);
  assert.match(panel, /aria-live="polite" aria-atomic="true">\{detailWaitingHint/);
  assert.match(panel, /role="note" data-sla-state=\{selectedQueueItem\?\.slaState\} aria-label=\{detailWaitingHint.ariaLabel\}>\{detailWaitingHint.text\}/);
  assert.ok(panel.includes("等待状态暂不可用，请刷新队列。"));
  assert.ok(panel.includes("Waiting status unavailable. Refresh the queue."));
  assert.doesNotMatch(panel, /Date\.now\(|12\s*\*\s*60|24\s*\*\s*60/);
});

test("SLA warning and overdue styles reuse readable brand colors and wrap long hints", () => {
  assert.match(css, /\.community-sla\s*\{[^}]*color:\s*var\(--brand-deep\)[^}]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.community-sla\[data-sla-state="WARNING"\]\s*\{[^}]*color:\s*var\(--warning\)[^}]*background:\s*var\(--support-cream\)/);
  assert.match(css, /\.community-sla\[data-sla-state="OVERDUE"\]\s*\{[^}]*color:\s*var\(--danger\)[^}]*background:\s*var\(--support-cream\)/);
  assert.match(css, /\.adviser-portal :focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus\)/);
});

test("SLA additions retain the workspace focus, live announcements and busy protection", () => {
  assert.match(panel, /if \(selected\) heading.current\?\.focus\(\)/);
  assert.match(panel, /\(currentOpener \?\? queueHeading.current\)\?\.focus\(\)/);
  assert.match(panel, /ref=\{heading\} tabIndex=\{-1\}/);
  assert.match(panel, /className="adviser-record community-record" disabled=\{busy\}/);
  assert.match(panel, /aria-controls="community-detail"/);
  assert.match(panel, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(panel, /aria-busy=\{queuePending\}/);
  assert.match(panel, /aria-busy=\{detailPending \|\| saving\}/);
  assert.match(panel, /fieldset disabled=\{busy \|\| needsReload\}/);
});

test("conflicts still invalidate decisions, reload selected detail and refresh the queue", () => {
  assert.match(panel, /if \(recovery.refreshDetail\)\s*\{\s*setNeedsReload\(true\); setReasonCode\(""\); setConfirmed\(false\)/);
  assert.match(panel, /await loadDetail\(target\)/);
  assert.match(panel, /result.status === "ready" \|\| result.status === "conflict"/);
  assert.match(panel, /setRevision\(\(value\) => value \+ 1\)/);
});
