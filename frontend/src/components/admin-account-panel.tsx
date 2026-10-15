"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminRead, adminWrite, type AdminPage } from "@/lib/admin-catalog-api";
import { accountIdentity, accountListPath, accountStatuses, canChangeIdentity, type ManagedAccount } from "@/lib/admin-account-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import type { Locale } from "@/lib/site";
import styles from "./admin-account-panel.module.css";

type Audit = { id: number; actor_user_id: number; target_user_id: number; actor_name: string; target_name: string; action: string; old_role: string; new_role: string; old_status: string; new_status: string; created_at: string };
type Operation = { account: ManagedAccount; kind: "role" | "status" };
const root = "/api/v1/admin/accounts";
const date = (value: string) => new Date(value).toLocaleString("zh-CN", { hour12: false });
export function AdminAccountPanel({ locale }: { locale: Locale }) {
  const [data, setData] = useState<AdminPage<ManagedAccount> | null>(null);
  const [q, setQ] = useState(""), [status, setStatus] = useState(""), [identity, setIdentity] = useState(""), [page, setPage] = useState(1);
  const [self, setSelf] = useState(0), [allowed, setAllowed] = useState(false), [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<ManagedAccount | null>(null), [operation, setOperation] = useState<Operation | null>(null), [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<AdminPage<Audit> | null>(null), [auditPage, setAuditPage] = useState(1);
  const version = useRef(0), detailVersion = useRef(0);
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!operation) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOperation(null);
      if (event.key !== "Tab") return;
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!buttons?.length) { event.preventDefault(); return; }
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keys); previous?.focus(); };
  }, [operation, busy]);
  const load = useCallback(async () => {
    const current = ++version.current;
    const [users, session] = await Promise.all([
      adminRead<AdminPage<ManagedAccount>>(browserApiBaseUrl(), accountListPath(q, status, identity, page)),
      adminRead<{ userId: number }>(browserApiBaseUrl(), "/api/v1/auth/session"),
    ]);
    if (current !== version.current) return;
    if (users.status === "ready") {
      setAllowed(true); if (page > Math.max(1, users.value.totalPages)) { setPage(Math.max(1, users.value.totalPages)); return; }
      setData(users.value);
      if (session.status === "ready") setSelf(session.value.userId);
    } else {
      setData(null); setAllowed(false);
      setNotice(users.status === "unauthorized" ? "登录已失效，请重新登录。" : users.status === "forbidden" ? "仅高级管理员可访问账号管理。" : "账号加载失败，请重试。");
    }
  }, [q, status, identity, page]);
  useEffect(() => { const counter = version; const timer = setTimeout(() => { void load(); }, 200); return () => { clearTimeout(timer); counter.current++; }; }, [load]);
  const loadAudit = useCallback(async () => {
    const query = new URLSearchParams({ page: String(auditPage), size: "10" });
    if (detail) query.set("target", String(detail.id));
    return adminRead<AdminPage<Audit>>(browserApiBaseUrl(), `${root}/audit?${query}`);
  }, [detail, auditPage]);
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    void loadAudit().then(r => { if (active) { setAudit(r.status === "ready" ? r.value : null); if (r.status !== "ready") setNotice("操作日志加载失败，请刷新重试。"); } });
    return () => { active = false; };
  }, [allowed, loadAudit]);
  async function openDetail(account: ManagedAccount) {
    const current = ++detailVersion.current;
    const r = await adminRead<ManagedAccount>(browserApiBaseUrl(), `${root}/${account.id}`);
    if (current !== detailVersion.current) return;
    if (r.status === "ready") { setDetail(r.value); setAuditPage(1); } else setNotice(r.message || "详情加载失败，请重试。");
  }
  async function confirm() {
    if (!operation || busy) return;
    setBusy(true);
    const { account, kind } = operation;
    const body = { confirmed: true, expectedUpdatedAt: account.updatedAt, ...(kind === "role" ? { role: account.role === "ADMIN" ? "USER" : "ADMIN" } : { enabled: account.status === "DISABLED" }) };
    const r = await adminWrite<ManagedAccount>(browserApiBaseUrl(), `${root}/${account.id}/${kind}`, "PATCH", body);
    setBusy(false); setOperation(null);
    if (r.status === "ready") {
      setNotice("修改成功，已撤销该账号原有登录凭证。用户需要重新登录。");
      if (detail?.id === r.value.id) setDetail(r.value);
      await load(); const logs = await loadAudit(); if (logs.status === "ready") setAudit(logs.value);
    } else { setNotice(r.message || "操作失败，请刷新后重新确认。"); await load(); }
  }
  const changeLabel = (op: Operation) => op.kind === "role" ? (op.account.role === "ADMIN" ? "恢复为普通用户" : "设为普通管理员") : op.account.status === "DISABLED" ? "启用账号" : "禁用账号";
  return <main className={`admin-console container ${styles.console}`}>
    <header className="admin-console-header"><div><span className="section-label">高级管理员</span><h1>账号管理</h1><p>管理注册账号的身份与使用状态。所有变更均记录日志，保留用户资料、订单和申请。</p></div><Link className="button secondary" href={`/${locale}/admin`}>返回管理后台</Link></header>
    {notice && <p role="status" className="admin-notice">{notice}</p>}
    {!allowed && <p>正在核对访问权限，或暂无访问权限。<Link href={`/${locale}/login`}>前往登录</Link>　<button className="secondary" onClick={() => void load()}>重新加载</button></p>}
    {allowed && <>
      <section className="admin-toolbar" aria-label="账号筛选"><label>搜索用户<input maxLength={100} placeholder="姓名、邮箱或手机号" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label>
        <label>账号状态<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">全部状态</option>{Object.entries(accountStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>当前身份<select value={identity} onChange={e => { setIdentity(e.target.value); setPage(1); }}><option value="">全部身份</option><option value="USER">普通用户</option><option value="ADMIN">普通管理员</option><option value="ADVANCED">高级管理员</option><option value="ADVISER">顾问</option></select></label>
      </section>
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>用户名</th><th>邮箱</th><th>注册时间</th><th>账号状态</th><th>当前身份</th><th>操作</th></tr></thead><tbody>
        {data?.items.map(account => <tr key={account.id}><td>{account.fullName}{account.id === self && <small>（当前账号）</small>}</td><td>{account.email || "未绑定邮箱"}</td><td>{date(account.createdAt)}</td><td>{accountStatuses[account.status] || "未知状态"}</td><td>{accountIdentity(account)}</td><td><div className={styles.actions}>
          <button className="secondary" onClick={() => void openDetail(account)}>查看详情</button>
          {canChangeIdentity(account, self) && <button className="secondary" disabled={busy || !self} onClick={() => setOperation({ account, kind: "role" })}>{account.role === "ADMIN" ? "取消管理员" : "设为管理员"}</button>}
          {account.id !== self && account.status !== "DELETED" && <button className="secondary" disabled={busy || !self} onClick={() => setOperation({ account, kind: "status" })}>{account.status === "DISABLED" ? "启用" : "禁用"}</button>}
        </div></td></tr>)}
        {data?.items.length === 0 && <tr><td colSpan={6}>没有符合条件的账号。</td></tr>}
      </tbody></table></div>
      <div className={styles.pager}><span>共 {data?.total ?? 0} 个账号，第 {page} / {Math.max(1, data?.totalPages ?? 1)} 页</span><button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button className="secondary" disabled={!data || page >= data.totalPages} onClick={() => setPage(page + 1)}>下一页</button></div>
      {detail && <section className={styles.detail} aria-label="账号详情"><header className={styles.pager}><h2>账号详情</h2><button className="secondary" onClick={() => { detailVersion.current++; setDetail(null); setAuditPage(1); }}>关闭详情</button></header><dl className={styles.fields}>{[["账号编号", detail.id], ["用户名", detail.fullName], ["邮箱", detail.email || "未绑定"], ["手机号", detail.phone || "未绑定"], ["当前身份", accountIdentity(detail)], ["账号状态", accountStatuses[detail.status]], ["注册时间", date(detail.createdAt)], ["最近更新时间", date(detail.updatedAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>已注销账号仅可查看；高级管理员身份及顾问身份沿用原有授权流程。</p></section>}
      <section className={styles.detail}><h2>{detail ? `${detail.fullName} 的操作记录` : "账号操作日志"}</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>时间</th><th>操作人</th><th>目标用户</th><th>修改内容</th></tr></thead><tbody>{audit?.items.map(row => <tr key={row.id}><td>{date(row.created_at)}</td><td>{row.actor_name}（编号 {row.actor_user_id}）</td><td>{row.target_name}（编号 {row.target_user_id}）</td><td>{row.action === "ROLE" ? `${accountIdentity({ role: row.old_role, advanced: false })} → ${accountIdentity({ role: row.new_role, advanced: false })}` : `${accountStatuses[row.old_status]} → ${accountStatuses[row.new_status]}`}</td></tr>)}{audit?.items.length === 0 && <tr><td colSpan={4}>暂无操作记录。</td></tr>}</tbody></table></div><div className={styles.pager}><span>共 {audit?.total ?? 0} 条记录，第 {auditPage} 页</span><button className="secondary" disabled={auditPage <= 1} onClick={() => setAuditPage(auditPage - 1)}>上一页</button><button className="secondary" disabled={!audit || auditPage >= audit.totalPages} onClick={() => setAuditPage(auditPage + 1)}>下一页</button></div></section>
    </>}
    {operation && <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="account-confirm-title"><section ref={dialog} className={`admin-editor ${styles.confirm}`}><header><h2 id="account-confirm-title">确认{changeLabel(operation)}</h2></header><p>目标：{operation.account.fullName}（{operation.account.email || `编号 ${operation.account.id}`}）</p><p>当前身份：{accountIdentity(operation.account)}；当前状态：{accountStatuses[operation.account.status]}。</p><p>{operation.kind === "status" && operation.account.status !== "DISABLED" ? "禁用后该账号将无法登录和继续使用服务。" : "变更后该账号需要重新登录；未验证账号仍需完成验证。"}用户资料、订单和申请将保留。</p><footer><button className="secondary" disabled={busy} onClick={() => setOperation(null)}>取消</button><button disabled={busy} onClick={() => void confirm()}>{busy ? "处理中…" : `确认${changeLabel(operation)}`}</button></footer></section></div>}
  </main>;
}
