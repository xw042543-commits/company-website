"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { adminRead, adminWrite, type AdminOption, type AdminPage } from "@/lib/admin-catalog-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { AdminLifecycleActions, AdminOperationHistory } from "./admin-lifecycle-actions";
import type { Locale } from "@/lib/site";

type Course = { id: number; courseCode: string; programmeId: number; programmeName: string; nameZh: string; nameEn: string; officialCode: string; descriptionZh: string; sourceUrl: string; sourceType: string; sortOrder: number; status: string; inRecycleBin: boolean };
const root = "/api/v1/admin/catalog/courses";
export function AdminCoursePanel({ locale }: { locale: Locale }) {
  const [data, setData] = useState<AdminPage<Course> | null>(null), [options, setOptions] = useState<AdminOption[]>([]);
  const [q, setQ] = useState(""), [programme, setProgramme] = useState(""), [status, setStatus] = useState(""), [page, setPage] = useState(1);
  const [selection, setSelection] = useState<{ key: string; ids: number[] }>({ key: "", ids: [] });
  const key = [q, programme, status, page].join("|"), ids = selection.key === key ? selection.ids : [];
  const select = (values: number[]) => setSelection({ key, ids: values });
  const [editing, setEditing] = useState<Course | null | undefined>(undefined), [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  const version = useRef(0);
  const load = useCallback(async () => {
    const current = ++version.current;
    const query = new URLSearchParams({ q, status, page: String(page), size: "20" }); if (programme) query.set("programmeId", programme);
    const [r, o] = await Promise.all([adminRead<AdminPage<Course>>(browserApiBaseUrl(), `${root}?${query}`), adminRead<AdminOption[]>(browserApiBaseUrl(), `${root}/programmes`)]);
    if (current !== version.current) return;
    if (r.status === "ready") { if (page > Math.max(1, r.value.totalPages)) { setPage(Math.max(1, r.value.totalPages)); return; } setData(r.value); } else setNotice("课程加载失败，请检查登录权限后重试。");
    if (o.status === "ready") setOptions(o.value);
  }, [q, status, page, programme]);
  useEffect(() => { const counter=version; const timer = window.setTimeout(() => { void load(); }, 0); return () => { clearTimeout(timer); counter.current++; }; }, [load]);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); const form = new FormData(e.currentTarget), text = (key: string) => String(form.get(key) ?? "").trim();
    const body = { courseCode: text("courseCode"), programmeId: Number(text("programmeId")), nameZh: text("nameZh"), nameEn: text("nameEn"), officialCode: text("officialCode"), descriptionZh: text("descriptionZh"), sourceUrl: text("sourceUrl"), sourceType: text("sourceType"), sortOrder: Number(text("sortOrder") || "0") };
    const result = await adminWrite<Course>(browserApiBaseUrl(), editing ? `${root}/${editing.id}` : root, editing ? "PUT" : "POST", body);
    setBusy(false); if (result.status === "ready") { setEditing(undefined); setNotice(`课程已保存，内部编码：${result.value.courseCode}`); await load(); } else setNotice(result.message || "保存失败，请检查填写内容。");
  }
  async function toggle(item: Course) {
    const enabled = item.status !== "PUBLISHED"; if (!enabled && !window.confirm("确定停用该课程？前台将隐藏此课程，可再次启用。")) return;
    setBusy(true); const r = await adminWrite(browserApiBaseUrl(), `${root}/${item.id}/status`, "PATCH", { enabled }); setBusy(false);
    if (r.status === "ready") { setNotice(enabled ? "课程已启用。" : "课程已停用。"); await load(); } else setNotice(r.message || "状态修改失败。");
  }
  return <main className="admin-console container"><header className="admin-console-header"><div><span className="section-label">内容管理</span><h1>课程管理</h1><p>课程关联具体专业。内部编码自动生成，学校官网课程代码单独保留。未核实内容须选择参考概述。</p></div><Link className="button secondary" href={`/${locale}/admin`}>院校与专业管理</Link><Link className="button secondary" href={`/${locale}/admin/imports`}>批量导入</Link></header>
    <section className="admin-toolbar"><label>搜索课程<input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label><label>所属院校及专业<select value={programme} onChange={e => { setProgramme(e.target.value); setPage(1); }}><option value="">全部专业</option>{options.map(o => <option key={o.id} value={o.id}>{o.nameZh || o.nameEn}</option>)}</select></label><label>查看范围<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">全部在库课程</option><option value="PUBLISHED">启用</option><option value="ARCHIVED">停用</option><option value="TRASH">回收站</option></select></label><button disabled={busy} onClick={() => setEditing(null)}>新增课程</button></section>
    {notice && <p className="admin-notice" role="status">{notice}</p>}<AdminLifecycleActions key={status} type="COURSE" ids={ids} trash={status === "TRASH"} onDone={() => { select([]); void load(); }} />
    <p>共 {data?.total ?? 0} 条课程</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th><input type="checkbox" aria-label="全选本页课程" checked={!!data?.items.length && data.items.every(c => ids.includes(c.id))} onChange={e => select(e.target.checked ? data?.items.map(c => c.id) ?? [] : [])} /></th><th>课程名称 / 内部编码</th><th>所属院校与专业</th><th>学校官网课程代码 / 来源</th><th>状态</th><th>操作</th></tr></thead><tbody>{data?.items.map(c => <tr key={c.id}><td><input type="checkbox" aria-label={`选择${c.nameZh}`} checked={ids.includes(c.id)} onChange={e => select(e.target.checked ? [...ids, c.id] : ids.filter(id => id !== c.id))} /></td><td><strong>{c.nameZh || c.nameEn}</strong><small>{c.nameEn}</small><small>{c.courseCode}</small></td><td>{c.programmeName}</td><td>{c.officialCode || "未提供"}<small>{{ official: "学校官网", third_party: "其他资料", ai_generated: "参考概述" }[c.sourceType] || "待核对"}</small></td><td>{c.inRecycleBin ? "回收站" : c.status === "PUBLISHED" ? "启用" : "停用"}</td><td><button className="secondary" onClick={() => setEditing(c)}>编辑</button><button className="secondary" disabled={busy || c.inRecycleBin} onClick={() => toggle(c)}>{c.status === "PUBLISHED" ? "停用" : "启用"}</button></td></tr>)}</tbody></table>{data?.items.length === 0 && <p className="admin-empty">暂无符合条件的课程。</p>}</div>
    {data && data.totalPages > 1 && <nav className="admin-pagination"><button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><span>{page} / {data.totalPages}</span><button className="secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>下一页</button></nav>}
    <AdminOperationHistory />
    {editing !== undefined && <div className="admin-modal" role="dialog" aria-modal="true" aria-label="课程编辑"><form className="admin-editor" onSubmit={save}><header><h2>{editing ? "编辑课程" : "新增课程"}</h2><button type="button" className="secondary" disabled={busy} onClick={() => setEditing(undefined)}>关闭</button></header><p>学校官网资料需要填写可核对的来源链接。参考内容不会冒充学校官方课程表。</p><div className="admin-form-grid">
      <label>所属院校及专业（必填）<select required name="programmeId" defaultValue={editing?.programmeId ?? ""} aria-readonly={!!editing}>{editing && !options.some(o=>o.id===editing.programmeId) && <option value={editing.programmeId}>{editing.programmeName}</option>}<option value="" disabled>请选择</option>{options.filter(o => !editing || o.id === editing.programmeId).map(o => <option key={o.id} value={o.id}>{o.nameZh || o.nameEn}</option>)}</select></label>
      <label>课程中文名称（必填）<input name="nameZh" required maxLength={200} defaultValue={editing?.nameZh} /></label><label>课程英文名称<input name="nameEn" maxLength={300} defaultValue={editing?.nameEn} /></label><label>内部编码（可留空自动生成）<input name="courseCode" readOnly={!!editing} defaultValue={editing?.courseCode} /></label><label>学校官网课程代码（选填）<input name="officialCode" maxLength={100} defaultValue={editing?.officialCode} /></label><label>展示顺序<input name="sortOrder" type="number" min="0" max="10000" defaultValue={editing?.sortOrder ?? 0} /></label><label>资料来源<select name="sourceType" defaultValue={editing?.sourceType ?? "third_party"}><option value="official">学校官网（已核实）</option><option value="third_party">其他资料</option><option value="ai_generated">参考概述（非官方课程表）</option></select></label><label>资料来源链接<input type="url" name="sourceUrl" defaultValue={editing?.sourceUrl} /></label><label className="admin-wide">课程介绍<textarea name="descriptionZh" rows={5} defaultValue={editing?.descriptionZh} /></label></div><footer><button type="button" className="secondary" disabled={busy} onClick={() => setEditing(undefined)}>取消</button><button disabled={busy}>{busy ? "保存中…" : "保存课程"}</button></footer></form></div>}
  </main>;
}
