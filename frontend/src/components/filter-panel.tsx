"use client";
import Link from "next/link";
import { useState } from "react";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { courseSuggestions } from "@/data/search-suggestions";
import type { FilterOptions } from "@/lib/filter-options-api";
import { Locale, Query, first, words } from "@/lib/site";
type Option = readonly [string, string, string];
export function FilterPanel({ locale, query, options, directory = false }: { locale: Locale; query: Query; options?: FilterOptions; directory?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const path = `/${locale}/${directory ? "universities" : "planning"}`;
  const filterNames = directory
    ? ["country"]
    : ["q", "category", "level", "country", "mode", "language", "duration", "intake", "tuitionMin", "tuitionMax"];
  const advancedNames = ["mode", "language", "duration", "intake", "tuitionMin", "tuitionMax"];
  const activeCount = filterNames.filter((name) => Boolean(first(query, name))).length;
  const hasAdvancedFilters = advancedNames.some((name) => Boolean(first(query, name)));
  const optionTuples = (items: FilterOptions[keyof FilterOptions] | undefined): Option[] =>
    items?.map((item) => [item.code, item.nameZh, item.nameEn]) ?? [];
  const select = (name: string, zh: string, en: string, options: readonly Option[]) => {
    const value = first(query, name);
    const unknown = value && !options.some(([id]) => id === value);
    return <div className="field" key={name}><label htmlFor={name}>{words(locale, zh, en)}</label><select id={name} name={name} defaultValue={value}>
      <option value="">{words(locale, "全部", "All")}</option>
      {unknown && <option value={value}>{words(locale, "待确认的选项", "Unconfirmed option")}: {value}</option>}
      {options.map(([id, a, b]) => <option key={id} value={id}>{words(locale, a, b)}</option>)}
    </select></div>;
  };
  return <aside className="filter-panel" aria-label={words(locale, "筛选院校和专业", "Filter universities and programmes")}>
    <button type="button" className="mobile-filter-toggle" aria-expanded={expanded} aria-controls="filter-fields" onClick={() => setExpanded(!expanded)}><span>{words(locale, "筛选条件", "Filters")}{activeCount > 0 && <span className="filter-count">{activeCount}</span>}</span><span>{expanded ? words(locale, "收起", "Hide") : words(locale, "展开", "Show")}</span></button>
    <div id="filter-fields" className={expanded ? "filter-fields expanded" : "filter-fields"}>
      <div className="filter-heading"><div><p className="filter-eyebrow">{words(locale, "缩小搜索范围", "Narrow your search")}</p><h2>{words(locale, "筛选条件", "Filters")}{activeCount > 0 && <span className="filter-count">{activeCount}</span>}</h2></div>{activeCount > 0 && <Link href={path}>{words(locale, "重置", "Reset")}</Link>}</div>
      <form action={path} method="get" key={`${locale}:${JSON.stringify(query)}`}>
        {!options && <p className="filter-note">{words(locale, "筛选选项暂时无法加载，仍可使用关键词搜索。", "Filter options are temporarily unavailable. Keyword search is still available.")}</p>}
        <div className="filter-group"><p className="filter-group-title">{words(locale, directory ? "院校所在地" : "主要条件", directory ? "University location" : "Essentials")}</p>
        {!directory && <><div className="field"><label htmlFor="q">{words(locale, "专业关键词", "Course keyword")}</label><SearchAutocomplete id="q" name="q" locale={locale} suggestions={courseSuggestions(locale)} defaultValue={first(query, "q")} /><small>{words(locale, "输入专业名称或关键词", "Enter a programme or keyword")}</small></div>
          {select("category", "专业分类 / 领域", "Subject category / field", optionTuples(options?.subjectCategories))}
          {select("level", "学历层次", "Qualification", optionTuples(options?.studyLevels))}
        </>}
        {select("country", "国家或地区", "Country or region", optionTuples(options?.countries))}</div>
        {!directory && <details className="advanced-filters" open={hasAdvancedFilters || undefined}>
          <summary><span>{words(locale, "更多筛选", "More filters")}</span><span className="advanced-filter-hint">{words(locale, "课程形式、时间与费用", "Mode, timing and fees")}</span><span className="filter-chevron" aria-hidden="true" /></summary>
          <div className="advanced-filter-fields">
          {select("mode", "课程模式", "Course mode", optionTuples(options?.courseModes))}
          {select("language", "授课语言", "Teaching language", optionTuples(options?.languages))}
          <div className="filter-pair"><div className="field"><label htmlFor="duration">{words(locale, "学制（月）", "Duration (months)")}</label><input type="number" id="duration" name="duration" min="1" step="1" defaultValue={first(query, "duration")} /></div>
          <div className="field"><label htmlFor="intake">{words(locale, "入学年月", "Intake month")}</label><input type="month" id="intake" name="intake" defaultValue={first(query, "intake")} /></div></div>
          <fieldset><legend>{words(locale, "学费范围（人民币）", "Tuition range (CNY)")}</legend><div className="filter-pair"><div className="field"><label htmlFor="tuitionMin">{words(locale, "最低", "Minimum")}</label><input id="tuitionMin" name="tuitionMin" type="number" min="0" step="0.01" defaultValue={first(query, "tuitionMin")} /></div><div className="field"><label htmlFor="tuitionMax">{words(locale, "最高", "Maximum")}</label><input id="tuitionMax" name="tuitionMax" type="number" min="0" step="0.01" defaultValue={first(query, "tuitionMax")} /></div></div><small>{words(locale, "实际学费请向顾问确认。", "Confirm current fees with an adviser.")}</small></fieldset>
          </div>
          <input type="hidden" name="sort" value="relevance" />
        </details>}
        {directory && first(query, "q") && <input type="hidden" name="q" value={first(query, "q")} />}
        <div className="filter-actions"><p>{activeCount > 0 ? words(locale, `已选择 ${activeCount} 项条件`, `${activeCount} filter${activeCount === 1 ? "" : "s"} selected`) : words(locale, "选择条件以缩小结果范围", "Choose filters to narrow the results")}</p><button type="submit" className="full-width">{words(locale, "查看匹配结果", "Show matching results")}</button>{activeCount > 0 && <Link href={path}>{words(locale, "清除全部筛选", "Clear all filters")}</Link>}</div>
      </form>
    </div>
  </aside>;
}
