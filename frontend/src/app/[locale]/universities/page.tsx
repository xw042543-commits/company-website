import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { SchoolCard } from "@/components/school-card";
import { Pagination } from "@/components/pagination";
import { getSchools } from "@/lib/universities";
import { first, isLocale, pageNumber, Query, words } from "@/lib/site";
export default async function Universities({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const geography = !!(first(query, "country") || first(query, "continent"));
  const result = geography ? null : await getSchools(first(query, "q").slice(0, 100));
  const schools = result?.status === "ready" ? result.schools : [];
  const page = Math.min(pageNumber(first(query, "page")), Math.max(1, Math.ceil(schools.length / 12)));
  return <main id="main" className="container page-main"><p className="eyebrow">{words(locale, "探索院校", "EXPLORE UNIVERSITIES")}</p><h1>{words(locale, "院校一览", "Universities")}</h1>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} directory /><section aria-label={words(locale, "院校列表", "University list")}>
      <form method="get" action={`/${locale}/universities`} className="directory-search"><label htmlFor="school-search">{words(locale, "院校名称或国家", "University name or country")}</label><div className="search-row"><input key={first(query, "q")} id="school-search" type="search" name="q" maxLength={100} defaultValue={first(query, "q")} /><button>{words(locale, "搜索", "Search")}</button></div>{["country", "continent"].map(key => first(query, key) ? <input key={key} type="hidden" name={key} value={first(query, key)} /> : null)}</form>
      <div className="results-heading"><h2>{words(locale, "院校列表", "University list")}</h2><span>{words(locale, "每页 12 所", "12 universities per page")}</span></div>
      {result?.status === "ready" && <p className="muted">{words(locale, `${schools.length} 所院校 · 当前接口顺序，相关度排序待接入`, `${schools.length} universities · Current API order; relevance ranking is pending`)}</p>}
      {geography ? <ResultsState locale={locale} state="pending" /> : result?.status === "ready" ? schools.length ? schools.slice((page - 1) * 12, page * 12).map(school => <SchoolCard key={school.id} school={school} locale={locale} />) : <ResultsState locale={locale} state="empty" /> : <ResultsState locale={locale} state={result?.status ?? "unconfigured"} />}
      <Pagination locale={locale} path={`/${locale}/universities`} query={query} page={page} total={schools.length} />
    </section></div>
  </main>;
}
