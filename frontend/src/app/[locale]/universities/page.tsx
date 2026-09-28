import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { SchoolCard } from "@/components/school-card";
import { Pagination } from "@/components/pagination";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { UniversityComparison } from "@/components/university-comparison";
import { universitySuggestions } from "@/data/search-suggestions";
import { getFilterOptions } from "@/lib/filter-options-api";
import { getUniversitySearch } from "@/lib/universities";
import { first, isLocale, Query, words } from "@/lib/site";

export default async function Universities({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const [result, filterResult] = await Promise.all([
    getUniversitySearch(query, locale),
    getFilterOptions(process.env.NEXT_PUBLIC_API_BASE_URL),
  ]);
  const options = filterResult.status === "ready" ? filterResult.options : undefined;
  const schools = result.status === "ready" ? result.schools : [];
  const page = result.status === "ready" ? result.page : 1;
  const totalItems = result.status === "ready" ? result.totalItems : 0;

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, "留学目的地", "Study destinations")}</p>
    <h1>{words(locale, "院校一览", "Universities")}</h1>
    <p className="page-intro">{words(locale, "按院校名称、国家或地区查找已审核的院校资料。", "Find reviewed university information by name, country, or region.")}</p>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} options={options} directory /><section aria-label={words(locale, "院校列表", "University list")}>
      <form method="get" action={`/${locale}/universities`} className="directory-search"><label htmlFor="school-search">{words(locale, "院校名称或国家", "University name or country")}</label><div className="search-row"><SearchAutocomplete key={first(query, "q")} id="school-search" name="q" locale={locale} suggestions={universitySuggestions(locale)} defaultValue={first(query, "q")} /><button>{words(locale, "搜索院校", "Search universities")}</button></div>{first(query, "country") ? <input type="hidden" name="country" value={first(query, "country")} /> : null}</form>
      <div className="results-heading"><h2>{words(locale, "院校列表", "University list")}</h2><span>{words(locale, "每页 12 所", "12 universities per page")}</span></div>
      {result.status === "ready" && <p className="muted results-summary">{words(locale, `找到 ${totalItems} 所已审核院校。`, `${totalItems} reviewed universities found.`)}</p>}
      {result.status === "ready" ? schools.length ? schools.map(school => <SchoolCard key={school.id} school={school} locale={locale} />) : <ResultsState locale={locale} state="empty" actionHref={`/${locale}/universities`} /> : <ResultsState locale={locale} state="error" />}
      <Pagination locale={locale} path={`/${locale}/universities`} query={query} page={page} total={totalItems} />
    </section></div>
    <UniversityComparison locale={locale} />
  </main>;
}
