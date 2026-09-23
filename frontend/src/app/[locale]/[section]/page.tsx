import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CompanyProfilePage } from "@/components/company-profile-page";
import { Pagination } from "@/components/pagination";
import {
  getArticles,
  isArticleSection,
  localizeArticleSummary,
  normalizeArticlePage,
} from "@/lib/article-api";
import {
  boundedPage,
  first,
  isLocale,
  navigation,
  pageLink,
  pageNumber,
  type Query,
  words,
} from "@/lib/site";

const descriptions = {
  language: ["语言考试与准备资料。", "Language-test and preparation information."],
  scholarships: ["奖学金资格与申请资讯。", "Scholarship eligibility and application information."],
  programmes: ["留学项目内容与报名安排。", "Study-abroad programmes and enrolment information."],
  news: ["已审核的留学资讯与公司动态。", "Reviewed study-abroad updates and company news."],
  about: ["公司介绍与联系资料确认后将在此发布。", "Approved company and contact information will be published here."],
} as const;

type ContentSectionProps = {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<Query>;
};

export default async function ContentSection({ params, searchParams }: ContentSectionProps) {
  const { locale, section } = await params;
  if (!isLocale(locale)) notFound();
  const item = navigation.find(([path]) => path === section);
  if (!item || !(section in descriptions)) notFound();
  if (section === "about") return <CompanyProfilePage locale={locale} />;

  if (!isArticleSection(section)) notFound();
  const query = await searchParams;
  const requestedPage = normalizeArticlePage(pageNumber(first(query, "page")));
  const result = await getArticles(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    section,
    requestedPage,
  );
  const sectionPath = `/${locale}/${section}`;

  if (result.status === "ready") {
    const normalizedPage = boundedPage(result.page.page, result.page.totalPages);
    if (normalizedPage !== result.page.page) {
      redirect(pageLink(sectionPath, query, normalizedPage));
    }
  }

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, "UDAJO 资讯", "UDAJO information")}</p>
    <h1>{words(locale, item[1], item[2])}</h1>
    <p className="page-intro">{words(
      locale,
      descriptions[section][0],
      descriptions[section][1],
    )}</p>

    {result.status === "error"
      ? <div className="results-state" role="alert">
        <span className="state-symbol" aria-hidden="true">!</span>
        <h2>{words(locale, "资讯暂时无法加载", "Information is temporarily unavailable")}</h2>
        <p>{words(locale, "请稍后刷新页面重试。", "Please refresh the page and try again later.")}</p>
      </div>
      : result.page.items.length === 0
        ? <div className="results-state" role="status">
          <span className="state-symbol" aria-hidden="true">○</span>
          <h2>{words(locale, "暂无已发布内容", "No published information yet")}</h2>
          <p>{words(locale, "内容审核并发布后将在这里显示。", "Information will appear here after review and publication.")}</p>
        </div>
        : <>
          <div className="results-heading article-results-heading">
            <h2>{words(locale, "最新内容", "Latest information")}</h2>
            <span>{words(
              locale,
              `共 ${result.page.totalItems} 篇`,
              `${result.page.totalItems} articles`,
            )}</span>
          </div>
          <div className="article-list">
            {result.page.items.map((article) => {
              const localized = localizeArticleSummary(article, locale);
              const articlePath = `${sectionPath}/${encodeURIComponent(article.slug)}`;
              return <article className="article-card" key={`${article.section}/${article.slug}`}>
                <p className="article-date">
                  <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
                </p>
                <h2 lang={localized.title.lang}><Link href={articlePath}>{localized.title.text}</Link></h2>
                {localized.summary.text && <p lang={localized.summary.lang}>{localized.summary.text}</p>}
                <Link className="article-read-link" href={articlePath}>
                  {words(locale, "阅读全文", "Read article")} <span aria-hidden="true">→</span>
                </Link>
              </article>;
            })}
          </div>
          <Pagination
            locale={locale}
            path={sectionPath}
            query={query}
            page={result.page.page}
            total={result.page.totalItems}
          />
        </>}
  </main>;
}

function formatPublishedDate(value: string, locale: "zh" | "en") {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: locale === "zh" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
