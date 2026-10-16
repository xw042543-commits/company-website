"use client";

import Link from "next/link";
import { AdminAccountLink } from "./admin-account-link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { adminRead, adminWrite, adminCatalogListPath, studyLevelZh, type AdminOption, type AdminOptions, type AdminPage, type AdminProgramme, type AdminUniversity } from "@/lib/admin-catalog-api";
import { type Locale } from "@/lib/site";

import { AdminLifecycleActions, AdminOperationHistory, type AdminLifecycleHandle } from "./admin-lifecycle-actions";
const words = (_locale: Locale, zh: string, en: string) => { void en; return zh; };
type Tab = "universities" | "programmes";
const emptyOptions: AdminOptions = { countries: [], categories: [], studyLevels: [], courseModes: [], universities: [] };
const label = (option: AdminOption, locale: Locale) => { void locale; return option.nameZh || option.nameEn || option.code; };
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const optionalNumber = (data: FormData, key: string) => value(data, key) ? Number(value(data, key)) : null;

export function AdminCatalogPanel({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState<Tab>("universities");
  const [options, setOptions] = useState(emptyOptions);
  const [universities, setUniversities] = useState<AdminPage<AdminUniversity> | null>(null);
  const [programmes, setProgrammes] = useState<AdminPage<AdminProgramme> | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const loadVersion = useRef(0);
  const lifecycleRef = useRef<AdminLifecycleHandle>(null);
  const [universityFilter, setUniversityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [studyLevelFilter, setStudyLevelFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingUniversity, setEditingUniversity] = useState<AdminUniversity | null | undefined>(undefined);
  const [editingProgramme, setEditingProgramme] = useState<AdminProgramme | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [selection, setSelection] = useState<{key: string; ids: number[]}>({key:"",ids:[]});
  const selectionKey = [tab,query,status,country,universityFilter,categoryFilter,studyLevelFilter,page].join("|");
  const selected = selection.key === selectionKey ? selection.ids : [];
  const setSelected = (ids: number[]) => setSelection({key:selectionKey,ids});

  const load = useCallback(async () => {
    const base = browserApiBaseUrl();
    const version = ++loadVersion.current;
    const path = adminCatalogListPath(tab, { query, status, country, universityId: universityFilter, categoryId: categoryFilter, studyLevelId: studyLevelFilter, page });
    const [optionResult, listResult] = await Promise.all([
      adminRead<AdminOptions>(base, "/api/v1/admin/catalog/options"),
      tab === "universities"
        ? adminRead<AdminPage<AdminUniversity>>(base, path)
        : adminRead<AdminPage<AdminProgramme>>(base, path),
    ]);
    if (version !== loadVersion.current) return;
    if (optionResult.status === "ready") setOptions(optionResult.value);
    if (listResult.status === "ready") {
      const lastPage = Math.max(1, listResult.value.totalPages);
      if (page > lastPage) { setPage(lastPage); return; }
      if (tab === "universities") setUniversities(listResult.value as AdminPage<AdminUniversity>);
      else setProgrammes(listResult.value as AdminPage<AdminProgramme>);
    } else setNotice(words(locale, "数据加载失败，请刷新后重试。", "Could not load data. Refresh and try again."));
  }, [categoryFilter, country, locale, page, query, status, studyLevelFilter, tab, universityFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => { window.clearTimeout(timer); loadVersion.current += 1; };
  }, [load]);

  async function saveUniversity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const data = new FormData(event.currentTarget);
    const body = { universityCode: value(data, "universityCode").toUpperCase(), slug: value(data, "slug"), nameZh: value(data, "nameZh"), nameEn: value(data, "nameEn"), countryCode: value(data, "countryCode"), regionZh: value(data, "regionZh"), regionEn: value(data, "regionEn"), descriptionZh: value(data, "descriptionZh"), descriptionEn: value(data, "descriptionEn"), officialUrl: value(data, "officialUrl"), logoUrl: value(data, "logoUrl") };
    const path = editingUniversity ? `/api/v1/admin/catalog/universities/${editingUniversity.id}` : "/api/v1/admin/catalog/universities";
    const result = await adminWrite<AdminUniversity>(browserApiBaseUrl(), path, editingUniversity ? "PUT" : "POST", body);
    setBusy(false);
    if (result.status === "ready") { setEditingUniversity(undefined); setNotice(words(locale, "院校已保存。", "University saved.")); await load(); }
    else setNotice(result.message || words(locale, "保存失败，请检查内容。", "Save failed. Check the form."));
  }

  async function saveProgramme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const data = new FormData(event.currentTarget);
    const body = { programmeCode: value(data, "programmeCode").toUpperCase(), universityId: Number(value(data, "universityId")), slug: value(data, "slug"), nameZh: value(data, "nameZh"), nameEn: value(data, "nameEn"), categoryId: Number(value(data, "categoryId")), studyLevelId: optionalNumber(data, "studyLevelId"), courseModeId: optionalNumber(data, "courseModeId"), descriptionZh: value(data, "descriptionZh"), descriptionEn: value(data, "descriptionEn"), durationMonths: optionalNumber(data, "durationMonths"), durationDisplay: value(data, "durationDisplay"), tuitionMin: optionalNumber(data, "tuitionMin"), tuitionMax: optionalNumber(data, "tuitionMax"), tuitionCurrency: value(data, "tuitionCurrency").toUpperCase() || null, tuitionDisplay: value(data, "tuitionDisplay"), admissionsZh: value(data, "admissionsZh"), admissionsEn: value(data, "admissionsEn"), curriculumZh: value(data, "curriculumZh"), curriculumEn: value(data, "curriculumEn"), officialUrl: value(data, "officialUrl") };
    const path = editingProgramme ? `/api/v1/admin/catalog/programmes/${editingProgramme.id}` : "/api/v1/admin/catalog/programmes";
    const result = await adminWrite<AdminProgramme>(browserApiBaseUrl(), path, editingProgramme ? "PUT" : "POST", body);
    setBusy(false);
    if (result.status === "ready") { setEditingProgramme(undefined); setNotice(words(locale, "专业已保存。", "Programme saved.")); await load(); }
    else setNotice(result.message || words(locale, "保存失败，请检查内容。", "Save failed. Check the form."));
  }

  async function toggle(kind: Tab, item: AdminUniversity | AdminProgramme) {
    const enabled = item.status !== "PUBLISHED";
    if (!enabled && !window.confirm(words(locale, "确定停用？停用后普通用户将无法查看。", "Disable this item? It will no longer be visible to ordinary users."))) return;
    setBusy(true);
    const path = `/api/v1/admin/catalog/${kind}/${item.id}/status`;
    const result = await adminWrite(browserApiBaseUrl(), path, "PATCH", { enabled });
    setBusy(false);
    if (result.status === "ready") { setNotice(enabled ? words(locale, "已恢复启用。", "Enabled.") : words(locale, "已停用。", "Disabled.")); await load(); }
    else setNotice(result.message || words(locale, "状态修改失败。", "Could not change status."));
  }

  const currentPage = tab === "universities" ? universities : programmes;
  return <main className="admin-console container">
    <header className="admin-console-header"><div><span className="section-label">{words(locale, "内容管理", "Content administration")}</span><h1>{words(locale, "管理后台", "Administration")}</h1><p>{words(locale, "维护院校、专业及课程资料。停用内容不会删除历史数据。", "Maintain universities, programmes and curriculum. Disabled content keeps its history.")}</p></div><nav className="admin-console-actions" aria-label={words(locale, "页面导航", "Page navigation")}><Link className="button secondary" href={`/${locale}`}>{words(locale, "首页", "Home")}</Link></nav></header>
    <div className="admin-tabs" role="tablist">
      <AdminAccountLink locale={locale} /><Link className="button secondary" href={`/${locale}/admin/imports`}>批量导入</Link><Link className="button secondary" href={`/${locale}/admin/courses`}>课程管理</Link>
      <button className={tab === "universities" ? "active" : "secondary"} onClick={() => { setTab("universities"); setPage(1); }}>{words(locale, "院校管理", "Universities")}</button>
      <button className={tab === "programmes" ? "active" : "secondary"} onClick={() => { setTab("programmes"); setPage(1); }}>{words(locale, "专业管理", "Programmes / curriculum")}</button>
    </div>
    <section className="admin-toolbar">
      <label><span>{words(locale, "搜索", "Search")}</span><input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder={words(locale, "名称或编码", "Name or code")} /></label>
      <label><span>{words(locale, "国家", "Country")}</span><select value={country} onChange={event => { setCountry(event.target.value); setPage(1); }}><option value="">{words(locale, "全部国家", "All countries")}</option>{options.countries.map(option => <option key={option.code} value={option.code}>{label(option, locale)}</option>)}</select></label>
      <label><span>{words(locale, "状态", "Status")}</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">{words(locale, "全部", "All")}</option><option value="PUBLISHED">{words(locale, "启用", "Enabled")}</option><option value="ARCHIVED">{words(locale, "停用", "Disabled")}</option><option value="DRAFT">{words(locale, "草稿", "Draft")}</option><option value="TRASH">回收站</option></select></label>
      {tab === "programmes" && <label><span>{words(locale, "所属院校", "University")}</span><select value={universityFilter} onChange={event => { setUniversityFilter(event.target.value); setPage(1); }}><option value="">{words(locale, "全部院校", "All universities")}</option>{options.universities.map(option => <option key={option.id} value={option.id}>{label(option, locale)}</option>)}</select></label>}
      {tab === "programmes" && <>
        <label><span>{words(locale, "学科分类", "Subject")}</span><select value={categoryFilter} onChange={event => { setCategoryFilter(event.target.value); setPage(1); }}><option value="">{words(locale, "全部分类", "All subjects")}</option>{options.categories.map(option => <option key={option.id} value={option.id}>{label(option, locale)}</option>)}</select></label>
        <label><span>{words(locale, "学历层次", "Study level")}</span><select value={studyLevelFilter} onChange={event => { setStudyLevelFilter(event.target.value); setPage(1); }}><option value="">{words(locale, "全部学历", "All levels")}</option>{options.studyLevels.map(option => <option key={option.id} value={option.id}>{locale === "zh" ? studyLevelZh(option) : label(option, locale)}</option>)}</select></label>
      </>}
      <button onClick={() => tab === "universities" ? setEditingUniversity(null) : setEditingProgramme(null)}>+ {words(locale, "新增", "Add")}</button>
    </section>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {currentPage && <p role="status">{words(locale, `共 ${currentPage.total} 条记录`, `${currentPage.total} records`)}</p>}
    <AdminLifecycleActions handleRef={lifecycleRef} key={`${tab}:${status}`} type={tab === "universities" ? "UNIVERSITY" : "PROGRAMME"} ids={selected} trash={status === "TRASH"} onDone={() => {setSelected([]);void load();}} />
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th><input type="checkbox" aria-label="全选本页" checked={!!currentPage?.items.length && currentPage.items.every(i=>selected.includes(i.id))} onChange={e=>setSelected(e.target.checked ? currentPage?.items.map(i=>i.id) ?? [] : [])}/></th>{tab === "universities" ? <><th>{words(locale, "院校", "University")}</th><th>{words(locale, "国家 / 地区", "Country / region")}</th><th>{words(locale, "专业数", "Programmes")}</th></> : <><th>{words(locale, "专业", "Programme")}</th><th>{words(locale, "院校", "University")}</th><th>{words(locale, "学历 / 学科", "Level / subject")}</th></>}<th>{words(locale, "状态", "Status")}</th><th>{words(locale, "操作", "Actions")}</th></tr></thead>
      <tbody>{tab === "universities" ? universities?.items.map(item => <tr key={item.id}><td><input type="checkbox" aria-label={`选择${item.nameZh || item.nameEn}`} checked={selected.includes(item.id)} onChange={e=>setSelected(e.target.checked ? [...selected,item.id] : selected.filter(id=>id!==item.id))}/></td><td><strong>{locale === "zh" ? item.nameZh || item.nameEn : item.nameEn || item.nameZh}</strong><small>{item.universityCode} · {item.slug}</small></td><td>{locale === "zh" ? item.countryNameZh || item.countryNameEn : item.countryNameEn || item.countryNameZh}<small>{locale === "zh" ? item.regionZh : item.regionEn}</small></td><td>{item.programmeCount}</td><StatusCell status={status === "TRASH" ? "TRASH" : item.status} locale={locale} /><td><button className="secondary" onClick={() => setEditingUniversity(item)}>{words(locale, "编辑", "Edit")}</button><button className="secondary" disabled={busy || status === "TRASH"} onClick={() => toggle("universities", item)}>{item.status === "PUBLISHED" ? words(locale, "停用", "Disable") : words(locale, "启用", "Enable")}</button><button className="secondary" disabled={busy} onClick={() => lifecycleRef.current?.inspect(status === "TRASH" ? "RESTORE" : "TRASH",[item.id])}>{status === "TRASH" ? "恢复" : "删除"}</button></td></tr>) : programmes?.items.map(item => <tr key={item.id}><td><input type="checkbox" aria-label={`选择${item.nameZh || item.nameEn}`} checked={selected.includes(item.id)} onChange={e=>setSelected(e.target.checked ? [...selected,item.id] : selected.filter(id=>id!==item.id))}/></td><td><strong>{locale === "zh" ? item.nameZh || item.nameEn : item.nameEn || item.nameZh}</strong><small>{item.programmeCode}</small></td><td>{item.universityName}</td><td>{locale === "zh" ? programmeLevelZh(item, options.studyLevels) : item.studyLevelName || "—"}<small>{item.categoryName}</small></td><StatusCell status={status === "TRASH" ? "TRASH" : item.status} locale={locale} /><td><button className="secondary" onClick={() => setEditingProgramme(item)}>{words(locale, "编辑", "Edit")}</button><button className="secondary" disabled={busy || status === "TRASH"} onClick={() => toggle("programmes", item)}>{item.status === "PUBLISHED" ? words(locale, "停用", "Disable") : words(locale, "启用", "Enable")}</button><button className="secondary" disabled={busy} onClick={() => lifecycleRef.current?.inspect(status === "TRASH" ? "RESTORE" : "TRASH",[item.id])}>{status === "TRASH" ? "恢复" : "删除"}</button></td></tr>)}</tbody>
    </table>{currentPage && currentPage.items.length === 0 && <p className="admin-empty">{words(locale, "没有符合条件的数据。", "No matching records.")}</p>}</div>
    {currentPage && currentPage.totalPages > 1 && <nav className="admin-pagination"><button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{words(locale, "上一页", "Previous")}</button><span>{page} / {currentPage.totalPages} · {currentPage.total}</span><button className="secondary" disabled={page >= currentPage.totalPages} onClick={() => setPage(page + 1)}>{words(locale, "下一页", "Next")}</button></nav>}
    <AdminOperationHistory />
    {editingUniversity !== undefined && <UniversityForm locale={locale} item={editingUniversity} options={options} busy={busy} onClose={() => setEditingUniversity(undefined)} onSubmit={saveUniversity} />}
    {editingProgramme !== undefined && <ProgrammeForm locale={locale} item={editingProgramme} options={options} busy={busy} onClose={() => setEditingProgramme(undefined)} onSubmit={saveProgramme} />}
  </main>;
}

function programmeLevelZh(item: AdminProgramme, options: AdminOption[]) {
  const option = options.find(candidate => candidate.id === item.studyLevelId);
  return option ? studyLevelZh(option) : item.studyLevelName || "—";
}

function StatusCell({ status, locale }: { status: string; locale: Locale }) { return <td><span className={`admin-status ${status.toLowerCase()}`}>{status === "TRASH" ? "回收站" : status === "PUBLISHED" ? words(locale, "启用", "Enabled") : status === "ARCHIVED" ? words(locale, "停用", "Disabled") : words(locale, "草稿", "Draft")}</span></td>; }
function Field({ name, title, initial = "", required = false, type = "text", readOnly = false }: { name: string; title: string; initial?: string | number | null; required?: boolean; type?: string; readOnly?: boolean }) { return <label><span>{title}</span><input name={name} defaultValue={initial ?? ""} required={required} type={type} readOnly={readOnly} /></label>; }
function TextArea({ name, title, initial = "", wide = true, rows = 4 }: { name: string; title: string; initial?: string | null; wide?: boolean; rows?: number }) { return <label className={wide ? "admin-wide" : undefined}><span>{title}</span><textarea name={name} defaultValue={initial ?? ""} rows={rows} /></label>; }

function UniversityForm({ locale, item, options, busy, onClose, onSubmit }: { locale: Locale; item: AdminUniversity | null; options: AdminOptions; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="university-editor-title"><form className="admin-editor admin-university-editor" onSubmit={onSubmit}><header><div><span className="admin-editor-kicker">院校资料</span><h2 id="university-editor-title">{item ? words(locale, "编辑院校", "Edit university") : words(locale, "新增院校", "Add university")}</h2></div><button type="button" className="secondary" aria-label={words(locale, "关闭编辑窗口", "Close editor")} onClick={onClose}>×</button></header><div className="admin-form-grid">
    <Field name="nameZh" title="中文名称" initial={item?.nameZh} /><Field name="nameEn" title="英文名称" initial={item?.nameEn} />
    <Field name="universityCode" title="内部编码（可留空自动生成）" initial={item?.universityCode} readOnly={!!item} /><Field name="slug" title="页面地址（可留空自动生成）" initial={item?.slug} />
    <label><span>{words(locale, "国家", "Country")}</span><select name="countryCode" defaultValue={item?.countryCode ?? "MY"} required>{options.countries.map(option => <option key={option.code} value={option.code}>{label(option, locale)}</option>)}</select></label>
    <Field name="regionZh" title="地区（中文）" initial={item?.regionZh} /><Field name="regionEn" title="地区（英文）" initial={item?.regionEn} />
    <Field name="officialUrl" title={words(locale, "官网链接", "Official website")} initial={item?.officialUrl} type="url" /><Field name="logoUrl" title="校徽图片链接" initial={item?.logoUrl} type="url" />
    <TextArea name="descriptionZh" title="简介（中文）" initial={item?.descriptionZh} wide={false} rows={3} /><TextArea name="descriptionEn" title="介绍（英文）" initial={item?.descriptionEn} wide={false} rows={3} />
  </div><footer><button type="button" className="secondary" onClick={onClose}>{words(locale, "取消", "Cancel")}</button><button disabled={busy}>{busy ? words(locale, "保存中…", "Saving…") : words(locale, "保存", "Save")}</button></footer></form></div>;
}

function ProgrammeForm({ locale, item, options, busy, onClose, onSubmit }: { locale: Locale; item: AdminProgramme | null; options: AdminOptions; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="admin-modal" role="dialog" aria-modal="true"><form className="admin-editor admin-editor-large" onSubmit={onSubmit}><header><h2>{item ? words(locale, "编辑专业 / 课程", "Edit programme") : words(locale, "新增专业 / 课程", "Add programme")}</h2><button type="button" className="secondary" onClick={onClose}>×</button></header><div className="admin-form-grid">
    <Field name="nameZh" title="专业名称（中文）" initial={item?.nameZh} /><Field name="nameEn" title="专业名称（英文）" initial={item?.nameEn} />
    <Field name="programmeCode" title="内部编码（可留空自动生成）" initial={item?.programmeCode} readOnly={!!item} /><Field name="slug" title="页面地址（可留空自动生成）" initial={item?.slug} />
    <label><span>{words(locale, "所属院校", "University")}</span><select name="universityId" defaultValue={item?.universityId ?? ""} required><option value="" disabled>{words(locale, "请选择", "Select")}</option>{options.universities.map(option => <option key={option.id} value={option.id}>{label(option, locale)}</option>)}</select></label>
    <label><span>{words(locale, "学科分类", "Subject")}</span><select name="categoryId" defaultValue={item?.categoryId ?? ""} required><option value="" disabled>{words(locale, "请选择", "Select")}</option>{options.categories.map(option => <option key={option.id} value={option.id}>{label(option, locale)}</option>)}</select></label>
    <label><span>{words(locale, "学历层次", "Study level")}</span><select name="studyLevelId" defaultValue={item?.studyLevelId ?? ""}><option value="">—</option>{options.studyLevels.map(option => <option key={option.id} value={option.id}>{locale === "zh" ? studyLevelZh(option) : label(option, locale)}</option>)}</select></label>
    <label><span>{words(locale, "授课方式", "Mode")}</span><select name="courseModeId" defaultValue={item?.courseModeId ?? ""}><option value="">—</option>{options.courseModes.map(option => <option key={option.id} value={option.id}>{label(option, locale)}</option>)}</select></label>
    <Field name="durationMonths" title={words(locale, "学制（月）", "Duration (months)")} initial={item?.durationMonths} type="number" /><Field name="durationDisplay" title={words(locale, "学制显示", "Duration display")} initial={item?.durationDisplay} />
    <Field name="tuitionMin" title={words(locale, "最低学费", "Minimum tuition")} initial={item?.tuitionMin} type="number" /><Field name="tuitionMax" title={words(locale, "最高学费", "Maximum tuition")} initial={item?.tuitionMax} type="number" />
    <Field name="tuitionCurrency" title={words(locale, "币种（如 MYR）", "Currency (e.g. MYR)")} initial={item?.tuitionCurrency} /><Field name="tuitionDisplay" title={words(locale, "学费说明", "Tuition display")} initial={item?.tuitionDisplay} />
    <Field name="officialUrl" title={words(locale, "官网链接", "Official URL")} initial={item?.officialUrl} type="url" />
    <TextArea name="descriptionZh" title="课程介绍（中文）" initial={item?.descriptionZh} /><TextArea name="descriptionEn" title="介绍（英文）" initial={item?.descriptionEn} />
    <TextArea name="admissionsZh" title="入学要求（中文）" initial={item?.admissionsZh} /><TextArea name="admissionsEn" title="入学要求（英文）" initial={item?.admissionsEn} />
    <TextArea name="curriculumZh" title="专业课程（中文）" initial={item?.curriculumZh} /><TextArea name="curriculumEn" title="专业课程（英文）" initial={item?.curriculumEn} />
  </div><footer><button type="button" className="secondary" onClick={onClose}>{words(locale, "取消", "Cancel")}</button><button disabled={busy}>{busy ? words(locale, "保存中…", "Saving…") : words(locale, "保存", "Save")}</button></footer></form></div>;
}
