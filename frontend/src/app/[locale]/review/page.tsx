import { notFound } from "next/navigation";
import { ResultsState } from "@/components/results-state";
import { SchoolCard } from "@/components/school-card";
import { Pagination } from "@/components/pagination";
import { first, isLocale, pageNumber, Query, words } from "@/lib/site";
export default async function Review({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const page = Math.min(3, pageNumber(first(query, "page")));
  return <main id="main" className="container page-main"><p className="eyebrow">{words(locale, "组件审核", "COMPONENT REVIEW")}</p><h1>{words(locale, "组件与状态", "Components and states")}</h1><p className="page-intro">{words(locale, "此页仅供结构审核，所有示例均非正式搜索结果。", "For structure review only. None of these examples are live search results.")}</p>
    <section className="review-section"><h2>{words(locale, "一校一卡 · 最多三个匹配专业", "One school per card · Up to three matching courses")}</h2><SchoolCard locale={locale} /></section>
    <section className="review-section"><h2>{words(locale, "加载中、无结果与错误", "Loading, empty and error states")}</h2>{(["loading", "empty", "error", "unconfigured"] as const).map(state => <ResultsState key={state} locale={locale} state={state} />)}</section>
    <section className="review-section"><h2>{words(locale, "分页交互示例", "Pagination interaction example")}</h2><p>{words(locale, "仅使用 25 条记录的数量测试三页分页，不生成院校资料。每页最多 12 所。", "A count of 25 tests three pages without generating university records. Maximum 12 per page.")}</p><Pagination locale={locale} path={`/${locale}/review`} query={query} page={page} total={25} /></section>
  </main>;
}
