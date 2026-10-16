"use client";

import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { adminRead, adminWrite } from "@/lib/admin-catalog-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import type { ImportType } from "@/lib/admin-import-api";

type Impact = { id: number; name: string; inRecycleBin: boolean; associations: Record<string, number>; canPermanentlyDelete: boolean };
const root = "/api/v1/admin/catalog/lifecycle";
const names = { TRASH: "移入回收站", RESTORE: "恢复", PURGE: "永久删除" };
export type AdminLifecycleHandle = { inspect: (action: keyof typeof names, selected?: number[]) => void };
export function AdminLifecycleActions({ type, ids, trash, onDone, handleRef }: { type: ImportType; ids: number[]; trash: boolean; onDone: () => void; handleRef?: Ref<AdminLifecycleHandle> }) {
  const [advanced, setAdvanced] = useState(false), [action, setAction] = useState<keyof typeof names>("TRASH");
  const [preview, setPreview] = useState<Impact[] | null>(null), [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  useEffect(() => { let active = true; void adminRead<{ permanentDelete: boolean }>(browserApiBaseUrl(), `${root}/capabilities`).then(r => { if (active && r.status === "ready") setAdvanced(r.value.permanentDelete); }); return () => { active = false; }; }, []);
  useImperativeHandle(handleRef, () => ({ inspect }));
  async function inspect(next: keyof typeof names, selected: number[] = ids) {
    setBusy(true); setNotice(""); setConfirmation(""); setAction(next);
    const r = await adminWrite<Impact[]>(browserApiBaseUrl(), `${root}/preview`, "POST", { type, ids: selected, action: next });
    setBusy(false); if (r.status === "ready") setPreview(r.value); else setNotice(r.message || "无法检查关联数据，请刷新后重试。");
  }
  async function execute() {
    if (!preview) return;
    if (action === "PURGE" && !window.confirm(`再次确认：永久删除这 ${preview.length} 条记录？此操作无法恢复。`)) return;
    setBusy(true);
    const r = await adminWrite(browserApiBaseUrl(), root, "POST", { type, ids: preview.map(i => i.id), action, confirmation });
    setBusy(false); if (r.status === "ready") { setPreview(null); setNotice(`${names[action]}已完成，前台搜索将同步更新。`); onDone(); } else setNotice(r.message || "操作未完成，数据已保留，请刷新后重试。");
  }
  const expected = action === "PURGE" ? "永久删除" : "确认";
  return <div className="admin-lifecycle">
    <div className="import-actions"><span>已选择 {ids.length} 条（每次最多100条）</span>{trash ? <><button className="secondary" disabled={busy || !ids.length} onClick={() => inspect("RESTORE")}>恢复所选</button>{advanced && <button className="secondary" disabled={busy || !ids.length} onClick={() => inspect("PURGE")}>永久删除所选</button>}</> : <button className="secondary" disabled={busy || !ids.length} onClick={() => inspect("TRASH")}>删除所选</button>}</div>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {preview && <div className="admin-modal" role="dialog" aria-modal="true" aria-label="删除影响确认"><section className="admin-editor"><header><h2>{names[action]}前确认</h2><button className="secondary" disabled={busy} onClick={() => setPreview(null)}>关闭</button></header>
      <p>{action === "TRASH" ? "删除后前台立即隐藏，历史申请和支付保留。院校被删除时，其专业及课程同时隐藏，可在回收站恢复。" : action === "RESTORE" ? "恢复到删除前的状态。所属院校或专业仍在回收站时，前台仍保持隐藏。" : "永久删除无法恢复；存在下级资料、申请、订单、支付或用户收藏时禁止执行。请先逐级清理无关联课程、专业，最后清理院校。"}</p>
      <ul>{preview.map(item => <li key={item.id}><strong>{item.name}（记录 {item.id}）</strong><p>{Object.entries(item.associations).filter(([, count]) => count > 0).map(([name, count]) => `${name} ${count} 条`).join("；") || "无关联数据"}</p>{action === "PURGE" && !item.canPermanentlyDelete && <p role="alert">此记录不允许永久删除，请保留或先处理关联数据。</p>}</li>)}</ul>
      <label>请填写“{expected}”<input value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" /></label>
      <footer><button className="secondary" disabled={busy} onClick={() => setPreview(null)}>取消</button><button disabled={busy || confirmation !== expected || (action === "PURGE" && preview.some(i => !i.canPermanentlyDelete))} onClick={execute}>{busy ? "处理中…" : `确认${names[action]}`}</button></footer>
    </section></div>}
  </div>;
}

export function AdminOperationHistory() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]), [page, setPage] = useState(1), [notice, setNotice] = useState("");
  async function load(next: number) { const r = await adminRead<Record<string, unknown>[]>(browserApiBaseUrl(), `${root}/audit?page=${next}&size=20`); if (r.status === "ready") { setRows(r.value); setPage(next); setNotice(r.value.length ? "" : "暂无操作记录。"); } else setNotice("操作记录加载失败，请重试。"); }
  return <section className="import-card"><h2>删除与恢复记录</h2><button className="secondary" onClick={() => load(1)}>查看操作记录</button>{notice && <p role="status">{notice}</p>}<ul>{rows.map(row => <li key={String(row.id)}>{String(row.actor_name)} · {({UNIVERSITY:"院校",PROGRAMME:"专业",COURSE:"课程"} as Record<string,string>)[String(row.entity_type)]} #{String(row.entity_id)} · {names[String(row.operation) as keyof typeof names] || "状态调整"} · {new Date(String(row.created_at)).toLocaleString("zh-CN")}</li>)}</ul>{rows.length > 0 && <nav className="admin-pagination"><button className="secondary" disabled={page <= 1} onClick={() => load(page - 1)}>上一页</button><span>第 {page} 页</span><button className="secondary" disabled={rows.length < 20} onClick={() => load(page + 1)}>下一页</button></nav>}</section>;
}
