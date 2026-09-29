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
import { serverApiBaseUrl } from "@/lib/runtime-config";
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

const sectionCopy = {
  language: {
    label: ["洋豆角语言", "UDAJO Language"],
    title: ["语言学习", "Language learning"],
    description: ["提供 4980 元一期的封闭式雅思培训、语言规则讲解与真实出分案例。", "Explore focused IELTS training from CNY 4,980 per session, practical language guidance, and verified result stories."],
  },
  scholarships: {
    label: ["奖学金计划", "Scholarship opportunities"],
    title: ["洋豆角奖学金", "UDAJO Scholarships"],
    description: ["帮助更多学生去看世界，了解不同院校的奖学金机会。", "Helping more students see the world through scholarship opportunities from different universities."],
  },
  news: {
    label: ["行业动态与洋豆角资讯", "Industry and UDAJO updates"],
    title: ["关注第一手信息", "Follow the latest information"],
    description: ["查看经过审核的留学行业动态与公司资讯。", "Read reviewed study-abroad industry updates and company news."],
  },
  about: {
    label: ["关于洋豆角", "About UDAJO"],
    title: ["让留学变得更简单", "Making study abroad simpler"],
    description: ["了解洋豆角的品牌理念与联系方式。", "Learn about UDAJO and how to contact our team."],
  },
} as const;

type ContentSectionProps = {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<Query>;
};

export default async function ContentSection({ params, searchParams }: ContentSectionProps) {
  const { locale, section } = await params;
  if (!isLocale(locale)) notFound();
  const item = navigation.find(([path]) => path === section);
  if (!item || !(section in sectionCopy)) notFound();
  if (section === "about") return <CompanyProfilePage locale={locale} />;

  if (!isArticleSection(section)) notFound();
  const query = await searchParams;
  const requestedPage = normalizeArticlePage(pageNumber(first(query, "page")));
  const result = await getArticles(
    serverApiBaseUrl(),
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
    <p className="section-label">{words(locale, sectionCopy[section].label[0], sectionCopy[section].label[1])}</p>
    <h1>{words(locale, sectionCopy[section].title[0], sectionCopy[section].title[1])}</h1>
    <p className="page-intro">{words(
      locale,
      sectionCopy[section].description[0],
      sectionCopy[section].description[1],
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
