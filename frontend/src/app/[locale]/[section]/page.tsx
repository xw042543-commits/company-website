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
    label: ["语言学习与考试准备", "Language learning and test preparation"],
    title: ["语言学习", "Language learning"],
    description: ["提供每期 4,980 元的封闭式雅思培训，并结合实用语言指导与真实成绩案例。", "Explore an intensive IELTS programme delivered in a closed learning environment at CNY 4,980 per session, supported by practical language guidance and verified student results."],
  },
  scholarships: {
    label: ["奖学金计划", "Scholarship opportunities"],
    title: ["洋豆角奖学金", "UDAJO Scholarships"],
    description: ["了解不同院校的奖学金机会、申请条件与重要时间安排。", "Explore scholarship opportunities, eligibility requirements, and key application dates across universities."],
  },
  news: {
    label: ["留学资讯与公司动态", "Study abroad insights and company updates"],
    title: ["掌握最新留学资讯", "Stay informed with the latest updates"],
    description: ["获取经过审核的留学政策、院校动态与洋豆角资讯。", "Read reviewed updates on study policies, universities, and UDAJO."],
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
