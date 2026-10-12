import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { Pagination } from "@/components/pagination";
import { SchoolCard } from "@/components/school-card";
import { ComparisonTray } from "@/components/comparison-tray";
import { getFilterOptions } from "@/lib/filter-options-api";
import { serverApiBaseUrl } from "@/lib/runtime-config";
import { getUniversitySearch } from "@/lib/universities";
import { isLocale, Query, words } from "@/lib/site";

export default async function Planning({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const baseUrl = serverApiBaseUrl();
  const filterResult = await getFilterOptions(baseUrl);
  const options = filterResult.status === "ready" ? filterResult.options : undefined;
  const result = await getUniversitySearch(query, locale, baseUrl, {
    programmeSearch: true,
    filterOptions: options,
  });
  const schools = result.status === "ready" ? result.schools : [];
  const page = result.status === "ready" ? result.page : 1;
  const totalItems = result.status === "ready" ? result.totalItems : 0;

  return <main id="main" className="container page-main listing-page">
    <p className="section-label">{words(locale, "规划专业", "Programme planning")}</p>
    <h1>{words(locale, "选专业，定方向", "Find a programme that suits you")}</h1>
    <p className="page-intro">{words(locale, "选择下方筛选条件，系统将自动匹配适合你的院校与专业。", "Use the filters to find universities and programmes that match what you want to study.")}</p>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} options={options} /><section className="listing-results" aria-label={words(locale, "院校结果", "University results")}>
      <div className="results-heading"><h2>{words(locale, "匹配院校", "University matches")}</h2><span>{words(locale, "按相关度排序 · 每页 12 所", "Most relevant first · 12 per page")}</span></div>
      {result.status === "ready" && <p className="muted results-summary">{words(locale, `找到 ${totalItems} 所匹配院校。`, `${totalItems} matching universities found.`)}</p>}
      {result.status === "ready" ? schools.length ? <div className="school-results-grid">{[0, 1].map(column => <div className="school-results-column" key={column}>{schools.map((school, index) => index % 2 === column ? <div className="school-result-item" style={{ order: index }} key={school.id}><SchoolCard school={school} locale={locale} /></div> : null)}</div>)}</div> : <ResultsState locale={locale} state="empty" actionHref={`/${locale}/planning`} /> : <ResultsState locale={locale} state="error" />}
      <Pagination locale={locale} path={`/${locale}/planning`} query={query} page={page} total={totalItems} />
    </section></div><ComparisonTray locale={locale} />
  </main>;
}
