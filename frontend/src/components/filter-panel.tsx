"use client";
import Link from "next/link";
import { useState } from "react";
import { SearchSuggestionList } from "@/components/search-suggestion-list";
import { courseSuggestions } from "@/data/search-suggestions";
import { Locale, Query, continents, countries, first, levels, words } from "@/lib/site";
type Option = readonly [string, string, string];
export function FilterPanel({ locale, query, directory = false }: { locale: Locale; query: Query; directory?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const path = `/${locale}/${directory ? "universities" : "planning"}`;
  const select = (name: string, zh: string, en: string, options: readonly Option[]) => {
    const value = first(query, name);
    const unknown = value && !options.some(([id]) => id === value);
    return <div className="field" key={name}><label htmlFor={name}>{words(locale, zh, en)}</label><select id={name} name={name} defaultValue={value}>
      <option value="">{words(locale, "全部", "All")}</option>
      {unknown && <option value={value}>{words(locale, "待确认的选项", "Unconfirmed option")}: {value}</option>}
      {options.map(([id, a, b]) => <option key={id} value={id}>{words(locale, a, b)}</option>)}
    </select></div>;
  };
  return <aside className="filter-panel">
    <button type="button" className="mobile-filter-toggle" aria-expanded={expanded} aria-controls="filter-fields" onClick={() => setExpanded(!expanded)}><span>{words(locale, "筛选条件", "Filters")}</span><span>{expanded ? words(locale, "收起", "Hide") : words(locale, "展开", "Show")}</span></button>
    <div id="filter-fields" className={expanded ? "filter-fields expanded" : "filter-fields"}>
      <div className="filter-heading"><h2>{words(locale, "筛选条件", "Filters")}</h2><Link href={path}>{words(locale, "清除全部", "Clear all")}</Link></div>
      <form action={path} method="get" key={`${locale}:${JSON.stringify(query)}`}>
        {!directory && <><div className="field"><label htmlFor="q">{words(locale, "专业关键词", "Course keyword")}</label><input id="q" name="q" type="search" list="planning-course-suggestions" autoComplete="off" maxLength={100} defaultValue={first(query, "q")} /><SearchSuggestionList id="planning-course-suggestions" suggestions={courseSuggestions(locale)} /><small>{words(locale, "输入关键词时可选择建议的专业方向。", "Choose a suggested subject while entering a keyword.")}</small></div>
          {select("category", "专业分类 / 领域", "Subject category / field", [])}<small>{words(locale, "专业分类确认后将在此提供。", "Subject categories will appear after approval.")}</small>
          {select("level", "学历层次", "Qualification", levels)}
        </>}
        {directory && select("continent", "洲际", "Continent", continents)}
        {select("country", "国家", "Country", countries)}
        {!directory && <>
          {select("mode", "课程模式", "Course mode", [["taught", "授课型", "Taught"], ["mixed", "混合型", "Mixed"], ["research", "研究型", "Research"]])}
          {select("language", "授课语言", "Teaching language", [])}<small>{words(locale, "授课语言选项确认后将在此提供。", "Teaching-language options will appear after approval.")}</small>
          <div className="field"><label htmlFor="duration">{words(locale, "学制（月）", "Duration (months)")}</label><input type="number" id="duration" name="duration" min="1" step="1" defaultValue={first(query, "duration")} /></div>
          <div className="field"><label htmlFor="intake">{words(locale, "入学年月", "Intake month")}</label><input type="month" id="intake" name="intake" defaultValue={first(query, "intake")} /></div>
          <fieldset><legend>{words(locale, "学费（人民币）", "Tuition (CNY)")}</legend><div className="field"><label htmlFor="tuitionMin">{words(locale, "最低学费", "Minimum tuition")}</label><input id="tuitionMin" name="tuitionMin" type="number" min="0" step="0.01" defaultValue={first(query, "tuitionMin")} /></div><div className="field"><label htmlFor="tuitionMax">{words(locale, "最高学费", "Maximum tuition")}</label><input id="tuitionMax" name="tuitionMax" type="number" min="0" step="0.01" defaultValue={first(query, "tuitionMax")} /></div><small>{words(locale, "计费周期及范围规则待确认。", "Fee period and range rules are awaiting approval.")}</small></fieldset>
          <input type="hidden" name="sort" value="relevance" />
        </>}
        {directory && first(query, "q") && <input type="hidden" name="q" value={first(query, "q")} />}
        <p className="filter-note">{words(locale, "所有筛选条件必须同时满足。", "All selected conditions must match.")}</p>
        <button type="submit" className="full-width">{words(locale, "应用筛选", "Apply filters")}</button>
      </form>
    </div>
  </aside>;
}
