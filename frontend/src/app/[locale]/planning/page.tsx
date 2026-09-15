import { notFound } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsState } from "@/components/results-state";
import { SchoolCard } from "@/components/school-card";
import { Pagination } from "@/components/pagination";
import { isLocale, Query, words } from "@/lib/site";
export default async function Planning({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  return <main id="main" className="container page-main">
    <p className="eyebrow">{words(locale, "留学规划", "STUDY PLANNING")}</p><h1>{words(locale, "规划", "Planning")}</h1>
    <p className="page-intro">{words(locale, "按学习方向与留学条件查询匹配院校。", "Find universities that match your study interests and requirements.")}</p>
    <div className="listing-layout"><FilterPanel locale={locale} query={query} /><section aria-label={words(locale, "院校结果", "University results")}>
      <div className="results-heading"><h2>{words(locale, "匹配院校", "Matching universities")}</h2><span>{words(locale, "相关度排序 · 每页 12 所", "Relevance · 12 universities per page")}</span></div>
      <ResultsState locale={locale} state="pending" />
      <details className="structure-preview" open><summary>{words(locale, "查看卡片结构（非搜索结果）", "Card structure preview (not a search result)")}</summary><SchoolCard locale={locale} /></details>
      <Pagination locale={locale} path={`/${locale}/planning`} query={query} page={1} total={0} />
    </section></div>
  </main>;
}
