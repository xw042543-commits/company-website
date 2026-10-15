"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { ROOT, adminRead, adminWrite, downloadExcel, uploadExcel, importFields, rowLabel, type ImportBatch, type ImportRow, type ImportType } from "@/lib/admin-import-api";
import type { Locale } from "@/lib/site";
const date = (value: string) => new Date(value).toLocaleString("zh-CN");
const batchLabel = (status: string) => ({PROCESSED: "已校验", PUBLISHED: "已发布", PARTIALLY_PUBLISHED: "部分发布", FAILED: "处理失败"} as Record<string,string>)[status] || status;
export function AdminImportPanel({locale}: {locale: Locale}) {
  const [history,setHistory] = useState<ImportBatch[]>([]), [batch,setBatch] = useState<ImportBatch | null>(null), [rows,setRows] = useState<ImportRow[]>([]);
  const [historyPage,setHistoryPage]=useState(1), [historyPages,setHistoryPages]=useState(1);
  const [type,setType] = useState<ImportType>("UNIVERSITY"), [file,setFile] = useState<File | null>(null), [busy,setBusy] = useState(false), [notice,setNotice] = useState("");
  const [selected,setSelected] = useState<number[]>([]), [filter,setFilter] = useState(""), [page,setPage] = useState(1), [editing,setEditing] = useState<ImportRow | null>(null);
  const sequence = useRef(0);
  const loadHistory = useCallback(async () => {const r=await adminRead<{items: ImportBatch[]; totalPages: number}>(browserApiBaseUrl(),`${ROOT}?page=${historyPage}&size=20`); if(r.status === "ready") {setHistory(r.value.items);setHistoryPages(r.value.totalPages);} else setNotice("导入记录加载失败，请检查登录权限后重试。");},[historyPage]);
  useEffect(() => {const timer=window.setTimeout(()=>{void loadHistory();},0);return ()=>window.clearTimeout(timer);},[loadHistory]);
  async function open(id: string) {
    const current=++sequence.current;setBusy(true);setSelected([]);setPage(1);
    const [b,r]=await Promise.all([adminRead<ImportBatch>(browserApiBaseUrl(),`${ROOT}/${id}`),adminRead<ImportRow[]>(browserApiBaseUrl(),`${ROOT}/${id}/rows`)]);
    if(current!==sequence.current)return;
    setBusy(false);if(b.status === "ready" && r.status === "ready") {setBatch(b.value);setRows(r.value);}else setNotice("批次详情加载失败，请重试。");
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!file)return;setBusy(true);setNotice("");
    if(!file.name.toLowerCase().endsWith(".xlsx") || file.size>5*1024*1024){setNotice("请选择不超过5MB的.xlsx文件。");setBusy(false);return;}
    const result=await uploadExcel(browserApiBaseUrl(),type,file);setBusy(false);
    if(result.status === "ready"){setNotice(result.value.batch.failureReason || "文件已校验。请核对草稿和重复记录后确认发布。");setFilter("");await open(result.value.batch.id);await loadHistory();}
    else setNotice(result.message || "上传失败，请稍后重试。");
  }
  async function action(name: "publish" | "remove" | "reprocess") {
    if(!batch)return;
    if(name === "publish" && !window.confirm(`确认发布所选${selected.length}条草稿？发布前将重新查重。`))return;
    if(name === "remove" && !window.confirm(`确认从草稿区移除所选${selected.length}条？导入历史会保留。`))return;
    setBusy(true);setNotice("");
    const result=await adminWrite<ImportBatch | {batch: ImportBatch; publishedCount: number}>(browserApiBaseUrl(),`${ROOT}/${batch.id}/${name}`,"POST",name === "reprocess" ? {} : {rowIds:selected});
    if(result.status === "ready") {setNotice(name === "publish" && "publishedCount" in result.value ? result.value.publishedCount>0 ? `已发布${result.value.publishedCount}条，搜索数据将自动同步。` : "未新增数据。发布前查重发现重复、冲突或请求已经处理，请核对结果。" : name === "remove" ? "草稿已移除，历史记录已保留。" : "已重新校验并查重。");await open(batch.id);await loadHistory();}
    else {setBusy(false);setNotice(result.message || "操作失败，请刷新后重试。");}
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!editing||!batch)return;setBusy(true);
    const form=new FormData(event.currentTarget); const payload=Object.fromEntries(importFields(editing.entityType).map(f=>[f.key,String(form.get(f.key)??"").trim()]));
    const r=await adminWrite<ImportRow>(browserApiBaseUrl(),`${ROOT}/${batch.id}/rows/${editing.id}`,"PUT",{payload});
    if(r.status === "ready"){setEditing(null);setNotice(r.value.errorMessage || r.value.duplicateReason || "草稿已保存并重新校验。");await open(batch.id);await loadHistory();}else {setBusy(false);setNotice(r.message||"保存失败。");}
  }
  async function download(path: string,name: string){setBusy(true);const error=await downloadExcel(browserApiBaseUrl(),path,name);if(error)setNotice(error);setBusy(false);}
  const visible=rows.filter(r => !filter ? true : filter === "DRAFT" || filter === "PUBLISHED" ? r.draftStatus === filter : r.classification === filter);
  const displayed=visible.slice((page-1)*20,page*20);const selectable=visible.filter(r=>r.draftStatus === "DRAFT").map(r=>r.id);const allSelected=selectable.length>0&&selectable.every(id=>selected.includes(id));
  return <main className="admin-console container admin-import">
    <header className="admin-console-header"><div><span className="section-label">内容管理</span><h1>Excel 批量导入</h1><p>下载模板 → 填写数据 → 上传校验与查重 → 预览草稿 → 确认发布</p></div><Link className="button secondary" href={`/${locale}/admin`}>返回管理后台</Link></header>
    <section className="import-card"><h2>1. 下载模板并上传</h2><p>仅支持 .xlsx，最多500条、5MB。新数据先进入草稿区；重复和冲突数据可导出核对。</p><div className="import-actions"><button disabled={busy} className="secondary" onClick={()=>download(`${ROOT}/templates/UNIVERSITY`,"院校导入模板.xlsx")}>下载院校模板</button><button disabled={busy} className="secondary" onClick={()=>download(`${ROOT}/templates/PROGRAMME`,"专业导入模板.xlsx")}>下载专业模板</button></div>
    <form onSubmit={upload} className="import-upload"><label>数据类型<select disabled={busy} value={type} onChange={e=>setType(e.target.value as ImportType)}><option value="UNIVERSITY">院校</option><option value="PROGRAMME">专业</option></select></label><label>选择 Excel 文件<input type="file" accept=".xlsx" required disabled={busy} onChange={e=>setFile(e.target.files?.[0]??null)}/></label><button disabled={busy||!file}>{busy?"处理中…":"上传并校验"}</button></form></section>
    {notice&&<p className="admin-notice" role="status" aria-live="polite">{notice}</p>}
    {batch&&<section className="import-card"><h2>2. 预览与草稿管理</h2><p><strong>{batch.originalFilename}</strong> · {batch.entityType === "UNIVERSITY"?"院校":"专业"} · {batchLabel(batch.status)}</p><p>{batch.uploadedByName} · {date(batch.createdAt)}</p>
      <div className="import-stats">{[["总行数",batch.totalRows],["有效草稿",batch.draftRows],["完全重复",batch.exactDuplicateRows],["疑似重复",batch.possibleDuplicateRows],["字段冲突",batch.conflictRows],["校验错误",batch.invalidRows],["已发布",batch.publishedRows]].map(([label,count])=><div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
      {batch.failureReason&&<p role="alert" className="admin-notice">{batch.failureReason}</p>}
      <div className="import-actions"><label>查看<select value={filter} disabled={busy} onChange={e=>{setFilter(e.target.value);setPage(1);setSelected([]);}}><option value="">全部记录</option><option value="DRAFT">有效草稿</option><option value="EXACT_DUPLICATE">完全重复</option><option value="POSSIBLE_DUPLICATE">疑似重复</option><option value="CONFLICT">字段冲突</option><option value="INVALID">校验错误</option><option value="PUBLISHED">已发布</option></select></label><button className="secondary" disabled={busy} onClick={()=>action("reprocess")}>重新校验与查重</button><button className="secondary" disabled={busy} onClick={()=>download(`${ROOT}/${batch.id}/duplicates.xlsx`,"重复及冲突数据.xlsx")}>下载重复数据 Excel</button></div>
      <div className="import-actions"><label className="import-check"><input type="checkbox" checked={allSelected} disabled={busy||selectable.length===0} onChange={()=>setSelected(allSelected?[]:selectable)}/>全选当前筛选下草稿（{selectable.length}）</label><button className="secondary" disabled={busy||!selected.length} onClick={()=>action("remove")}>移除所选</button><button disabled={busy||!selected.length} onClick={()=>action("publish")}>确认发布（{selected.length}）</button></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>选择</th><th>Excel行号 / 编码</th><th>名称 / 所属院校</th><th>结果</th><th>原因 / 对应记录</th><th>操作</th></tr></thead><tbody>{displayed.map(row=><tr key={row.id}><td><input aria-label={`选择第${row.rowNumber}行`} type="checkbox" checked={selected.includes(row.id)} disabled={busy||row.draftStatus!=="DRAFT"} onChange={()=>setSelected(selected.includes(row.id)?selected.filter(id=>id!==row.id):[...selected,row.id])}/></td><td>{row.rowNumber}<small>{row.payload.programmeCode||row.payload.universityCode}</small></td><td><strong>{row.payload.nameZh||row.payload.nameEn}</strong><small>{row.payload.nameEn}</small><small>{row.entityType === "PROGRAMME" ? `院校：${row.payload.universityCode} · ${row.payload.studyLevelCode} · ${row.payload.campus||"未指定校区"}` : row.payload.countryCode}</small></td><td><span className={`admin-status ${row.draftStatus === "PUBLISHED"?"published":row.classification === "NEW"?"draft":"archived"}`}>{rowLabel(row)}</span></td><td className="import-reason">{row.errorMessage||row.duplicateReason||"校验通过"}{row.matchedRecordId&&<small>已有记录 ID：{row.matchedRecordId}</small>}{row.publishedRecordId&&<small>发布记录 ID：{row.publishedRecordId}</small>}</td><td><button className="secondary" disabled={busy} onClick={()=>setEditing(row)}>{["PUBLISHED","REMOVED"].includes(row.draftStatus)?"查看":"预览 / 编辑"}</button></td></tr>)}</tbody></table>{!displayed.length&&<p className="admin-empty">没有符合条件的记录。</p>}</div>
      {visible.length>20&&<nav className="admin-pagination"><button className="secondary" disabled={busy||page<=1} onClick={()=>setPage(page-1)}>上一页</button><span>{page} / {Math.ceil(visible.length/20)}</span><button className="secondary" disabled={busy||page*20>=visible.length} onClick={()=>setPage(page+1)}>下一页</button></nav>}
    </section>}
    <section className="import-card"><h2>3. 导入记录</h2><p>按上传时间分页展示历史记录；打开批次可查看错误原因、编辑草稿、重新查重或继续发布。</p><button className="secondary" disabled={busy} onClick={()=>loadHistory()}>刷新记录</button><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>上传文件 / 时间</th><th>上传人</th><th>总数 / 草稿 / 重复 / 错误</th><th>发布结果</th><th>操作</th></tr></thead><tbody>{history.map(item=><tr key={item.id}><td><strong>{item.originalFilename}</strong><small>{date(item.createdAt)}</small></td><td>{item.uploadedByName}</td><td>{item.totalRows} / {item.draftRows} / {item.exactDuplicateRows+item.possibleDuplicateRows+item.conflictRows} / {item.invalidRows+item.failedRows}</td><td>{batchLabel(item.status)}<small>已发布 {item.publishedRows} 条</small>{item.failureReason&&<small>{item.failureReason}</small>}</td><td><button className="secondary" disabled={busy} onClick={()=>{setFilter("");void open(item.id);}}>查看批次</button></td></tr>)}</tbody></table>{!history.length&&<p className="admin-empty">暂无导入记录。</p>}</div>{historyPages>1&&<nav className="admin-pagination"><button className="secondary" disabled={busy||historyPage<=1} onClick={()=>setHistoryPage(historyPage-1)}>上一页</button><span>{historyPage} / {historyPages}</span><button className="secondary" disabled={busy||historyPage>=historyPages} onClick={()=>setHistoryPage(historyPage+1)}>下一页</button></nav>}</section>
    {editing&&<div className="admin-modal" role="dialog" aria-modal="true" aria-label="导入草稿编辑"><form className="admin-editor" onSubmit={save}><header><h2>第{editing.rowNumber}行 · {rowLabel(editing)}</h2><button type="button" className="secondary" disabled={busy} onClick={()=>setEditing(null)}>关闭</button></header><div className="admin-form-grid">{importFields(editing.entityType).map(field=><label key={field.key} className={/description|admissions|curriculum/.test(field.key)?"admin-wide":""}><span>{field.title}</span>{/description|admissions|curriculum/.test(field.key)?<textarea name={field.key} defaultValue={editing.payload[field.key]} rows={4} readOnly={["PUBLISHED","REMOVED"].includes(editing.draftStatus)}/>:<input name={field.key} defaultValue={editing.payload[field.key]} required={field.title.endsWith("*")} readOnly={["PUBLISHED","REMOVED"].includes(editing.draftStatus)}/>}</label>)}</div><footer><button type="button" className="secondary" disabled={busy} onClick={()=>setEditing(null)}>关闭</button>{!["PUBLISHED","REMOVED"].includes(editing.draftStatus)&&<button disabled={busy}>保存并重新校验</button>}</footer></form></div>}
  </main>;
}
