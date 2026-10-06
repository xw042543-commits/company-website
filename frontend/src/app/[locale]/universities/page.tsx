import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { SchoolCard } from "@/components/school-card";
import { Pagination } from "@/components/pagination";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { UniversityComparison } from "@/components/university-comparison";
import { ComparisonTray } from "@/components/comparison-tray";
import { universitySuggestions } from "@/data/search-suggestions";
import { getFilterOptions } from "@/lib/filter-options-api";
import { serverApiBaseUrl } from "@/lib/runtime-config";
import { getUniversitySearch } from "@/lib/universities";
import { first, isLocale, Query, words } from "@/lib/site";

export default async function Universities({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const baseUrl = serverApiBaseUrl();
  const [result, filterResult] = await Promise.all([
    getUniversitySearch(query, locale, baseUrl),
    getFilterOptions(baseUrl),
  ]);
  const options = filterResult.status === "ready" ? filterResult.options : undefined;
  const schools = result.status === "ready" ? result.schools : [];
  const page = result.status === "ready" ? result.page : 1;
  const totalItems = result.status === "ready" ? result.totalItems : 0;

  return <main id="main" className="container page-main listing-page">
    <p className="section-label">{words(locale, "留学目的地", "Study destinations")}</p>
    <h1>{words(locale, "院校一览", "Universities")}</h1>
    <p className="page-intro">{words(locale, "按院校名称、国家或地区，查找经团队审核的院校资料。", "Search reviewed university profiles by name, country or region.")}</p>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} options={options} directory /><section className="listing-results" aria-label={words(locale, "院校列表", "University list")}>
      <div className="directory-search-sticky"><form method="get" action={`/${locale}/universities`} className="directory-search"><label htmlFor="school-search">{words(locale, "院校名称或国家", "University name or country")}</label><div className="search-row"><SearchAutocomplete key={first(query, "q")} id="school-search" name="q" locale={locale} suggestions={universitySuggestions(locale)} defaultValue={first(query, "q")} /><button>{words(locale, "搜索院校", "Search universities")}</button></div>{first(query, "country") ? <input type="hidden" name="country" value={first(query, "country")} /> : null}</form></div>
      <div className="results-heading"><h2>{words(locale, "院校列表", "University list")}</h2><span>{words(locale, "每页 12 所", "12 universities per page")}</span></div>
      {result.status === "ready" && <p className="muted results-summary">{words(locale, `找到 ${totalItems} 所院校。`, `${totalItems} universities found.`)}</p>}
      {result.status === "ready" ? schools.length ? <div className="school-results-grid">{[0, 1].map(column => <div className="school-results-column" key={column}>{schools.map((school, index) => index % 2 === column ? <div className="school-result-item" style={{ order: index }} key={school.id}><SchoolCard school={school} locale={locale} /></div> : null)}</div>)}</div> : <ResultsState locale={locale} state="empty" actionHref={`/${locale}/universities`} /> : <ResultsState locale={locale} state="error" />}
      <Pagination locale={locale} path={`/${locale}/universities`} query={query} page={page} total={totalItems} />
    </section></div>
    <UniversityComparison locale={locale} /><ComparisonTray locale={locale} onDirectory />
  </main>;
}
