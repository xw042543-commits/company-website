"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadCommunityModerationQueue, loadCommunityModerationDetail, submitCommunityModerationAction,
  type ModerationCommand, type ModerationDetail, type ModerationQueue, type ModerationQueueFilters,
  type ModerationResult, type ModerationTargetType,
} from "@/lib/adviser-community-api";
import type { AdviserFailure } from "@/lib/adviser-consultation-api";
import { abortableRequest, createLatestRequest } from "@/lib/adviser-consultations-ui";
import {
  afterModerationFailure, canSubmitModeration, moderationErrorText, moderationQueueFilters,
  muteExpiry, reasonsForCommand, reportReasons, resolveModerationHistoryPage, moderationCommandLabel, moderationReasonLabel, type QueueFilterDraft,
} from "@/lib/adviser-community-ui";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

type SelectedTarget = { targetType: ModerationTargetType; targetId: string };
const initialFilters: QueueFilterDraft = { status: "PENDING", targetType: "", reasonCode: "", from: "", to: "" };
const commands: ModerationCommand[] = ["HIDE", "RESTORE", "REJECT_REPORT", "MUTE", "BAN"];

export function AdviserCommunityPanel({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState<ModerationQueueFilters>({ status: "PENDING", size: 20 });
  const [previousCursors, setPreviousCursors] = useState<(string | undefined)[]>([]);
  const [queue, setQueue] = useState<ModerationResult<ModerationQueue> | null>(null);
  const [queuePending, setQueuePending] = useState(true);
  const [filterFailure, setFilterFailure] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<SelectedTarget | null>(null);
  const [detail, setDetail] = useState<ModerationDetail | null>(null);
  const [detailPending, setDetailPending] = useState(false);
  const [detailFailure, setDetailFailure] = useState<AdviserFailure | null>(null);
  const [needsReload, setNeedsReload] = useState(true);
  const [saving, setSaving] = useState(false);
  const [command, setCommand] = useState<ModerationCommand>("HIDE");
  const [reasonCode, setReasonCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const queueRequests = useRef(createLatestRequest());
  const detailRequests = useRef(createLatestRequest());
  const heading = useRef<HTMLHeadingElement>(null);
  const queueRecords = useRef<HTMLOListElement>(null);
  const queueHeading = useRef<HTMLHeadingElement>(null);
  const submissionLock = useRef(false);
  const busy = queuePending || detailPending || saving;
  const data = queue?.status === "ready" ? queue.value : null;
  const w = (zh: string, en: string) => words(locale, zh, en);
  const reasonLabel = (reason: string) => moderationReasonLabel(locale, reason);
  const commandLabel = (value: string) => moderationCommandLabel(locale, value);
  const statusLabel = (value: string) => ({ PENDING_REVIEW: w("待审核", "Pending review"), PUBLISHED: w("已发布", "Published"),
    HIDDEN: w("已隐藏", "Hidden"), DELETED: w("已删除", "Deleted"), REJECTED: w("已拒绝", "Rejected") })[value] ?? w("未知状态", "Unknown status");
  const reportStatus = (value: string) => value === "OPEN" ? w("待处理", "Open")
    : value === "RESOLVED_ACTIONED" ? w("已处理", "Actioned") : w("已驳回", "Rejected");
  const typeLabel = (value: ModerationTargetType) => value === "POST" ? w("帖子", "Post") : w("评论", "Comment");
  const date = (value: string) => new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB",
    { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(value));

  const handleAccessFailure = useCallback((failure: AdviserFailure) => {
    if (failure.status !== "unauthorized" && failure.status !== "forbidden") return false;
    queueRequests.current.cancel(); detailRequests.current.cancel();
    setQueue(null); setDetail(null); setSelected(null); setDetailFailure(failure); setAnnouncement("");
    setQueuePending(false); setDetailPending(false); setSaving(false); submissionLock.current = false;
    router.replace(failure.status === "forbidden" ? `/${locale}/forbidden`
      : `/${locale}/login?${new URLSearchParams({ returnTo: `/${locale}/adviser/community` })}`);
    return true;
  }, [locale, router]);

  useEffect(() => {
    const requests = queueRequests.current;
    const request = requests.start();
    void (async () => {
      await Promise.resolve();
      if (!request.isCurrent()) return;
      setQueuePending(true);
      const result = await loadCommunityModerationQueue(browserApiBaseUrl(), filters, abortableRequest(request.signal));
      if (!request.isCurrent()) return;
      if (result.status !== "ready" && handleAccessFailure(result)) return;
      setQueue(result); setQueuePending(false);
    })();
    return () => requests.cancel();
  }, [filters, revision, handleAccessFailure]);

  useEffect(() => {
    const requests = detailRequests.current;
    return () => requests.cancel();
  }, []);
  useEffect(() => { if (selected) heading.current?.focus(); }, [selected]);

  async function loadDetail(target: SelectedTarget, actionsCursor?: string) {
    const request = detailRequests.current.start();
    setDetailPending(true); setDetailFailure(null); setNeedsReload(true); setConfirmed(false);
    let result = await loadCommunityModerationDetail(browserApiBaseUrl(), target.targetType, target.targetId,
      actionsCursor ? { actionsCursor } : {}, abortableRequest(request.signal));
    if (!request.isCurrent()) return;
    if (result.status === "ready" && actionsCursor && detail) {
      result = await resolveModerationHistoryPage(detail, result.value, () => {
        setReasonCode(""); setExpiry("");
        setAnnouncement(w("其他顾问已处理此内容，正在重新载入最新详情和处理记录。请核对后再操作。",
          "This content was handled by another adviser. Reloading the latest details and action history; review them before acting again."));
        return loadCommunityModerationDetail(browserApiBaseUrl(), target.targetType, target.targetId, {}, abortableRequest(request.signal));
      });
      if (!request.isCurrent()) return;
    }
    setDetailPending(false);
    if (result.status === "ready") {
      setDetail(result.value);
      setNeedsReload(false);
    } else if (!handleAccessFailure(result)) setDetailFailure(result);
  }

  function applyFilters(next: QueueFilterDraft) {
    const parsed = moderationQueueFilters(next);
    if (!parsed) { setFilterFailure(true); return; }
    setFilterFailure(false); setDraft(next); setPreviousCursors([]); setQueue(null); setQueuePending(true); setFilters(parsed);
  }

  async function submitAction() {
    if (!detail || !selected || submissionLock.current || !canSubmitModeration({ command, reasonCode,
      version: detail.version, confirmed, busy, needsReload, expiry })) return;
    const target = selected;
    const restrictionEndsAt = command === "MUTE" ? muteExpiry(expiry) : null;
    if (command === "MUTE" && restrictionEndsAt === null) { setDetailFailure({ status: "validation-error" }); return; }
    submissionLock.current = true;
    const request = detailRequests.current.start();
    setSaving(true); setDetailFailure(null); setAnnouncement("");
    const result = await submitCommunityModerationAction(browserApiBaseUrl(), target.targetType, target.targetId,
      { command, reasonCode, version: detail.version, restrictionEndsAt }, abortableRequest(request.signal));
    if (!request.isCurrent()) return;
    if (result.status === "ready") {
      setDetail(result.value); setReasonCode(""); setConfirmed(false); setExpiry("");
      setAnnouncement(w("处理决定已保存。", "Decision saved."));
    } else if (handleAccessFailure(result)) return;
    else {
      const recovery = afterModerationFailure({ selectedId: target.targetId, refreshDetail: false }, result);
      if (recovery.refreshDetail) {
        setNeedsReload(true); setReasonCode(""); setConfirmed(false);
        setAnnouncement(w("其他顾问已处理此内容，当前操作未保存。正在重新载入详情，请核对后再操作。",
          "This content was handled by another adviser. Your action was not saved. Reloading details; review them before acting again."));
        await loadDetail(target);
      } else setDetailFailure(result);
    }
    setSaving(false); submissionLock.current = false;
    // Reload the first queue page after any decision; keep the selected detail in component state.
    if (result.status === "ready" || result.status === "conflict") {
      setPreviousCursors([]); setFilters((value) => ({ ...value, cursor: undefined })); setRevision((value) => value + 1);
    }
  }

  return <div className="adviser-panel community-workspace">
    <div className="community-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    {detailFailure && !selected && <p className="adviser-error" role="alert">{moderationErrorText(locale, detailFailure.status)}</p>}
    <form onSubmit={(event) => { event.preventDefault(); applyFilters(draft); }}>
      <fieldset disabled={busy} className="community-filter-set">
        <legend>{w("审核队列筛选", "Filter moderation queue")}</legend>
        <div className="community-status-filters" role="group" aria-label={w("队列状态", "Queue status")}>
          {(["PENDING", "PROCESSED", "HIDDEN"] as const).map((value) => <button key={value} type="button" className="secondary" aria-pressed={filters.status === value}
            onClick={() => applyFilters({ ...draft, status: value })}>{value === "PENDING" ? w("待审核", "Pending") : value === "PROCESSED" ? w("已处理", "Processed") : w("已隐藏", "Hidden")}</button>)}
        </div>
        <div className="adviser-filters community-filters">
          <div><label htmlFor="community-target-type">{w("内容类型", "Target type")}</label><select id="community-target-type" value={draft.targetType} onChange={(event) => setDraft({ ...draft, targetType: event.target.value })}>
            <option value="">{w("全部类型", "All types")}</option><option value="POST">{w("帖子", "Posts")}</option><option value="COMMENT">{w("评论", "Comments")}</option></select></div>
          <div><label htmlFor="community-report-reason">{w("举报原因", "Report reason")}</label><select id="community-report-reason" value={draft.reasonCode} onChange={(event) => setDraft({ ...draft, reasonCode: event.target.value })}>
            <option value="">{w("全部原因", "All reasons")}</option>{reportReasons.map((reason) => <option key={reason} value={reason}>{reasonLabel(reason)}</option>)}</select></div>
          <div><label htmlFor="community-from">{w("开始时间", "From")}</label><input id="community-from" type="datetime-local" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} /></div>
          <div><label htmlFor="community-to">{w("结束时间", "Until")}</label><input id="community-to" type="datetime-local" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} /></div>
          <p className="community-filter-hint">{w("筛选时间使用您设备的时区；记录时间显示为马来西亚时间。", "Filter dates use your device timezone; records display Malaysia time.")}</p>
          <button type="submit">{w("应用筛选", "Apply filters")}</button>
          <button type="button" className="secondary" onClick={() => applyFilters(initialFilters)}>{w("重置筛选", "Reset filters")}</button>
        </div>
      </fieldset>
    </form>
    {filterFailure && <p className="adviser-error" role="alert">{moderationErrorText(locale, "validation-error")}</p>}
    <div className="adviser-master-detail community-master-detail">
      <section className="adviser-record-list" aria-label={w("审核队列", "Moderation queue")} aria-busy={queuePending}>
        <div className="adviser-list-heading"><div><h2 ref={queueHeading} tabIndex={-1}>{w("内容队列", "Content queue")}</h2><p>{w("最新内容优先 · 马来西亚时间", "Newest first · Malaysia time")}</p></div>
          <button type="button" className="secondary" disabled={busy} onClick={() => setRevision((value) => value + 1)}>{w("刷新", "Refresh")}</button></div>
        {queuePending && <p className="adviser-message" role="status">{w("正在载入队列…", "Loading queue…")}</p>}
        {!queuePending && queue && queue.status !== "ready" && <div className="adviser-message adviser-error" role="alert"><p>{moderationErrorText(locale, queue.status)}</p><button type="button" className="secondary" disabled={busy} onClick={() => setRevision((value) => value + 1)}>{w("重试", "Retry")}</button></div>}
        {!queuePending && data?.items.length === 0 && <p className="adviser-message" role="status">{w("没有符合筛选条件的内容。", "No items match these filters.")}</p>}
        {!queuePending && data && <ol ref={queueRecords} className="adviser-records">{data.items.map((item) => <li key={`${item.targetType}:${item.targetId}`}>
          <button type="button" className="adviser-record community-record" disabled={busy} data-selected={selected?.targetType === item.targetType && selected.targetId === item.targetId}
            aria-expanded={selected?.targetType === item.targetType && selected.targetId === item.targetId} aria-controls="community-detail" onClick={() => {
              setSelected({ targetType: item.targetType, targetId: item.targetId }); setDetail(null); setReasonCode(""); setConfirmed(false); setExpiry(""); setAnnouncement("");
              void loadDetail(item);
            }}>
            <span className="adviser-record-primary"><strong>{typeLabel(item.targetType)} · {statusLabel(item.status)}</strong><span className="community-preview">{item.bodyPreview.trim() || w("打开查看完整内容", "Open to review full content")}</span></span>
            <span className="adviser-record-meta"><span>{w(`待处理举报 ${item.openReportCount} 条`, `${item.openReportCount} open reports`)}</span><time dateTime={item.createdAt}>{date(item.createdAt)}</time></span>
          </button></li>)}</ol>}
        {data && <nav className="adviser-pagination" aria-label={w("队列分页", "Queue pagination")}>
          <button type="button" className="secondary" disabled={busy || previousCursors.length === 0} onClick={() => {
            const cursor = previousCursors.at(-1); setPreviousCursors((values) => values.slice(0, -1)); setQueue(null); setQueuePending(true); setFilters({ ...filters, cursor });
          }}>{w("上一页", "Previous")}</button><p>{w(`第 ${previousCursors.length + 1} 页`, `Page ${previousCursors.length + 1}`)}</p>
          <button type="button" className="secondary" disabled={busy || !data.nextCursor} onClick={() => {
            setPreviousCursors((values) => [...values, filters.cursor]); setQueue(null); setQueuePending(true); setFilters({ ...filters, cursor: data.nextCursor ?? undefined });
          }}>{w("下一页", "Next")}</button></nav>}
      </section>
      <aside id="community-detail" className="adviser-detail" aria-labelledby="community-detail-title" aria-busy={detailPending || saving}>
        {!selected && <div className="adviser-detail-empty"><h2 id="community-detail-title">{w("选择一条内容", "Select content to review")}</h2><p>{w("核对完整内容、举报汇总和处理记录。", "Review the content, report summary and action history here.")}</p></div>}
        {selected && <>
          <div className="adviser-detail-heading"><h2 id="community-detail-title" ref={heading} tabIndex={-1}>{w("内容详情", "Content details")}</h2>
            <button type="button" className="secondary" disabled={busy} onClick={() => {
              const currentOpener = queueRecords.current?.querySelector<HTMLButtonElement>('[data-selected="true"]');
              detailRequests.current.cancel(); setSelected(null); setDetail(null); setDetailFailure(null); setAnnouncement("");
              (currentOpener ?? queueHeading.current)?.focus();
            }}>{w("关闭详情", "Close details")}</button></div>
          {detailPending && <p role="status">{w("正在载入详情…", "Loading details…")}</p>}
          {detailFailure && <div className="adviser-error" role="alert"><p>{moderationErrorText(locale, detailFailure.status)}</p><button type="button" className="secondary" disabled={busy} onClick={() => void loadDetail(selected)}>{w("重新载入详情", "Reload details")}</button></div>}
          {detail && <>
            <dl className="adviser-detail-fields"><div><dt>{w("内容状态", "Content status")}</dt><dd>{typeLabel(detail.targetType)} · {statusLabel(detail.status)}</dd></div>
              <div><dt>{w("当前版本", "Current version")}</dt><dd>{detail.version}</dd></div>
              {detail.postId && <div><dt>{w("所属帖子编号", "Parent post ID")}</dt><dd>{detail.postId}</dd></div>}
              {detail.parentCommentId && <div><dt>{w("回复评论编号", "Parent comment ID")}</dt><dd>{detail.parentCommentId}</dd></div>}</dl>
            <section className="community-detail-section" aria-label={w("完整内容", "Full content")}><h3>{w("完整内容", "Full content")}</h3><p className="community-body">{detail.body}</p></section>
            <section className="community-detail-section" aria-labelledby="community-reports-title"><h3 id="community-reports-title">{w("举报汇总", "Report summary")}</h3>
              <p>{w(`待处理举报 ${detail.openReportCount} 条`, `${detail.openReportCount} open reports`)}</p>
              {detail.reports.length === 0 ? <p>{w("暂无举报。", "No reports.")}</p> : <ul className="community-report-list">{detail.reports.map((report) => <li key={`${report.reasonCode}:${report.status}`}><span>{reasonLabel(report.reasonCode)} · {reportStatus(report.status)}</span><strong>{w(`${report.count} 条`, `${report.count} reports`)}</strong></li>)}</ul>}
            </section>
            <form className="community-action-form" onSubmit={(event) => { event.preventDefault(); void submitAction(); }}>
              <fieldset disabled={busy || needsReload}><legend>{w("处理决定", "Moderation decision")}</legend>
                <div><label htmlFor="community-command">{w("处理操作", "Action")}</label><select id="community-command" value={command} onChange={(event) => { setCommand(event.target.value as ModerationCommand); setReasonCode(""); setConfirmed(false); setExpiry(""); }}>{commands.map((value) => <option key={value} value={value}>{commandLabel(value)}</option>)}</select></div>
                <div><label htmlFor="community-decision-reason">{w("处理原因（必选）", "Decision reason (required)")}</label><select id="community-decision-reason" required value={reasonCode} onChange={(event) => { setReasonCode(event.target.value); setConfirmed(false); }}><option value="">{w("请选择处理原因", "Choose a decision reason")}</option>{reasonsForCommand(command).map((reason) => <option key={reason} value={reason}>{reasonLabel(reason)}</option>)}</select></div>
                {command === "MUTE" && <div><label htmlFor="community-expiry">{w("禁言到期时间（可选）", "Mute expiry (optional)")}</label><input id="community-expiry" type="datetime-local" value={expiry} aria-describedby="community-expiry-hint" onChange={(event) => setExpiry(event.target.value)} /><small id="community-expiry-hint">{w("留空则禁言 24 小时。自定义时间使用设备时区，须在未来 30 天内。", "Leave blank for a 24-hour mute. A custom time uses your device timezone and must be within the next 30 days.")}</small></div>}
                {command === "MUTE" && muteExpiry(expiry) === null && <p className="adviser-error" role="alert">{moderationErrorText(locale, "validation-error")}</p>}
                {(command === "HIDE" || command === "BAN") && <div className="community-confirmation"><input id="community-confirm" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><label htmlFor="community-confirm">{command === "HIDE" ? w("确认隐藏此内容，使其不再公开显示。", "Confirm hiding this content from public view.") : w("确认封禁作者，限制其社区发布权限。", "Confirm banning the author from posting in the community.")}</label></div>}
                <button type="submit" disabled={!canSubmitModeration({ command, reasonCode, version: detail.version, confirmed, busy, needsReload, expiry })}>{saving ? w("正在保存…", "Saving…") : commandLabel(command)}</button>
              </fieldset>
            </form>
            <section className="community-detail-section" aria-labelledby="community-history-title"><h3 id="community-history-title">{w("处理记录", "Action history")}</h3>
              {detail.actions.length === 0 ? <p>{w("暂无处理记录。", "No actions yet.")}</p> : <ol className="community-history">{detail.actions.map((action) => <li key={action.id}><strong>{commandLabel(action.command)}</strong><span>{reasonLabel(action.reasonCode)}</span>{action.previousStatus && action.nextStatus && <span>{statusLabel(action.previousStatus)} → {statusLabel(action.nextStatus)}</span>}<time dateTime={action.createdAt}>{date(action.createdAt)}</time></li>)}</ol>}
              {detail.actionsNextCursor && <button type="button" className="secondary" disabled={busy || needsReload} onClick={() => void loadDetail(selected, detail.actionsNextCursor ?? undefined)}>{w("载入更早记录", "Load earlier actions")}</button>}
            </section>
          </>}
        </>}
      </aside>
    </div>
  </div>;
}
