import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { Pagination } from "@/components/pagination";
import { isLocale, Query, words } from "@/lib/site";

export default async function Planning({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, "按条件缩小选择", "Narrow your options")}</p>
    <h1>{words(locale, "规划留学选择", "Plan your study options")}</h1>
    <p className="page-intro">{words(locale, "按学习方向和留学条件设置筛选。匹配服务接入后，符合全部条件的院校将在这里显示。", "Set your study interests and requirements. Universities matching every selected condition will appear when the matching service is connected.")}</p>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} /><section aria-label={words(locale, "院校结果", "University results")}>
      <div className="results-heading"><h2>{words(locale, "匹配院校", "Matching universities")}</h2><span>{words(locale, "相关度排序，每页 12 所", "Relevance order, 12 per page")}</span></div>
      <ResultsState locale={locale} state="pending" />
      <Pagination locale={locale} path={`/${locale}/planning`} query={query} page={1} total={0} />
    </section></div>
  </main>;
}
