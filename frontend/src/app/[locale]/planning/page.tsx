import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { Pagination } from "@/components/pagination";
import { SchoolCard } from "@/components/school-card";
import { getFilterOptions } from "@/lib/filter-options-api";
import { getUniversitySearch } from "@/lib/universities";
import { isLocale, Query, words } from "@/lib/site";

export default async function Planning({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
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
    <p className="section-label">{words(locale, "规划专业", "Plan your course direction")}</p>
    <h1>{words(locale, "选专业定方向", "Choose a course and direction")}</h1>
    <p className="page-intro">{words(locale, "点击下方设置筛选条件，查找同时符合学习方向与留学要求的院校和专业。", "Use the filters below to find universities and programmes that match your study direction and requirements.")}</p>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} options={options} /><section aria-label={words(locale, "院校结果", "University results")}>
      <div className="results-heading"><h2>{words(locale, "匹配院校", "Matching universities")}</h2><span>{words(locale, "相关度排序，每页 12 所", "Relevance order, 12 per page")}</span></div>
      {result.status === "ready" && <p className="muted results-summary">{words(locale, `找到 ${totalItems} 所匹配院校。`, `${totalItems} matching universities found.`)}</p>}
      {result.status === "ready" ? schools.length ? schools.map(school => <SchoolCard key={school.id} school={school} locale={locale} />) : <ResultsState locale={locale} state="empty" actionHref={`/${locale}/planning`} /> : <ResultsState locale={locale} state="error" />}
      <Pagination locale={locale} path={`/${locale}/planning`} query={query} page={page} total={totalItems} />
    </section></div>
  </main>;
}
