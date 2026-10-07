"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadAdviserConsultations, loadAdviserConsultation, updateAdviserConsultationStatus,
  type AdviserConsultationDetail, type AdviserListResult, type AdviserFailure, type ConsultationStatus,
} from "@/lib/adviser-consultation-api";
import { abortableRequest, consultationCollectionState, consultationConflictMessage, consultationQuery, contactAction, createLatestRequest, readConsultationFilters } from "@/lib/adviser-consultations-ui";
import { getSession } from "@/lib/auth-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

const statuses: ConsultationStatus[] = ["NEW", "IN_PROGRESS", "COMPLETED"];

export function AdviserConsultationsPanel({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.toString();
  const filters = readConsultationFilters(new URLSearchParams(url));
  const { query, status, page } = filters;
  const [draft, setDraft] = useState({ url, query });
  const search = draft.url === url ? draft.query : query;
  const [list, setList] = useState<{ key: string; result: AdviserListResult } | null>(null);
  const [listPending, setListPending] = useState(true);
  const [revision, setRevision] = useState(0);
  const [identity, setIdentity] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdviserConsultationDetail | null>(null);
  const [detailPending, setDetailPending] = useState(false);
  const [detailFailure, setDetailFailure] = useState<AdviserFailure | null>(null);
  const [nextStatus, setNextStatus] = useState<ConsultationStatus>("NEW");
  const [saving, setSaving] = useState(false);
  const [stale, setStale] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [saved, setSaved] = useState(false);
  const listRequests = useRef(createLatestRequest());
  const detailRequests = useRef(createLatestRequest());
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const listKey = JSON.stringify([query, status, page]);
  const currentList = list?.key === listKey ? list.result : null;
  const data = currentList?.status === "ready" ? currentList.page : null;
  const pending = listPending || !currentList;
  const statusLabel = (value: ConsultationStatus) => value === "NEW" ? words(locale, "待处理", "New")
    : value === "IN_PROGRESS" ? words(locale, "跟进中", "In progress") : words(locale, "已完成", "Completed");
  const missing = words(locale, "未填写", "Not provided");
  const date = (value: string) => new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB",
    { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(value));
  const qualification = (value: string | null) => value === "foundation" ? words(locale, "预科", "Foundation")
    : value === "bachelor" ? words(locale, "本科", "Bachelor") : value === "master" ? words(locale, "硕士", "Master")
      : value === "doctorate" ? words(locale, "博士", "Doctorate") : missing;
  const errorText = (value: AdviserFailure["status"]) => {
    if (value === "forbidden") return words(locale, "无权访问此咨询。", "Access denied for this consultation.");
    if (value === "unauthorized") return words(locale, "登录已过期，请重新登录。", "Your session expired. Please sign in again.");
    if (value === "not-found") return words(locale, "未找到此咨询记录。", "This consultation could not be found.");
    if (value === "rate-limited") return words(locale, "请求过于频繁，请稍后重试。", "Too many requests. Please try again shortly.");
    if (value === "validation-error") return words(locale, "请求无效，请检查筛选条件或重新载入。", "Invalid request. Check your filters or reload.");
    return words(locale, "暂时无法载入或更新咨询，请重试。", "Unable to load or update consultations. Please retry.");
  };

  const handleAccessFailure = useCallback((failure: AdviserFailure) => {
    if (failure.status !== "unauthorized" && failure.status !== "forbidden") return false;
    listRequests.current.cancel();
    detailRequests.current.cancel();
    setList(null); setDetail(null); setSelected(null); setIdentity(null);
    // Only the fixed route is used as returnTo; search/contact text is never forwarded.
    router.replace(failure.status === "forbidden" ? `/${locale}/forbidden`
      : `/${locale}/login?${new URLSearchParams({ returnTo: `/${locale}/adviser/consultations` })}`);
    return true;
  }, [locale, router]);

  useEffect(() => {
    const requests = listRequests.current;
    const request = requests.start();
    void (async () => {
      await Promise.resolve();
      if (!request.isCurrent()) return;
      setListPending(true);
      const result = await loadAdviserConsultations(browserApiBaseUrl(), { query, status, page: page - 1, size: 20 }, abortableRequest(request.signal));
      if (!request.isCurrent()) return;
      if (result.status !== "ready" && handleAccessFailure(result)) return;
      setList({ key: listKey, result }); setListPending(false);
    })();
    return () => requests.cancel();
  }, [query, status, page, listKey, revision, handleAccessFailure]);

  useEffect(() => {
    const controller = new AbortController();
    void getSession(browserApiBaseUrl(), abortableRequest(controller.signal)).then((result) => {
      if (!controller.signal.aborted && result.status === "ready") setIdentity(result.session.fullName);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (search.trim() === query) return;
    const timer = window.setTimeout(() => {
      router.replace(`/${locale}/adviser/consultations?${consultationQuery({ query, status, page }, { query: search })}`, { scroll: false });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, query, status, page, locale, router]);

  useEffect(() => {
    const requests = detailRequests.current;
    return () => requests.cancel();
  }, []);

  useEffect(() => { if (selected) detailHeading.current?.focus(); }, [selected]);

  async function loadDetail(referenceCode: string, retain = false) {
    const request = detailRequests.current.start();
    setDetailPending(true); setDetailFailure(null); setNeedsReload(true);
    if (!retain) { setDetail(null); setStale(false); setSaved(false); }
    const result = await loadAdviserConsultation(browserApiBaseUrl(), referenceCode, abortableRequest(request.signal));
    if (!request.isCurrent()) return false;
    setDetailPending(false);
    if (result.status === "ready") {
      setDetail(result.consultation); setNextStatus(result.consultation.status); setNeedsReload(false);
    } else if (handleAccessFailure(result)) return false;
    else setDetailFailure(result);
    return true;
  }

  async function saveStatus() {
    if (!detail || saving || needsReload || nextStatus === detail.status) return;
    const request = detailRequests.current.start();
    setSaving(true); setSaved(false); setStale(false); setDetailFailure(null);
    const result = await updateAdviserConsultationStatus(browserApiBaseUrl(), detail.referenceCode, nextStatus, detail.version, abortableRequest(request.signal));
    if (!request.isCurrent()) return;
    if (result.status === "ready") {
      setDetail({ ...detail, ...result.update }); setSaved(true); setSaving(false);
      setRevision((value) => value + 1);
    } else if (result.status === "conflict") {
      setStale(true); setNeedsReload(true);
      const refreshed = await loadDetail(detail.referenceCode, true);
      if (!refreshed) return;
      setSaving(false);
      setRevision((value) => value + 1);
    } else {
      setSaving(false);
      if (!handleAccessFailure(result)) setDetailFailure(result);
    }
  }

  const columns = [words(locale, "提交时间", "Submission time"), words(locale, "姓名", "Name"), words(locale, "联系方式", "Contact"),
    words(locale, "意向大学", "University"), words(locale, "意向课程", "Course"), words(locale, "学历层次", "Qualification"), words(locale, "状态", "Status")];
  const collection = data ? consultationCollectionState(locale, data.submissionEnabled) : null;
  const action = detail ? contactAction(detail.contact) : null;
  const countFor = (value: ConsultationStatus | "") => !data ? "—" : value === "NEW" ? data.counts.newCount
    : value === "IN_PROGRESS" ? data.counts.inProgressCount : value === "COMPLETED" ? data.counts.completedCount
      : data.counts.newCount + data.counts.inProgressCount + data.counts.completedCount;
  const setStatusFilter = (value: ConsultationStatus | "") => {
    listRequests.current.cancel(); setListPending(true);
    router.replace(`/${locale}/adviser/consultations?${consultationQuery({ query, status, page }, { query: search, status: value })}`, { scroll: false });
  };

  return <div className="adviser-panel">
    <section className={`adviser-collection-state ${collection ? `is-${collection.tone}` : "is-loading"}`} role="status" aria-busy={!collection}>
      <div><span className="adviser-state-dot" aria-hidden="true" /><div>
        <strong>{collection?.title ?? words(locale, "正在确认咨询收集状态", "Checking collection status")}</strong>
        <span>{collection?.description ?? words(locale, "正在连接后台服务。", "Connecting to the service.")}</span>
      </div></div>
      <p>{words(locale, "当前账户", "Signed-in account")}<strong>{identity ?? words(locale, "正在载入…", "Loading…")}</strong></p>
    </section>
    <div className="adviser-counts" role="group" aria-label={words(locale, "按状态筛选", "Filter by status")} aria-busy={pending}>
      {(["", ...statuses] as const).map((value) => <button type="button" className="adviser-count-card" aria-pressed={status === value} key={value || "ALL"} disabled={pending} onClick={() => setStatusFilter(value)}>
        <span>{value ? statusLabel(value) : words(locale, "全部咨询", "All enquiries")}</span><strong>{countFor(value)}</strong>
      </button>)}
    </div>
    <div className="adviser-filters">
      <div><label htmlFor="adviser-search">{words(locale, "搜索咨询", "Search consultations")}</label>
        <input id="adviser-search" type="search" maxLength={100} value={search} aria-describedby="adviser-search-hint" onChange={(event) => {
          listRequests.current.cancel(); setListPending(true); setDraft({ url, query: event.target.value });
          // Clearing back to the current URL still needs to restart a cancelled request.
          if (event.target.value.trim() === query) setRevision((value) => value + 1);
        }} />
        <small id="adviser-search-hint">{words(locale, "姓名、联系方式或咨询编号", "Name, contact details or reference code")}</small></div>
      <div><label htmlFor="adviser-status">{words(locale, "处理状态", "Processing status")}</label>
        <select id="adviser-status" value={status} onChange={(event) => setStatusFilter(event.target.value as ConsultationStatus | "")}><option value="">{words(locale, "全部状态", "All statuses")}</option>{statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></div>
    </div>
    <div className="adviser-master-detail">
      <section className="adviser-record-list" aria-label={words(locale, "咨询列表", "Consultation list")} aria-busy={pending}>
        <div className="adviser-list-heading"><div><h2>{words(locale, "客户咨询", "Client enquiries")}</h2><p>{words(locale, "最新提交优先 · 马来西亚时间", "Newest first · Malaysia time")}</p></div>{data && <strong>{data.totalElements}</strong>}</div>
        {pending && <p className="adviser-message" role="status" aria-live="polite">{words(locale, "正在载入咨询…", "Loading consultations…")}</p>}
        {!pending && currentList && currentList.status !== "ready" && <div className="adviser-message adviser-error" role="alert"><p>{errorText(currentList.status)}</p><button className="secondary" onClick={() => setRevision((value) => value + 1)}>{words(locale, "重试", "Retry")}</button></div>}
        {!pending && data?.items.length === 0 && <p className="adviser-message" role="status">{query || status ? words(locale, "没有符合筛选条件的咨询。", "No consultations match these filters.") : words(locale, "暂无咨询记录。", "No consultations yet.")}</p>}
        {data && data.items.length > 0 && <ol className="adviser-records">{data.items.map((item) => <li key={item.referenceCode}>
          <button type="button" className="adviser-record" disabled={saving} data-selected={selected === item.referenceCode} aria-expanded={selected === item.referenceCode} aria-controls="consultation-detail" onClick={(event) => {
            opener.current = event.currentTarget; setSelected(item.referenceCode); void loadDetail(item.referenceCode);
          }}>
            <span className="adviser-record-primary"><strong>{item.name}</strong><span>{item.contact}</span></span>
            <span className="adviser-record-intent"><strong>{item.intendedCourse ?? item.intendedSchool ?? missing}</strong><span>{[item.intendedSchool, qualification(item.qualification)].filter(Boolean).join(" · ")}</span></span>
            <span className="adviser-record-meta"><span className={`adviser-status adviser-status-${item.status.toLowerCase()}`}>{statusLabel(item.status)}</span><time dateTime={item.createdAt}>{date(item.createdAt)}</time></span>
          </button>
        </li>)}</ol>}
        {data && <nav className="adviser-pagination" aria-label={words(locale, "咨询分页", "Consultation pagination")}>
          <button className="secondary" disabled={pending || page <= 1} onClick={() => router.replace(`/${locale}/adviser/consultations?${consultationQuery(filters, { page: page - 1 })}`, { scroll: false })}>{words(locale, "上一页", "Previous")}</button>
          <p>{words(locale, `第 ${page} 页 / 共 ${Math.max(1, data.totalPages)} 页`, `Page ${page} of ${Math.max(1, data.totalPages)}`)}</p>
          <button className="secondary" disabled={pending || page >= data.totalPages} onClick={() => router.replace(`/${locale}/adviser/consultations?${consultationQuery(filters, { page: page + 1 })}`, { scroll: false })}>{words(locale, "下一页", "Next")}</button>
        </nav>}
      </section>
      <aside id="consultation-detail" className="adviser-detail" aria-labelledby="consultation-detail-title" aria-busy={detailPending || saving}>
        {!selected && <div className="adviser-detail-empty"><span aria-hidden="true">⌁</span><h2 id="consultation-detail-title">{words(locale, "选择一条咨询", "Select an enquiry")}</h2><p>{words(locale, "客户提交的完整资料会显示在这里。", "The complete submitted details will appear here.")}</p></div>}
        {selected && <>
          <div className="adviser-detail-heading"><div><p className="eyebrow">{words(locale, "客户资料", "Client profile")}</p><h2 id="consultation-detail-title" ref={detailHeading} tabIndex={-1}>{detail?.name ?? words(locale, "咨询详情", "Consultation details")}</h2></div>
            <button className="secondary" disabled={saving} onClick={() => { detailRequests.current.cancel(); setSelected(null); setDetail(null); opener.current?.focus(); }}>{words(locale, "关闭详情", "Close details")}</button></div>
          {detailPending && <p role="status" aria-live="polite">{words(locale, "正在载入详情…", "Loading details…")}</p>}
          {stale && <p className="adviser-warning" role="alert">{consultationConflictMessage(locale, detailPending, detailFailure !== null)}</p>}
          {detailFailure && <div className="adviser-error" role="alert"><p>{errorText(detailFailure.status)}</p><button className="secondary" disabled={detailPending || saving} onClick={() => void loadDetail(selected, true)}>{words(locale, "重新载入详情", "Reload details")}</button></div>}
          {detail && <>
            <div className="adviser-contact-row"><div><span>{columns[2]}</span><strong>{detail.contact}</strong></div>{action && <a className="button adviser-contact-action" href={action.href}>{action.kind === "email" ? words(locale, "联系邮箱", "Email contact") : words(locale, "拨打电话", "Call contact")}</a>}</div>
            <dl className="adviser-detail-fields">
              {[[columns[3], detail.intendedSchool ?? missing], [columns[4], detail.intendedCourse ?? missing], [columns[5], qualification(detail.qualification)], [columns[0], date(detail.createdAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              <div className="adviser-notes"><dt>{words(locale, "咨询备注", "Enquiry notes")}</dt><dd>{detail.notes ?? missing}</dd></div>
            </dl>
            <form className="adviser-status-form" onSubmit={(event) => { event.preventDefault(); void saveStatus(); }}>
              <div><label htmlFor="adviser-next-status">{words(locale, "更新处理状态", "Update processing status")}</label><select id="adviser-next-status" value={nextStatus} disabled={saving || detailPending || needsReload} onChange={(event) => setNextStatus(event.target.value as ConsultationStatus)}>{statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></div>
              <button type="submit" disabled={saving || detailPending || needsReload || nextStatus === detail.status}>{saving ? words(locale, "正在保存…", "Saving…") : words(locale, "保存状态", "Save status")}</button>
            </form>
            {saved && <p className="adviser-saved" role="status" aria-live="polite">{words(locale, "状态已更新。", "Status updated.")}</p>}
            <details className="adviser-system-info"><summary>{words(locale, "系统信息", "System information")}</summary><dl>
              {[[words(locale, "咨询编号", "Reference code"), detail.referenceCode], [words(locale, "提交语言", "Submission language"), detail.locale === "zh" ? "中文" : "English"], [words(locale, "隐私声明版本", "Privacy notice version"), detail.privacyNoticeVersion], [words(locale, "状态更新时间", "Status updated at"), date(detail.statusUpdatedAt)], [words(locale, "更新账户编号", "Updated by account ID"), detail.statusUpdatedByUserId === null ? words(locale, "尚未更新", "Not updated yet") : String(detail.statusUpdatedByUserId)], [words(locale, "记录版本", "Record version"), String(detail.version)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl></details>
          </>}
        </>}
      </aside>
    </div>
  </div>;
}
